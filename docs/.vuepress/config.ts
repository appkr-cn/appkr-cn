import { defineUserConfig } from 'vuepress'
import { recoTheme } from 'vuepress-theme-reco'
import { themeConfig } from './config/index'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'appkr',
  description: 'appkr 的个人站点：笔记、工具与项目记录。',
  head: [['link', { rel: 'icon', href: '/favicon.ico' }]],
  bundler: viteBundler({}),
  theme: recoTheme(themeConfig),
})
