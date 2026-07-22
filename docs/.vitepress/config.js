import { defineConfig } from 'vitepress'
import { demoblockPlugin, demoblockVitePlugin } from 'vitepress-theme-demoblock'

export default defineConfig({
  title: 'AppKr',
  description: 'AppKr.cn - Aiagent-skills',
  base: '/',
  lang: 'zh-CN',
  markdown: {
    config: (md) => {
      md.use(demoblockPlugin)
    }
  },
  vite: {
    plugins: [demoblockVitePlugin()]
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: 'aiAgents', link: '/aiAgents/' }
    ],
    sidebar: {
      '/aiAgents/': [
        {
          text: 'aiAgents 导航',
          items: [
            { text: '概述', link: '/aiAgents/' },
            { text: 'AI 平台', link: '/aiAgents/ai' },
            { text: 'Agent 框架', link: '/aiAgents/agent' },
            { text: 'Skills & Tools', link: '/aiAgents/skills' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/appkr-cn' }
    ],
    footer: {
      message: 'AppKr.cn - 探索 AI、Agent 与 Skills 的无限可能',
      copyright: 'Copyright © 2026 AppKr'
    },
    demoblock: {
      'zh': {
        'view-source': '查看源代码',
        'hide-source': '隐藏源代码',
        'edit-in-editor': '在 Playground 中编辑',
        'edit-on-github': '在 Github 中编辑',
        'copy-code': '复制代码',
        'copy-success': '复制成功',
        'copy-error': '复制失败'
      }
    }
  }
})
