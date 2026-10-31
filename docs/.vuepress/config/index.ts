import * as zhConfig from './zh'
import { RecoThemeData } from 'vuepress-theme-reco/lib/types'

export const themeConfig: RecoThemeData = {
  locales: {
    '/': {
      selectLanguageName: '简体中文',
      lastUpdatedText: '最后更新时间',
      navbar: zhConfig.navbar,
      series: zhConfig.series,
      catalogTitle: '页面导航',
      tip: '提示',
      info: '信息',
      warning: '警告',
      danger: '危险',
      details: '详情',
      editLinkText: '编辑当前页面',
      notFound: '哇哦，没有发现这个页面！',
      backToHome: '返回首页'
    },
  },
  colorMode: 'dark',
  logo: '/logo.png',
  author: 'appkr',
  docsRepo: 'https://github.com/appkr-cn/appkr-cn',
  docsBranch: 'main',
  docsDir: 'docs',
}
