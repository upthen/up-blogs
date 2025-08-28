import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import "./custom.css";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册自定义全局组件
    app.component("MyGlobalComponent" /* ... */);
  },
} satisfies Theme;
