<!-- 文章列表 -->
<template>
  <div class="up-doc-list">
    <h2>最新文章</h2>
    <ul v-if="docList.length > 0">
      <li
        v-for="doc in docList"
        :key="doc.url"
        class="up-list__item px-5 py-2 flex justify-start gap-col-lg"
      >
        <a
          :href="doc.url"
          class="op70 h-full text-l hover:op100"
          v-if="doc.title.toLocaleLowerCase() !== 'readme'"
        >
          <span class="underline-slide-in">{{ doc.title }}</span>
          <sup v-if="doc.date" class="text-aux2 text-sm px-2">
            {{ doc.date }}
          </sup>
        </a>
      </li>
    </ul>
    <div v-else class="text-aux2">
      暂无文章, 快去找斋主
      <a href="/#联系我" class="cursor-pointer underline-slide-in">催更吧</a> ！
    </div>
  </div>
</template>

<script setup lang="ts">
import { data } from "./posts.data";
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vitepress";

const route = useRoute();
const docList = computed(() => {
  return data.filter((item) => {
    // 正则表达式，匹配以 route.path 开头但不完全等于 route.path 的 URL
    const regex = new RegExp(`^${route.path}(?!$)`);
    return regex.test(item.url);
  });
});

/**
 * TODO
 * 1. 主页时，文章列表需按照类别分类
 * 2. 大类的文章，应禁止点击跳转，仅做标题
 */
</script>

<style scoped>
.up-list__item {
  list-style-type: none;
  position: relative;
}

.up-list__item::before {
  content: "";
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
