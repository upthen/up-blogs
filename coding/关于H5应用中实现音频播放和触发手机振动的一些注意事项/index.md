---
title: 关于H5应用中实现音频播放和触发手机振动的一些注意事项
tags: [fe, h5]
draft: true
---

# 浏览器中实现通话铃声和手机振动的一些注意事项

---

> 本文记录在 H5 应用中实现**播放通话铃声**和**触发手机振动**功能中遇到的一些问题及注意事项

在 Web 浏览器中播放音频确实存在一些限制，主要是出于**用户体验、安全性和隐私保护**的考虑。



基于pnpm 初始化一个 monorepo 项目，需要包含如下目录

- docs
- packages
- play
- scripts

需要安装如下依赖：

- vue 3.5.21

- vite

- vitest

- vant 

- less

- less-loader

- prettier

-   "eslint": "^9.34.0",

    "eslint-plugin-import": "^2.32.0",

    "eslint-plugin-vue": "^10.4.0",

- typescript

- dayjs

- lodash-es

- markstream-vue

- qrcode

- vconsole

- @vue/eslint-config-prettier

- @vue/eslint-config-typescript

- @vue/tsconfig

- pdfjs-dist

-   "stylelint": "^16.25.0",

    "stylelint-config-recess-order": "^7.4.0",

    "stylelint-config-recommended-less": "^3.0.1",

    "stylelint-config-recommended-vue": "^1.6.1",

    "stylelint-config-standard": "^39.0.1",

    "stylelint-config-standard-scss": "^16.0.0",

    "stylelint-no-unresolved-module": "^2.5.2",

    "stylelint-order": "^7.0.0",

  

