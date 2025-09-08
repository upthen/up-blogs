<template>
  <div class="w-screen h-screen overflow-x-hidden">
    <UpNav />
    <main class="container mx-auto min-h-[calc(100vh-140px)] px-8">
      <div class="up-body h-full w-full">
        <template v-if="['list', 'home'].includes(frontmatter.layout)">
          <UpContent>
            <Content />
          </UpContent>
          <UpDocList />
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
        © {{ lunisolar(dayjs().format("YYYY")).format("cY") }}
        {{ site.title }}. 保留所有权利.
      </p>
    </footer>
    <UpTools />
  </div>
</template>

<script setup lang="ts">
import { useData } from "vitepress";
import lunisolar from "lunisolar"; // 一个js农历库
import dayjs from "dayjs";
import {
  UpNav,
  UpTools,
  UpContent,
  UpDocList,
  UpTheme,
  UpBack,
} from "./components";

// https://vitepress.dev/reference/runtime-api#usedata
const data = useData();
const { site, frontmatter } = data;
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
