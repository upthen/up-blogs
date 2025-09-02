import { createContentLoader } from 'vitepress'
import dayjs from 'dayjs'

export default createContentLoader('**/**/*.md', {
	includeSrc: false,
	render: false,
	excerpt: false,
	transform(rawData) {
		return rawData
			.filter((item) => {
				// 过滤掉不需要显示的文件
				return (
					!item.url.includes('.vitepress') &&
					!item.frontmatter.draft &&
					item.url !== '/'
				)
			})
			.map((item) => {
				let fileName = ''
				if (item.url.endsWith('.html')) {
					fileName =
						item.url.split('/').pop()?.split('.').reverse().pop() ?? '无题'
				} else if (item.url.endsWith('/')) {
					fileName =
						item.url.slice(0, item.url.lastIndexOf('/')).split('/').pop() ??
						'无题'
				}
				// const fileName = item.url.split('/').pop()
				return {
					url: item.url,
					frontmatter: item.frontmatter,
					title: item.frontmatter.title || fileName,
					date: item.frontmatter.date || dayjs().format('YYYY/MM/DD')
				}
			})
			.sort((a, b) => {
				// 按日期排序，最新的在前面
				return dayjs(b.date).unix() - dayjs(a.date).unix()
			})
	}
})
