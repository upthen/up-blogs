<template>
	<div
		class="translate-y-0 top-0 left-0 right-0 z-1000 h-60px bg-primary flex justify-between items-center px-[5%] bg-transparent transition-all duration-400 ease-in-out"
	>
		<a
			href="#"
			class="text-aux2 hover:op70"
			>{{ site.title }}</a
		>
		<div class="flex items-center gap-x-5">
			<up-nav-menu :config="navMenuConfig" />
		</div>
	</div>
	<div class="w-4/10 mx-auto w-750px min-h-[calc(100vh-140px)]">
		<template v-if="frontmatter.layout === 'list'">
			<UpContent>
				<Content />
			</UpContent>
			<UpDocList />
		</template>
		<template v-else>
			<UpContent>
				<Content />
			</UpContent>
			<div class="w-full h-40px px-15">
				>
				<a
					href="#"
					class="px-1 underline-slide-in text-aux2 hover:op70"
					@click="handBack"
				>
					cd..
				</a>
			</div>
		</template>
	</div>
	<footer class="w-full h-80px flex items-center justify-center">
		<p class="text-sm text-aux2 px-16px h-full flex items-center">
			© 癸卯年 {{ site.title }}. 保留所有权利.
		</p>
	</footer>
	<UpTools />
</template>

<script setup lang="ts">
import { useData, useRouter } from 'vitepress'
import { UpNavMenu, UpTools, UpContent, UpDocList } from './components'
import { VPHomeContent } from 'vitepress/theme'

import { computed } from 'vue'

const router = useRouter()

// https://vitepress.dev/reference/runtime-api#usedata
const data = useData()
const { site, frontmatter, page, theme } = data
console.log('data', data)
console.log('site', site, page, theme)
console.log('frontmatter', frontmatter)

const navMenuConfig = computed(() => {
	return theme.value.nav?.map((item) => {
		return {
			key: Symbol(),
			text: item.text,
			link: item.link,
			icon: item?.icon
		}
	})
})

const handBack = () => {
	if (window !== 'undefined') {
		window.history.go(-1)
	}
}
</script>

<style scoped>
#navContainer {
	background-color: #fff;
}
</style>
