<!-- @description -->
<template>
	<div class="w-full h-40px flex items-center justify-start">
		>
		<a
			href="#"
			class="px-2 underline-slide-in text-aux2 hover:op70 text-lg underline-slide-in"
			@click="handBack"
		>
			cd ..
		</a>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
	name: 'UpBack'
})

const handBack = () => {
	if (window !== undefined) {
		window.history.go(-1)
	}
}
</script>

<style scoped lang="scss"></style>
