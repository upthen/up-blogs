<!-- 文章列表 -->
<template>
	<div class="up-doc-list">
		<h2>最新文章</h2>
		<ul>
			<li
				v-for="doc in docList"
				:key="doc.url"
				class="up-list__item px-5 py-2 flex justify-start gap-col-lg"
			>
				<a
					:href="doc.url"
					class="op70 h-full text-xl hover:op100"
				>
					<span class="underline-slide-in">{{ doc.title }}</span>
					<sup
						v-if="doc.date"
						class="text-aux2 text-sm px-2"
					>
						{{ doc.date }}
					</sup>
				</a>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { data } from './docList.data'
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const docList = computed(() => {
	return data.filter((item) => {
		// 正则表达式，匹配以 route.path 开头但不完全等于 route.path 的 URL
		const regex = new RegExp(`^${route.path}(?!$)`)
		return regex.test(item.url)
	})
})
</script>

<style scoped>
.up-list__item {
	list-style-type: none;
	position: relative;
}

.up-list__item::before {
	content: '';
	position: absolute;
	width: 5px;
	height: 5px;
	left: 0;
	top: 50%;
	background-color: #666;
	border-radius: 50%;
	transform: translateY(-50%);
}
</style>
