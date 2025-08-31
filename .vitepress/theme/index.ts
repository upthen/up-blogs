// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { generateHanziSVG } from '../favicoGene'
import 'virtual:uno.css'
import './style.css'
import './font.css'
import './animation.css'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
// import './markdown.css'

const theme = {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {
    app.use(PrimeVue, {
      theme: {
        preset: Aura,
      },
    })
    // ...
    console.log('siteData', siteData)
    console.log('router', router)
    console.log('app', app)
    const favicon = document.querySelector('link[rel="icon"]')
    if (favicon) {
      // favicon.href = generateHanziSVG('闻')
      Object.assign(favicon, {
        href: generateHanziSVG('闻'),
      })
    }

    // 初始设置
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const defaultFavicon = document.createElement('link')
        defaultFavicon.rel = 'icon'
        defaultFavicon.href = generateHanziSVG('闻')
        document.head.appendChild(defaultFavicon)
        if (typeof document !== 'undefined' && document.body) {
          document.body.click()
        }
      }, 100)
    }
  },
} satisfies Theme

export default theme
