---
title: markdown 格式
draft: true
---

# markdown 格式

## 二级标题

### 三级标题

#### 四级标题

有序列表

1. 有序列表1
2. 有序列表2
3. 有序列表3

无序列表

- 无序列表1
- 无序列表2
- 无序列表3

代码块

```js
console.log("生成的随机代码 1");
console.log("生成的随机代码 2");
console.log("生成的随机代码 3");
console.log("生成的随机代码 4");
console.log("生成的随机代码 5");
console.log("生成的随机代码 6");
console.log("生成的随机代码 7");
console.log("生成的随机代码 8");
console.log("生成的随机代码 9");
console.log("生成的随机代码 10");
console.log("生成的随机代码 11");
console.log("生成的随机代码 12");
console.log("生成的随机代码 13");
console.log("生成的随机代码 14");
console.log("生成的随机代码 15");
console.log("生成的随机代码 16");
console.log("生成的随机代码 17");
console.log("生成的随机代码 18");
console.log("生成的随机代码 19");
console.log("生成的随机代码 20");
console.log("生成的随机代码 21");
console.log("生成的随机代码 22");
console.log("生成的随机代码 23");
console.log("生成的随机代码 24");
console.log("生成的随机代码 25");
console.log("生成的随机代码 26");
console.log("生成的随机代码 27");
console.log("生成的随机代码 28");
console.log("生成的随机代码 29");
console.log("生成的随机代码 30");
console.log("生成的随机代码 31");
console.log("生成的随机代码 32");
console.log("生成的随机代码 33");
console.log("生成的随机代码 34");
console.log("生成的随机代码 35");
console.log("生成的随机代码 36");
console.log("生成的随机代码 37");
console.log("生成的随机代码 38");
console.log("生成的随机代码 39");
console.log("生成的随机代码 40");
console.log("生成的随机代码 41");
console.log("生成的随机代码 42");
console.log("生成的随机代码 43");
console.log("生成的随机代码 44");
console.log("生成的随机代码 45");
console.log("生成的随机代码 46");
console.log("生成的随机代码 47");
console.log("生成的随机代码 48");
console.log("生成的随机代码 49");
console.log("生成的随机代码 50");
```

> 在当今数字化的时代，信息传播的速度日新月异。知识的获取变得前所未有的便捷，人们只需轻点屏幕就能浏览海量内容。然而，这也带来了信息过载的问题。我们需要学会筛选和吸收有价值的信息，让知识真正为我们所用，提升自己的认知和能力，在快速变化的世界中保持竞争力。

## 引用

> 引用内容

### 3级引用标题

在当今数字化的时代，信息传播的速度日新月异。知识的获取变得前所未有的便捷，人们只需轻点屏幕就能浏览海量内容。然而，这也带来了信息过载的问题。我们需要学会筛选和吸收有价值的信息，让知识真正为我们所用，提升自己的认知和能力，在快速变化的世界中保持竞争力。

## 引用3

### 3级引用标题4

#### 4级引用标题

###### 5级引用标题

###### 6级引用标题

在当今数字化的时代，信息传播的速度日新月异。知识的获取变得前所未有的便捷，人们只需轻点屏幕就能浏览海量内容。然而，这也带来了信息过载的问题。我们需要学会筛选和吸收有价值的信息，让知识真正为我们所用，提升自己的认知和能力，在快速变化的世界中保持竞争力。

在当今数字化的时代，信息传播的速度日新月异。知识的获取变得前所未有的便捷，人们只需轻点屏幕就能浏览海量内容。然而，这也带来了信息过载的问题。我们需要学会筛选和吸收有价值的信息，让知识真正为我们所用，提升自己的认知和能力，在快速变化的世界中保持竞争力。

在当今数字化的时代，信息传播的速度日新月异。知识的获取变得前所未有的便捷，人们只需轻点屏幕就能浏览海量内容。然而，这也带来了信息过载的问题。我们需要学会筛选和吸收有价值的信息，让知识真正为我们所用，提升自己的认知和能力，在快速变化的世界中保持竞争力。

```vue
<template>
  <div class="up-content-toc">
    <div class="toc-container" v-if="headers.length">
      <h3>目录</h3>
      <ul>
        <li
          v-for="(item, index) in headers"
          :key="index"
          :class="'toc-level-' + item.level"
        >
          <a :href="'#' + item.id">{{ item.text }}</a>
        </li>
      </ul>
    </div>
    <div id="up-doc">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { onContentUpdated } from "vitepress";

interface TocItem {
  text: string;
  id: string;
  level: number;
}

const toc = ref<TocItem[]>([]);
const headers = ref<TocItem[]>([]);
const resolvedHeaders = [];

const ignoreRE = /\b(?:VPBadge|header-anchor|footnote-ref|ignore-header)\b/;

onContentUpdated(() => {
  headers.value = getHeaders(true);
  console.log("headers", headers.value);
});

onMounted(() => {
  headers.value = getHeaders(true);
  console.log("onMounted::headers", headers.value);
});

const getHeaders = (range) => {
  const headers = [
    ...document.querySelectorAll(".up-doc :where(h1,h2,h3,h4,h5,h6)"),
  ]
    .filter((el) => el.id && el.hasChildNodes())
    .map((el) => {
      const level = Number(el.tagName[1]);
      return {
        element: el,
        title: serializeHeader(el),
        link: "#" + el.id,
        level,
      };
    });
  // return resolveHeaders(headers, range)
  return headers;
};

function serializeHeader(h) {
  let ret = "";
  for (const node of h.childNodes) {
    if (node.nodeType === 1) {
      if (ignoreRE.test(node.className)) continue;
      ret += node.textContent;
    } else if (node.nodeType === 3) {
      ret += node.textContent;
    }
  }
  return ret.trim();
}

const resolveHeaders = (headers, range) => {
  return buildTree(headers, 2, 6);
};

function buildTree(data, min, max) {
  resolvedHeaders.length = 0;
  const result = [];
  const stack = [];
  data.forEach((item) => {
    const node = { ...item, children: [] };
    let parent = stack[stack.length - 1];
    while (parent && parent.level >= node.level) {
      stack.pop();
      parent = stack[stack.length - 1];
    }
    if (
      node.element.classList.contains("ignore-header") ||
      (parent && "shouldIgnore" in parent)
    ) {
      stack.push({ level: node.level, shouldIgnore: true });
      return;
    }
    if (node.level > max || node.level < min) return;
    resolvedHeaders.push({ element: node.element, link: node.link });
    if (parent) parent.children.push(node);
    else result.push(node);
    stack.push(node);
  });
  return result;
}
</script>

<style scoped></style>
```
