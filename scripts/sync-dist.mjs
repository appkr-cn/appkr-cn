#!/usr/bin/env node
/**
 * 将构建产物目录同步到 GitHub 仓库指定分支（等效于强推，保留单次提交）
 *
 * 用于 git push 被网络策略阻断、但 REST API 可用的环境。
 *
 * 用法:
 *   GH_TOKEN=xxx node scripts/sync-dist.mjs [产物目录] [分支]
 * 环境变量:
 *   REPO   仓库，默认 appkr-cn/appkr-cn
 *   BRANCH 分支，默认 main
 *   MSG    提交信息
 */
import { readdir, readFile, stat } from 'node:fs/promises'
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

async function main() {
  console.log(`仓库: ${REPO}  分支: ${BRANCH}`)
  console.log(`产物: ${DIR}`)

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

  let done = 0
  const blobs = await mapLimit(files, CONCURRENCY, async (file) => {
    const content = (await readFile(file.full)).toString('base64')
    await throttleBlob()
    const blob = await apiRetry(`/repos/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content, encoding: 'base64' })
    })
    done += 1
    if (done % 25 === 0 || done === files.length) {
      console.log(`  已上传 ${done}/${files.length}`)
    }
    return { path: file.rel, mode: '100644', type: 'blob', sha: blob.sha }
  })

  const tree = await apiRetry(`/repos/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ tree: blobs })
  })
  console.log(`tree: ${tree.sha}`)

  const ref = await api(`/repos/${REPO}/git/ref/heads/${BRANCH}`)
  const parent = ref.object.sha

  const commit = await api(`/repos/${REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message: MESSAGE, tree: tree.sha, parents: [parent] })
  })
  console.log(`commit: ${commit.sha}`)

  await api(`/repos/${REPO}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: true })
  })
  console.log(`✓ 已更新 ${BRANCH} -> ${commit.sha}`)
  console.log(`  https://github.com/${REPO}/commit/${commit.sha}`)
}

main().catch((error) => {
  console.error('× 同步失败:', error.message)
  process.exit(1)
})
