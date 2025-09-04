<!-- @description -->
<template>
	<div
		class="translate-y-0 top-0 left-0 right-0 z-1000 h-60px flex justify-between items-center px-[5%] bg-transparent transition-all duration-400 ease-in-out"
	>
		<a
			href="#"
			class="text-accent hover:op70"
			>{{ site.title }}</a
		>
		<div class="flex items-center justify-center gap-x-5">
			<VPNavBarSearch class="search" />
			<up-nav-menu :config="navMenuConfig" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, ref } from 'vue'
import UpNavMenu from './UpNavMenu.vue'
import { VPNavBarSearch } from 'vitepress/theme'

defineOptions({
	name: 'ComponentName'
})

const { site, theme } = useData()

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
</script>

<style scoped lang="css"></style>
