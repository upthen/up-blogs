---
title: 工具导航
description: 本文收录我日常工作中常用的各类工具网站的链接导航
---

# 工具导航

## vue生态

<script setup lang="ts">
import UpToolsNav from './UpToolsNav.vue'
// import vueNavConfigs from './vue.navConfig.ts'
// import toolNavConfigs from './tool.navConfig.ts'

const vueNavConfigs = [
  {
    key: Symbol("vue"),
    name: "Vue.js",
    icon: "i-logos:vue",
    color: "#42b883",
    links: [
      {
        name: "官方",
        url: "https://vuejs.org/",
      },
      {
        name: "中文",
        url: "https://vuejs.org/zh/",
      },
    ],
    desc: "渐进式JavaScript框架",
  },
  {
    key: Symbol("vite"),
    name: "Vite",
    icon: "i-devicon:vitejs",
    color: "#bd34fe",
    links: [
      {
        name: "官方",
        url: "https://vitejs.dev/",
      },
    ],
    desc: "下一代前端构建工具",
  },
  {
    key: Symbol("pinia"),
    name: "Pinia",
    color: "#ffe56c",
    icon: "i-logos:pinia",
    links: [
      {
        name: "官方",
        url: "https://pinia.vuejs.org/",
      },
    ],
    desc: "Vue官方状态管理库",
  },
  {
    key: Symbol("vue-router"),
    name: "Vue Router",
    icon: "i-logos:vue",
    color: "#42b883",
    links: [
      {
        name: "官方",
        url: "https://router.vuejs.org/",
      },
    ],
    desc: "Vue官方路由管理器",
  },
  {
    key: Symbol("element-plus"),
    name: "Element Plus",
    icon: "i-ep:element-plus",
    color: "#409eff",
    links: [
      {
        name: "官方",
        url: "https://element-plus.org/",
      },
      {
        name: "中文",
        url: "https://element-plus.org/zh-CN/",
      },
    ],
    desc: "基于Vue 3的桌面端组件库",
  },
  {
    key: Symbol("unocss"),
    name: "UnoCSS",
    color: "#78909c",
    icon: "i-material-icon-theme:unocss",
    links: [
      {
        name: "官方",
        url: "https://unocss.dev/",
      },
    ],
    desc: "即时原子化CSS引擎",
  },
];

const toolNavConfigs = [
  {
    key: Symbol("lodash"),
    name: "Lodash",
    icon: "i-devicon-plain:lodash",
    color: "#3492ff",
    links: [
      {
        name: "官方",
        url: "https://lodash.com/",
      },
      {
        name: "中文",
        url: "https://www.lodashjs.com/",
      },
    ],
    desc: "一致性、模块化、高性能的 JavaScript 实用工具库",
  },
  {
    key: Symbol("dayjs"),
    name: "Day.js",
    color: "#FB6052",
    links: [
      {
        name: "官方",
        url: "https://vitejs.dev/",
      },
    ],
    desc: "下一代前端构建工具",
  },
  {
    // axios
    key: Symbol("axios"),
    name: "Axios",
    icon: "i-simple-icons:axios",
    color: "#5a29e4",
    links: [
      {
        name: "官方",
        url: "https://axios-http.com/",
      },
    ],
    desc: "基于 Promise 的 HTTP 客户端",
  },
  {
    // https://to-unocss.netlify.app/
    key: Symbol("to-unocss"),
    name: "Css To UnoCSS",
    color: "#78909c",
    icon: "i-material-icon-theme:unocss",
    links: [
      {
        name: "官方",
        url: "https://to-unocss.netlify.app/",
      },
    ],
    desc: "将普通的CSS转换为UnoCSS原子类",
  },
  {
    key: Symbol("iconify"),
    name: "Iconify",
    color: "#0087cb",
    icon: "i-line-md:iconify2-static",
    links: [
      {
        name: "官方",
        url: "https://icon-sets.iconify.design/",
      },
    ],
    desc: "图标库",
  }
];


const aiNavConfigs = [
  {
    key: Symbol("deepwiki"),
    name: "DeepWiki",
    color: "#0087cb",
    links: [
      {
        name: "官方",
        url: "https://deepwiki.com/",
      },
    ],
    desc: "基于AI的github源代码解读",
  },
]


const componentLibNavConfigs = [
  {
    key: Symbol("element-plus"),
    name: "Element Plus",
    icon: "i-ep:element-plus",
    color: "#409eff",
    links: [
      {
        name: "官方",
        url: "https://element-plus.org/",
      },
      {
        name: "中文",
        url: "https://element-plus.org/zh-CN/",
      },
    ],
    desc: "基于Vue 3的桌面端组件库",
  },
  {
    // vant
    key: Symbol("vant"),
    name: "Vant",
    color: "#5ae7a5ff",
    links: [
      {
        name: "官方",
        url: "https://vant-contrib.gitee.io/vant/",
      },
    ],
    desc: "轻量、可靠的移动端组件库",
  }
]


</script>

<UpToolsNav :data="vueNavConfigs" />

## 实用工具

<UpToolsNav :data="toolNavConfigs" />

## 组件库

<UpToolsNav :data="componentLibNavConfigs" />

## Ai工具

<UpToolsNav :data="aiNavConfigs" />
