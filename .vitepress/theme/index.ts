// https://vitepress.dev/guide/custom-theme
import Layout from './Layout.vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import 'virtual:uno.css'
import './style.css'
import './font.css'
import './animation.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import { generateHanziSVG } from '../faviconGene'

const theme = {
	extends: DefaultTheme,
	Layout,
	enhanceApp({ app, router, siteData }) {
		app.use(ElementPlus)

		// 初始设置
		if (typeof window !== 'undefined') {
			const favicon = document.querySelector('link[rel="icon"]')
			if (favicon) {
				// favicon.href = generateHanziSVG('闻')
				Object.assign(favicon, {
					href: generateHanziSVG('闻')
				})
			}
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
	}
} satisfies Theme

export default theme
