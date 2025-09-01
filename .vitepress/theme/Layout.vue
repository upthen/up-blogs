<template>
  <UpNav />
  <div class="container mx-auto min-h-[calc(100vh-140px)] px-8">
    <div class="up-body h-full w-full">
      <template v-if="frontmatter.layout === 'list'">
        <UpContent>
          <Content />
        </UpContent>
        <UpDocList />
        <UpTheme />
      </template>
      <template v-else>
        <UpContent>
          <Content />
        </UpContent>
        <UpBack />
      </template>
    </div>
  </div>
  <footer class="w-full h-80px flex items-center justify-center">
    <p class="text-sm text-aux2 px-16px h-full flex items-center">
      © 癸卯年 {{ site.title }}. 保留所有权利.
    </p>
  </footer>
  <UpTools />
</template>

<script setup lang="ts">
import { useData, useRouter } from "vitepress";
import {
  UpNav,
  UpTools,
  UpContent,
  UpDocList,
  UpTheme,
  UpBack,
} from "./components";
import { VPHomeContent } from "vitepress/theme";

import { computed } from "vue";

const router = useRouter();

// https://vitepress.dev/reference/runtime-api#usedata
const data = useData();
const { site, frontmatter, page, theme } = data;
console.log("data", data);
console.log("site", site, page, theme);
console.log("frontmatter", frontmatter);
</script>

<style scoped>
.container {
  margin: auto;
  width: 100%;
  max-width: 800px;
  min-width: 640px;
}

@media (max-width: 640px) {
  .container {
    padding: 0 32px;
  }
}

@media (min-width: 640px) {
  .container {
    padding: 0 64px;
  }
}
</style>
