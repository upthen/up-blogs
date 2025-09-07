<template>
	<ul class="cursor-pointer select-none">
		<li
			v-for="(item, index) in fontFamilies"
			:key="index"
			@click="setFontFamily(item)"
			class="py-1"
		>
			<span class="underline-slide-in">{{ item.name }}</span>
		</li>
	</ul>
</template>

<script setup lang="ts">
import fontFamilies from './font.config'
defineOptions({
	name: 'UpFontSetter'
})

const setFontFamily = (family: { name: string; value: string }) => {
	// 设置全局字体
	document.body.style.fontFamily = family.value
}
</script>

<style scoped></style>
