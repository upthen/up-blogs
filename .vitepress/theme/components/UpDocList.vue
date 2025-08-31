<!-- 文章列表 -->
<template>
  <div class="up-doc-list px-15">
    <h2>最新文章</h2>
    <ul class="px-5">
      <li
        v-for="doc in data"
        :key="doc.url"
        class="up-list__item px-4 py-2 flex justify-start gap-col-lg"
      >
        <a :href="doc.url" class="op70 h-full text-xl hover:op100">
          <span class="underline-slide-in">{{ doc.title }}</span>
          <sup v-if="doc.date" class="text-aux2 text-sm px-2">
            {{ doc.date }}
          </sup>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { data } from './docList.data'

console.log(data)
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return new Date(dateString).toLocaleDateString('zh-CN', options)
}
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
  /* transform: translateY(-50%); */
}
</style>
