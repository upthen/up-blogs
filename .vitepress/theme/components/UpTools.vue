<template>
	<div
		class="up-tools fixed right-2 top-0 h-full flex flex-col items-center justify-center gap-y-2"
	>
		<div
			class="up-tools-item flex items-center op:70 rounded-full w-8 h-8 border-rd"
			hover:op90
			op:50
			text-aux1
			bg-auxGray2
			v-for="(item, index) in tools"
			:key="index"
			@click="(e) => item.func(e)"
		>
			<div
				class="up-tools-item-icon cursor-pointer h-full w-full flex items-center justify-center"
			>
				<span class="text-lg select-none">{{ item.text }}</span>
			</div>
		</div>
	</div>
	<popover ref="op">
		<ul>
			<li>目录</li>
		</ul>
	</popover>
	<popover
		ref="font"
		class="px-0"
		position="left"
	>
		<ul class="cursor-pointer select-none">
			<li
				v-for="(item, index) in fontFamilies"
				:key="index"
				@click="setFontFamily(item)"
				class="underline-slide-in py-1"
			>
				{{ item.name }}
			</li>
		</ul>
	</popover>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { useDark } from '@vueuse/core'
import Popover from 'primevue/popover'

const fontFamily = ref('')
const theme = ref('light')
const isDark = useDark()
const opRef = ref<InstanceType<typeof Popover> | null>()
const op = useTemplateRef('op')
const font = useTemplateRef('font')
const fontRef = ref<InstanceType<typeof Popover> | null>()

const fontFamilies = [
	{
		key: Symbol(),
		name: '中宋 (默认)',
		value: "'STZhongsong', 'SimSun', serif"
	},
	{ key: Symbol(), name: '宋体', value: "'SimSun', '宋体', serif" },
	{
		key: Symbol(),
		name: '微软雅黑',
		value: "'Microsoft YaHei', '微软雅黑', sans-serif"
	},
	{ key: Symbol(), name: '苹方', value: "'PingFang SC', '苹方', sans-serif" },
	{
		key: Symbol(),
		name: '冬青黑体',
		value: "'Hiragino Sans GB', '冬青黑体', sans-serif"
	},
	{ key: Symbol(), name: '华文楷体', value: "'STKaiti', '华文楷体', serif" },
	{ key: Symbol(), name: '华文行楷', value: "'STXingkai', '华文行楷', serif" },
	{ key: Symbol(), name: '华文隶书', value: "'STLiti', '华文隶书', serif" },
	{ key: Symbol(), name: '华文新魏', value: "'STXinwei', '华文新魏', serif" },
	{ key: Symbol(), name: '华文琥珀', value: "'STHupo', '华文琥珀', serif" },
	{ key: Symbol(), name: '华文宋体', value: "'STSong', '华文宋体', serif" },
	{ key: Symbol(), name: '方正舒体', value: "'FZShuTi', '方正舒体', serif" },
	{ key: Symbol(), name: '方正姚体', value: "'FZYaoti', '方正姚体', serif" },
	{ key: Symbol(), name: '幼圆', value: "'YouYuan', '幼圆', sans-serif" },
	{ key: Symbol(), name: '楷体', value: "'KaiTi', '楷体', serif" },
	{ key: Symbol(), name: 'Arial', value: "'Arial', sans-serif" },
	{ key: Symbol(), name: 'Helvetica', value: "'Helvetica', sans-serif" },
	{ key: Symbol(), name: 'Times New Roman', value: "'Times New Roman', serif" },
	{ key: Symbol(), name: 'Georgia', value: "'Georgia', serif" },
	{ key: Symbol(), name: 'Courier New', value: "'Courier New', monospace" },
	{ key: Symbol(), name: 'Verdana', value: "'Verdana', sans-serif" },
	{ key: Symbol(), name: 'Tahoma', value: "'Tahoma', sans-serif" }
]

const setFontFamily = (family: { name: string; value: string }) => {
	fontFamily.value = family.value
	// 设置全局字体
	// document.documentElement.style.fontFamily = family.value
	document.body.style.fontFamily = family.value
	console.log('字体切换', document.documentElement.style.fontFamily)
}

const tools = computed(() => [
	{
		key: Symbol(),
		text: '目',
		icon: 'iconfont icon-xiangshang',
		popover: true,
		func: (e) => {
			console.log('目录')
			op?.value?.show(e)
		}
	},
	{
		key: Symbol(),
		text: 'A',
		icon: 'iconfont icon-xiangshang',
		func: (e) => {
			console.log('字体切换')
			font?.value?.toggle(e)
		}
	},
	{
		key: Symbol(),
		text: 'Git',
		icon: 'iconfont icon-xiangshang',
		func: (e) => {
			window.open('https://github.com/upthen')
		}
	},
	{
		key: Symbol(),
		text: computed(() => (isDark.value ? '白' : '黑')),
		icon: 'iconfont icon-xiangshang',
		func: (e) => {
			console.log('主题切换')
			isDark.value = !isDark.value
			theme.value = isDark.value ? 'dark' : 'light'
			if (isDark.value) {
				document.documentElement.classList.add('dark')
			} else {
				document.documentElement.classList.remove('dark')
			}
		}
	},
	{
		key: Symbol(),
		text: '顶',
		icon: 'iconfont icon-xiangshang',
		func: () => {
			console.log('返回顶部')
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			})
		}
	}
])
</script>

<style scoped></style>
