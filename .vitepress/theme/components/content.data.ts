import { createMarkdownRenderer } from 'vitepress'
import dayjs from 'dayjs'
import path from 'node:path'
import fs from 'node:fs'
import { normalizePath } from 'vite'
import matter from 'gray-matter'

import { spawnSync } from 'node:child_process'

export function getFileBirthTime(url: string) {
	try {
		// ct
		const infoStr = spawnSync('git', ['log', '--pretty="%ci"', url])
			.stdout?.toString()
			.replace(/["']/g, '')
			.trim()
		const timeList = infoStr.split('\n').filter((item) => Boolean(item.trim()))
		if (timeList.length > 0) {
			return new Date(timeList.pop()!).getTime()
		}
	} catch (error) {
		return undefined
	}
}

export const getFileLastUpdateTime = (url: string) => {
	try {
		// 参考 vitepress 中的 getGitTimestamp 实现
		const infoStr = spawnSync('git', ['log', '-1', '--pretty="%ci"', url])
			.stdout?.toString()
			.replace(/["']/g, '')
			.trim()
		if (infoStr) {
			return new Date(infoStr).getTime()
		}
	} catch (error) {
		return undefined
	}
}

export const slash = (p: string): string => p.replace(/\\/g, '/')

const config = globalThis.VITEPRESS_CONFIG
const paths = [`${config.srcDir}/**/*.md`].map((p) => normalizePath(p))
const cache = new Map()

console.log('paths', paths)
export default {
	watch: paths,
	async load(files) {
		console.log('files', files, globalThis.VITEPRESS_CONFIG)
		const md = createMarkdownRenderer(
			config.srcDir,
			config.markdown,
			config.site.base,
			config.logger
		)
		const raw = []
		for (const file of files) {
			// raw.push(await md.load(file))
			if (!file.endsWith('.md')) {
				continue
			}
			const { mtimeMs: timestamp, birthtimeMs } = fs.statSync(file)
			// const cached = cache.get(file)
			const cached = cache.get(file)

			if (cached && timestamp === cached.timestamp) {
				raw.push(cached.data)
				continue
			}

			const fileContent = fs.readFileSync(file, 'utf-8')
			let excerpt = ''
			const { data: meta } = matter<string, any>(fileContent, {
				excerpt: ({ content }: matter.GrayMatterFile<string>) => {
					const reg = /<!--\s*more\s*-->/gs
					const rpt = reg.exec(content)
					excerpt = rpt ? content.substring(0, rpt.index) : ''
				}
			})

			// 处理创建时间 md => git => file
			const timeZone = config.theme?.timeZone ?? 8
			if (!meta.date) {
				meta.date = getFileBirthTime(file)
				if (!meta.date) {
					meta.date = birthtimeMs
				}
			} else {
				meta.date = new Date(
					`${new Date(meta.date).toUTCString()}+${timeZone}`
				).getTime()
			}

			if (!meta.lastUpdated) {
				meta.lastUpdated = getFileLastUpdateTime(file)
				if (!meta.lastUpdateTime) {
					meta.lastUpdated = timestamp
				}
			} else {
				meta.lastUpdated = new Date(
					`${new Date(meta.lastUpdateTime).toUTCString()}+${timeZone}`
				).getTime()
			}

			const data = {
				excerpt: excerpt.trim(),
				sticky: 0,
				...meta,
				// url: withBase(config.site.base, url),
				filePath: slash(path.relative(config.srcDir, file))
			}
			cache.set(file, { data, timestamp })
			raw.push(data)
		}
		return raw
	}
}
