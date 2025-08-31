<template>
  <div class="up-nav-menu flex items-center">
    <div
      v-for="(item, index) in props.config"
      :key="item.key"
      class="up-nav-menu-item"
    >
      <a
        href="#"
        @click="() => router.go(item.link)"
        :class="{ 'has-slash': index !== 0 }"
        class="px-1 py-2 underline-slide-in text-aux2 op70 hover:op100"
        >{{ item.text }}</a
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vitepress'

const router = useRouter()

// 定义导航菜单项的类型
type NavMenuItem = {
  key: symbol
  text: string
  link: string
  icon?: string
}

const props = withDefaults(
  defineProps<{
    config: Array<NavMenuItem>
  }>(),
  {
    config: () => [
      {
        key: Symbol('about'),
        text: '关于',
        link: '/about',
      },
    ],
  }
)
</script>

<style scoped>
.has-slash::before {
  content: '/';
}
</style>
