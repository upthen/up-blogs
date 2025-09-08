<template>
  <aside
    class="up-tools fixed right-2 top-0 h-screen flex flex-col items-center justify-center gap-y-2"
  >
    <div
      class="up-tools-item flex items-center rounded-full w-8 h-8 border-rd text-aux1"
      transition
      duration-300
      v-for="(item, index) in tools"
      :key="index"
      @click="(e) => item.func(e)"
    >
      <div
        class="up-tools-item-icon cursor-pointer h-full w-full flex items-center justify-center"
        hover:op90
      >
        <UpNavBarSearch v-if="item.type === 'search'" />
        <el-popover v-else-if="item.popover" placement="left" width="auto">
          <template #reference>
            <div :class="item.icon" text-accent dark:text-accent></div>
          </template>
          <UpContentToc v-if="item.type === 'toc'" :headers="headers" root />
          <UpFontSetter v-if="item.type === 'font'" />
        </el-popover>
        <div
          v-else-if="item.type !== 'search'"
          :class="item.icon"
          text-accent
          dark:text-accent
        ></div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useDark } from "@vueuse/core";
import { VPNavBarSearch as UpNavBarSearch } from "vitepress/theme";
import UpContentToc from "./UpContentToc.vue";
import UpFontSetter from "./UpFontSetter.vue";
import useToc from "./useToc";

const theme = ref("light");
const isDark = useDark();
const { headers } = useToc();

const tools = computed(() => [
  {
    key: Symbol(),
    text: "目",
    icon: "i-tdesign-catalog",
    type: "toc",
    popover: true,
    func: (e) => {},
  },
  {
    key: Symbol(),
    text: "搜",
    type: "search",
    icon: "i-ri-search-2-line",
    func: () => {},
  },
  {
    key: Symbol(),
    text: "Git",
    icon: "i-uil-github-alt",
    func: (e) => {
      window.open("https://github.com/upthen");
    },
  },
  {
    key: Symbol(),
    text: computed(() => (isDark.value ? "白" : "黑")),
    icon: "i-ri-sun-line dark:i-ri-moon-line",
    func: (e) => {
      isDark.value = !isDark.value;
      theme.value = isDark.value ? "dark" : "light";
      if (isDark.value) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
  },
  {
    key: Symbol(),
    text: "A",
    type: "font",
    popover: true,
    icon: "i-fa6-solid-a",
    func: (e) => {},
  },
  {
    key: Symbol(),
    text: "顶",
    icon: "i-material-symbols-vertical-align-top",
    func: () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
  },
]);
</script>

<style scoped lang="scss">
.up-tools-item-icon {
  transition: opacity 0.2s ease;
  opacity: 0.6;
  outline: none;
}

:deep(.DocSearch-Button) {
  padding: 0 !important;
  height: 100% !important;
  width: 100% !important;
}

:deep(.DocSearch-Search-Icon) {
  width: 18px;
  height: 18px;
}

:deep(.DocSearch-Button-Keys) {
  display: none !important;
}

:deep(.DocSearch-Button-Placeholder) {
  display: none !important;
}

:deep(.DocSearch-Search-Icon) {
  width: 18px !important;
  height: 18px !important;
}

:deep(.VPNavBarSearch) {
  width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  display: flex !important;

  &:first-child {
    flex: 1 !important;
    width: 32px !important;
    height: 32px !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }
}
</style>
