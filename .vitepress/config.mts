// import { defineConfig } from "vitepress";
import { withMermaid } from 'vitepress-plugin-mermaid'
import { defineConfig } from 'vitepress'
import Unocss from 'unocss/vite'
import { presetAttributify, presetIcons } from 'unocss'
import { presetWind } from '@unocss/preset-wind3'
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

		sidebar: {
			'/fe/': [
				{
					text: '前端开发',
					collapsed: false,
					items: [
						{
							text: '前端如何管理JS内存',
							link: '/fe/前端如何管理JS内存_2025_08_26/'
						},
						{
							text: 'eslint三元运算符格式化和缩进规则冲突问题',
							link: '/fe/eslint三元运算符格式化和缩进规则冲突问题_2025_08_26/'
						},
						{
							text: '浏览器中实现通话铃声和手机振动的一些注意事项',
							link: '/fe/关于H5应用中实现音频播放和触发手机振动的一些注意事项_2025_0827/'
						},
						{ text: '常用VSCode插件', link: '/fe/常用VSCode插件_-2025_08_26/' },
						{ text: '常用素材网站', link: '/fe/常用素材网站_2025_08_26/' },
						{
							text: '移动端高度兼容性问题',
							link: '/fe/移动端浏览器因工具栏导致的高度兼容性问题_2025_08_26/'
						}
					]
				},
				{
					text: 'AI赋能',
					items: [
						{
							text: 'VibeCoding技巧',
							link: '/fe/VibeCoding技巧_2025_08_26/'
						}
					]
				}
			],
			'/history/': [
				{
					text: '宋代历史研究',
					collapsed: false,
					items: [
						{ text: '历代皇帝', link: '/history/song/历代皇帝/' },
						{ text: '东坡', link: '/history/song/东坡/' }
					]
				}
			]
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/upthen/up-blogs' }
		]
	},
	vite: {
		plugins: [
			Unocss({
				presets: [
					presetWind(),
					presetAttributify(),
					presetIcons(),
					presetTheme<Theme>({
						theme: {
							light,
							dark
						}
					})
				],
				theme: {
					colors: {
						// 主背景色 - 用于页面主体背景
						primary: 'var(--color-primaryGray)',
						// 强调色 - 用于标题、重要文字
						accent: 'var(--color-accentBlack)',
						// 辅助色1 - 用于边框、分隔线、按钮背景
						aux1: 'var(--color-auxGray1)',
						// 辅助色2 - 用于次要文本、图标等
						aux2: 'var(--color-auxGray2)',
						// 动态灰色 - 用于H3标题等中等重要性的元素
						dynamic: 'var(--color-dynamicGray)',
						// 悬停灰色 - 用于按钮、链接的悬停状态
						hover: 'var(--color-hoverGray)',
						// 白色/深色背景 - 用于卡片、内容区块
						white: 'var(--color-white)',
						// 深灰色 - 用于某些特殊元素或强调
						deep: 'var(--color-deepGray)'
					}
				},
				preflights: [
					{
						getCSS: () => `
              :root {
                /* 明亮主题颜色变量 */
                --color-primaryGray: #F5F5F7;   /* 主页面背景色 */
                --color-accentBlack: #212121;   /* 标题和重要文本颜色 */
                --color-auxGray1: #E0E0E0;      /* 边框、分隔线和按钮背景 */
                --color-auxGray2: #9E9E9E;      /* 次要文本和图标颜色 */
                --color-dynamicGray: #616161;   /* H3标题等中等重要性元素 */
                --color-hoverGray: #BDBDBD;     /* 交互元素悬停状态 */
                --color-white: #FFFFFF;         /* 卡片和内容区块背景 */
                --color-deepGray: #424242;      /* 特殊元素强调色 */
              }
              .dark-mode {
                /* 暗黑主题颜色变量 */
                --color-primaryGray: #121212;   /* 深色模式背景 */
                --color-accentBlack: #E0E0E0;   /* 深色模式标题颜色 */
                --color-auxGray1: #424242;      /* 深色模式边框/分隔线 */
                --color-auxGray2: #9E9E9E;      /* 深色模式次要文本 */
                --color-dynamicGray: #BDBDBD;   /* 深色模式H3标题 */
                --color-hoverGray: #616161;     /* 深色模式悬停状态 */
                --color-white: #1F1F1F;         /* 深色模式卡片背景 */
                --color-deepGray: #E0E0E0;      /* 深色模式特殊元素 */
              }
            `
					},
					sysPreflights
				]
			})
		]
	}
})
