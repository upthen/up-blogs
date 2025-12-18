---
title: 常用 css 样式
description: 搜集了一些常用 css 样式
tags: [fe, css]
---

# 常用 css 样式

## 分割线

> 一条有渐变效果的分割线

<div :class="$style['demo-block']">
  <div :class="$style['line']">
    <span>文字内容</span>
  </div>
</div>

<style module>
  .demo-block {
    width: 100%;
    height: auto;
    padding: 50px;
    box-sizing: border-box;
    border: 1px solid var(--color-auxGray1);
    border-radius: 4px;
  }

.line {
    position: relative;
    height: 24px;
    font-family: SourceHanSansCN-Normal;
    font-size: 12px;
    font-weight: 400;
    line-height: 24px;
    color: #797979;
    text-align: center;
    letter-spacing: 0;

    &::before {
      position: absolute;
      top: 50%;
      left: 16px;
      width: calc(50% - 60px);
      height: 1px;
      content: "";
      background: linear-gradient(270deg, #797979 0%, rgb(121 121 121 / 0%) 100%);
    }

    &::after {
      position: absolute;
      top: 50%;
      right: 16px;
      width: calc(50% - 60px);
      height: 1px;
      content: "";
      background: linear-gradient(90deg, #797979 0%, rgb(121 121 121 / 0%) 100%);
    }

}
</style>

::: details 点我查看代码

```html
<html>
  <body>
    <div class="line">
      <span>文字内容</span>
    </div>
  </body>
  <style>
    .line {
      position: relative;
      height: 24px;
      font-family: SourceHanSansCN-Normal;
      font-size: 12px;
      font-weight: 400;
      line-height: 24px;
      color: #797979;
      text-align: center;
      letter-spacing: 0;

      &::before {
        position: absolute;
        top: 50%;
        left: 16px;
        width: calc(50% - 60px);
        height: 1px;
        content: "";
        background: linear-gradient(
          270deg,
          #797979 0%,
          rgb(121 121 121 / 0%) 100%
        );
      }

      &::after {
        position: absolute;
        top: 50%;
        right: 16px;
        width: calc(50% - 60px);
        height: 1px;
        content: "";
        background: linear-gradient(
          90deg,
          #797979 0%,
          rgb(121 121 121 / 0%) 100%
        );
      }
    }
  </style>
</html>
```

:::
