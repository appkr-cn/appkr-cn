---
home: true
modules:
  - CustomBanner
  - Features
  - MdContent
  - Footer
customBanner:
  bgImage: '/bg.svg'
  title: appkr
  description: '个人站点，持续建设中。'
  tagline: 用 VuePress + reco 主题搭建，内容以笔记、工具与项目记录为主。
  buttons:
    - { text: 关于本站, link: '/about', type: 'plain' }
  socialLinks:
    - { icon: 'LogoGithub', link: 'https://github.com/appkr-cn' }
footer:
  startYear: 2026
features:
  - title: 笔记
    details: 技术笔记与踩坑记录，随手写下，方便回查。
  - title: 工具
    details: 自用的小工具与脚本，能用就分享出来。
  - title: 项目
    details: 正在做和做过的项目归档。
---

## 你好

这里是 appkr 的个人站点，目前刚完成搭建，内容还在陆续补充。

- 站点基于 [VuePress 2](https://v2.vuepress.vuejs.org/) + [reco 主题](https://vuepress-theme-reco.recoluan.com/) 构建
- 源码托管在 [GitHub](https://github.com/appkr-cn/appkr-cn)，推送到 `main` 后由 GitHub Actions 自动构建部署
