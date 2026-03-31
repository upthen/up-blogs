<template>
  <div class="overflow-x-hidden" id="up-layout">
    <UpNav />
    <!-- 100dvh - 200px nav 80px footer 60px 文章列表 h2 标题有 60px 的 margin-top -->
    <main
      class="container mx-auto min-h-[calc(100dvh-200px)] px-8"
      id="up-content"
    >
      <div class="up-body h-full w-full">
        <template v-if="['list', 'home'].includes(frontmatter.layout)">
          <UpContent>
            <Content />
          </UpContent>
          <!-- 归档页面使用专门的列表组件 -->
          <UpArchiveList v-if="isArchivePage" />
          <UpDocList v-else />
        </template>
        <template v-else>
          <UpContent>
            <Content />
          </UpContent>
          <UpBack />
        </template>
      </div>
    </main>
    <footer class="w-full h-80px flex items-center justify-center">
      <p class="text-sm text-aux2 px-16px h-full flex items-center">
        CC BY-NC-SA 4.0
        {{ lunisolar(dayjs().format("YYYY-MM-DD")).format("cY") }} ©
        {{ site.title }}
      </p>
    </footer>
    <UpTools />
  </div>

  <!-- 每日一诗弹窗 - 移到 layout 外层以便全局访问 -->
  <DailyPoem ref="dailyPoemRef" />
</template>

<script setup lang="ts">
import { ref, provide, computed } from 'vue';
import { useData, useRoute } from "vitepress";
import lunisolar from "lunisolar"; // 一个js农历库
import dayjs from "dayjs";
import {
  UpNav,
  UpTools,
  UpContent,
  UpDocList,
  UpBack,
  DailyPoem,
} from "./components";
import UpArchiveList from "./components/UpArchiveList.vue";

// https://vitepress.dev/reference/runtime-api#usedata
const data = useData();
const route = useRoute();
const { site, frontmatter } = data;

// 判断是否为归档页面
const isArchivePage = computed(() => route.path.startsWith('/archive/') || route.path === '/archive');

// 每日诗词组件引用
const dailyPoemRef = ref<InstanceType<typeof DailyPoem> | null>(null);

// 提供显示诗词的方法给子组件
const showDailyPoem = () => {
  if (dailyPoemRef.value) {
    dailyPoemRef.value.refresh();
  }
};

// 使用 provide 将方法提供给所有子组件
provide('showDailyPoem', showDailyPoem);
</script>

<style scoped>
.container {
  margin: auto;
  width: 100%;
  max-width: 800px;
}

@media (max-width: 640px) {
  .container {
    padding: 0 32px;
    width: auto;
  }
}

@media (min-width: 640px) {
  .container {
    padding: 0 64px;
    min-width: 640px;
  }
}
</style>
