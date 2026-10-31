#!/usr/bin/env node
/**
 * 把本地目录同步到 GitHub 仓库的指定分支（等效于强推，只留一次提交）
 *
 * 适用于 git push 被网络策略阻断、但 REST API 可用的环境：
 * 通过 Git Data API 创建 blob / tree / commit，再强制更新 ref。
 * 会先比对远端现有树，只上传内容有变化的文件。
 *
 * 用法:
 *   GH_TOKEN=xxx node scripts/sync-dist.mjs [目录] [分支]
 *
 * 环境变量:
 *   REPO             仓库，默认 appkr-cn/appkr-cn
 *   BRANCH           分支，默认 main（也可用第二个命令行参数指定）
 *   MSG              提交信息
 *   FILELIST         仅同步清单内的文件（每行一个相对路径），用于同步源码
 *   CONCURRENCY      并发数，默认 3
 *   BLOB_INTERVAL_MS blob 上传最小间隔，默认 900ms，用于规避次级限流
 *
 * 示例:
 *   # 同步构建产物
 *   GH_TOKEN=xxx node scripts/sync-dist.mjs docs/.vuepress/dist gh-pages
 *   # 同步源码（尊重 .gitignore）
 *   git -c core.quotepath=false ls-files > .git-files.txt
 *   GH_TOKEN=xxx FILELIST=.git-files.txt node scripts/sync-dist.mjs . main
 */
import { readdir, readFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

const REPO = process.env.REPO || 'appkr-cn/appkr-cn'
const BRANCH = process.argv[3] || process.env.BRANCH || 'main'
const DIR = path.resolve(process.argv[2] || 'docs/.vuepress/dist')
const FILELIST = process.env.FILELIST
const TOKEN = process.env.GH_TOKEN
const MESSAGE = process.env.MSG || `chore: deploy build ${new Date().toISOString().slice(0, 10)}`
const CONCURRENCY = Number(process.env.CONCURRENCY || 3)
/** 两次 blob 上传之间的最小间隔，避免触发 GitHub 次级限流 */
const BLOB_INTERVAL = Number(process.env.BLOB_INTERVAL_MS || 900)

if (!TOKEN) {
  console.error('缺少 GH_TOKEN 环境变量')
  process.exit(1)
}

let nextBlobSlot = 0

/** 上传节流：保证 blob 创建请求之间留有间隔 */
async function throttleBlob() {
  const now = Date.now()
  const slot = Math.max(now, nextBlobSlot)
  nextBlobSlot = slot + BLOB_INTERVAL
  const wait = slot - now
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
}

async function api(endpoint, options = {}) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'sync-dist-script',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  })
  const text = await res.text()
  if (!res.ok) {
    const error = new Error(`${options.method || 'GET'} ${endpoint} -> ${res.status} ${text.slice(0, 300)}`)
    error.status = res.status
    throw error
  }
  return text ? JSON.parse(text) : null
}

/** 带退避重试，主要应对 403 次级限流与 5xx */
async function apiRetry(endpoint, options = {}, attempts = 6) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await api(endpoint, options)
    } catch (error) {
      const retryable = error.status === 403 || error.status === 429 || error.status >= 500
      if (!retryable || attempt >= attempts) throw error
      const waitMs = attempt * 30_000
      console.log(`  ! ${error.status} 触发限流/异常，${waitMs / 1000}s 后重试 (${attempt}/${attempts - 1})`)
      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }
  }
}

/** 计算 git blob 对象的 sha1（与 GitHub 的 blob sha 一致） */
function hashBlob(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`)
  return createHash('sha1').update(Buffer.concat([header, buffer])).digest('hex')
}

/** 递归收集文件（相对路径） */
async function collect(dir, base = '') {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collect(full, rel)))
    } else if (entry.isFile()) {
      files.push({ rel, full, size: (await stat(full)).size })
    }
  }
  return files
}

/** 限制并发的映射 */
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length)
  let cursor = 0
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await fn(items[index], index)
    }
  })
  await Promise.all(workers)
  return results
}

/** 读取远端某次提交的文件树，返回 path -> sha */
async function remoteBlobMap(commitSha) {
  try {
    const commit = await api(`/repos/${REPO}/git/commits/${commitSha}`)
    const tree = await api(`/repos/${REPO}/git/trees/${commit.tree.sha}?recursive=1`)
    if (tree.truncated) return null
    const map = new Map()
    for (const entry of tree.tree) {
      if (entry.type === 'blob') map.set(entry.path, entry.sha)
    }
    return map
  } catch {
    return null
  }
}

async function main() {
  console.log(`仓库: ${REPO}  分支: ${BRANCH}`)
  console.log(`目录: ${DIR}`)

  const files = FILELIST
    ? (await readFile(FILELIST, 'utf8'))
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((rel) => ({ rel, full: path.join(DIR, rel) }))
    : await collect(DIR)

  let totalBytes = 0
  for (const file of files) {
    file.size = (await stat(file.full)).size
    totalBytes += file.size
  }
  console.log(`文件数: ${files.length}  总大小: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`)

  const ref = await api(`/repos/${REPO}/git/ref/heads/${BRANCH}`).catch(() => null)
  const parent = ref?.object.sha
  const remote = parent ? await remoteBlobMap(parent) : null
  console.log(remote ? `远端已有 ${remote.size} 个文件，将只上传变动部分` : '远端无可比对内容，全量上传')

  let uploaded = 0
  const entries = await mapLimit(files, CONCURRENCY, async (file) => {
    const buffer = await readFile(file.full)
    const sha = hashBlob(buffer)
    if (remote && remote.get(file.rel) === sha) {
      return { path: file.rel, mode: '100644', type: 'blob', sha }
    }
    await throttleBlob()
    const blob = await apiRetry(`/repos/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: buffer.toString('base64'), encoding: 'base64' })
    })
    uploaded += 1
    if (uploaded % 10 === 0) console.log(`  已上传 ${uploaded} 个变动文件`)
    return { path: file.rel, mode: '100644', type: 'blob', sha: blob.sha }
  })
  console.log(`上传完成：变动 ${uploaded} 个，复用 ${files.length - uploaded} 个`)

  const tree = await apiRetry(`/repos/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ tree: entries })
  })
  console.log(`tree: ${tree.sha}`)

  const commit = await apiRetry(`/repos/${REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: MESSAGE,
      tree: tree.sha,
      parents: parent ? [parent] : []
    })
  })
  console.log(`commit: ${commit.sha}`)

  if (parent) {
    await apiRetry(`/repos/${REPO}/git/refs/heads/${BRANCH}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: true })
    })
  } else {
    await apiRetry(`/repos/${REPO}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha: commit.sha })
    })
  }
  console.log(`✓ 已更新 ${BRANCH} -> ${commit.sha}`)
  console.log(`  https://github.com/${REPO}/commit/${commit.sha}`)
}

main().catch((error) => {
  console.error('× 同步失败:', error.message)
  process.exit(1)
})
