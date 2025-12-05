<!-- @description 网站导航组件 - 自适应flex布局展示卡片式导航 -->
<template>
  <div class="utools-nav-container flex flex-wrap gap-3">
    <div
      v-for="item in data"
      :key="item.key"
      class="utools-nav-item min-w-[180px] group"
      flex-1
      p-3
      border-aux1
      border-1px
      border-solid
      cursor-pointer
      :style="{ color: item?.color || 'none' }"
    >
      <div
        class="flex items-center gap-3 mb-3"
        filter-grayscale
        group-hover:filter-grayscale-0
        transition-filter
        ease-in-out
      >
        <div
          :class="item.icon ? item.icon : 'i-mdi-light:link-variant'"
          w-10
          h-10
          border-rounded
          duration-300
          :style="{ color: item?.color || 'none' }"
        ></div>

        <div flex flex-col gap-row-1>
          <span class="text-lg font-medium text-bold">{{ item.name }}</span>
          <div flex flex-row gap-2>
            <a
              v-for="value in item.links"
              :key="value.url"
              :href="value.url"
              :title="value.url"
              target="_blank"
              class="text-sm"
              >{{ value.name }}</a
            >
          </div>
        </div>
      </div>
      <div
        v-if="item.desc"
        filter-grayscale
        group-hover:filter-grayscale-0
        transition-filter
        ease-in-out
        text-sm
      >
        {{ item.desc }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

defineOptions({
  name: "UpToolsNav",
});

// 定义组件属性接口
interface ToolItem {
  key: symbol;
  name: string;
  icon: string;
  color?: string;
  links: Array<{
    name: string;
    url: string;
  }>;
  desc?: string;
}

const props = defineProps<{
  /** 导航数据列表 */
  data: ToolItem[];
}>();
</script>
