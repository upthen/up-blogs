<!-- 归档文章列表 -->
<template>
  <DefineTemplate v-slot="{ data }">
    <li class="up-list__item px-5 py-2 flex justify-start gap-col-lg" :key="data.url">
      <a :href="data.url" class="op70 h-full text-l hover:op100">
        <span class="underline-slide-in py-1">{{ data.title }}</span>
        <sup v-if="data.date" text-aux2 text-xs px-2>
          <span>{{ data.date }}</span>
          <template v-if="!isEmpty(data?.frontmatter?.tags)">
            <span>·</span>
            <span v-for="(tag, index) in data.frontmatter.tags" :key="tag">
              <span>{{ tag }}</span>
              <span class="text-aux2" v-if="index < data.frontmatter.tags.length - 1">/</span>
            </span>
          </template>
        </sup>
      </a>
    </li>
  </DefineTemplate>

  <div class="up-doc-list">
    <h2>已归档文章 ({{ archiveData.length }} 篇)</h2>
    <ul v-if="archiveData.length > 0">
      <ReuseTemplate v-for="item in archiveData" :data="item" :key="item.url" />
    </ul>
    <div v-else class="text-aux2">
      暂无归档文章
    </div>
  </div>
</template>

<script setup lang="ts">
import { data as archiveData } from "./archive.data";
import { isEmpty } from "lodash-es";
import { createReusableTemplate } from "@vueuse/core";

const [DefineTemplate, ReuseTemplate] = createReusableTemplate();
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
