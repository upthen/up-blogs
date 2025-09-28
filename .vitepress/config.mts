// import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { defineConfig } from "vitepress";
// https://vitepress.dev/reference/site-config
export default withMermaid({
  base: "/",
  assetsDir: "static",
  lang: "zh-CN",
  title: "闻 · 斋",
  themeConfig: {
    search: {
      provider: "local",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "我", link: "/" },
      { text: "前端", link: "/fe/" },
      { text: "随笔", link: "/essay/" },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/upthen/up-blogs" },
    ],
  },
});
