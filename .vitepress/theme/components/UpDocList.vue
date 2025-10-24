<!-- 文章列表 -->
<template>
  <!-- 文章列表项复用模板 -->
  <DefineTemplate v-slot="{ data, status }">
    <li
      class="up-list__item px-5 py-2 flex justify-start gap-col-lg"
      :key="data.url"
    >
      <a :href="data.url" class="op70 h-full text-l hover:op100">
        <span class="underline-slide-in">{{ data.title }}</span>
        <sup v-if="data.date" text-aux2 text-xs px-2>
          <span>{{ data.date }}</span>

          <template v-if="!isEmpty(data?.frontmatter?.tags)">
            <span>·</span>
            <span v-for="(tag, index) in data.frontmatter.tags" :key="tag">
              <span>{{ tag }}</span>
              <span
                class="text-aux2"
                v-if="index < data.frontmatter.tags.length - 1"
                >/</span
              >
            </span>
          </template>
        </sup>
      </a>
    </li>
  </DefineTemplate>
  <div class="up-doc-list">
    <h2>最新文章</h2>
    <ul v-if="classifyDocs.length > 0">
      <template v-for="doc in classifyDocs" :key="doc.url">
        <ul v-if="!isEmpty(doc.children)">
          <a :href="doc.url" class="op70 h-full text-l hover:op100">
            <span class="underline-slide-in">{{ doc.title }}</span>
          </a>
          <ul px-5>
            <ReuseTemplate
              v-for="(item, index) in doc.children"
              :data="item"
              :key="item.key"
            />
          </ul>
        </ul>
        <ReuseTemplate :data="doc" v-else />
      </template>
    </ul>
    <div v-else class="text-aux2">
      暂无文章, 快去找斋主
      <a href="/#联系我" class="cursor-pointer underline-slide-in">催更吧</a>
      ！
    </div>
  </div>
</template>

<script setup lang="ts">
import { data } from "./posts.data";
import { computed, onMounted, watch } from "vue";
import { useRoute } from "vitepress";
import {
  isEmpty,
  filter,
  cloneDeep,
  partition,
  remove,
  forEach,
} from "lodash-es";
import { createReusableTemplate } from "@vueuse/core";
import dayjs from "dayjs";

const route = useRoute();
// 创建可复用模板
const [DefineTemplate, ReuseTemplate] = createReusableTemplate();
const docList = computed(() => {
  console.log("data", data);
  return data.filter((item) => {
    // 正则表达式，匹配以 route.path 开头但不完全等于 route.path 的 URL
    const regex = new RegExp(`^${route.path}(?!$)`);
    return regex.test(item.url);
  });
});

const classifyDocs = computed(() => {
  // 使用 cloneDeep 深拷贝数据，避免修改原始数据
  const docsData = cloneDeep(docList.value);

  // 使用 partition 将数组按 layout === 'list' 拆分为两个数组
  const [listDocs, docs] = partition(
    docsData,
    (item) => item.frontmatter?.layout === "list"
  );

  // 遍历 listDocs，为每个列表文档添加子文档
  forEach(listDocs, (listDoc) => {
    const parentUrl = listDoc.url;

    // 使用 remove 函数从 docs 数组中提取匹配的子文档
    const children = remove(
      docs,
      (doc) => doc?.url?.startsWith(parentUrl) && doc.url !== parentUrl
    );

    // 如果有子文档，添加到 listDoc 的 children 属性中
    if (!isEmpty(children)) {
      listDoc.children = children;
    }
  });

  // 使用 concat 合并 listDocs 和处理后的 docs
  const result = listDocs.concat(docs);
  // 对result按照时间顺序进行排序，时间需使用dayjs计算，排序需只用lodash-es
  result.sort((a, b) => {
    return dayjs(b.date).unix() - dayjs(a.date).unix();
  });

  // 返回处理后的结果
  return result;
});

onMounted(() => {
  console.log("classifyDocs", classifyDocs.value);
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
