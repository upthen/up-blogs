// import { defineConfig } from "vitepress";
import { withMermaid } from 'vitepress-plugin-mermaid'
import { defineConfig } from 'vitepress'
import UnoCss from 'unocss/vite'
import UnoConfig from '../uno.config'
import { presetIcons } from 'unocss'
import presetMini from '@unocss/preset-mini'
import { presetTheme } from 'unocss-preset-theme'
import type { Theme } from 'unocss/preset-uno'
import { light, dark } from './theme/unoTheme'
import path from 'path'
import sysPreflights from './sysPreflights'

// https://vitepress.dev/reference/site-config
export default withMermaid({
	assetsDir: 'static',
	lang: 'zh-CN',
	title: '闻 · 斋',
	themeConfig: {
		search: {
			provider: 'local'
		},
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: '我', link: '/' },
			{ text: '前端', link: '/fe/' },
			{ text: '历史', link: '/history/' },
			{ text: '读诗', link: '/poetry/' }
		],
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/upthen/up-blogs' }
		]
	}
})
