// import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";
import { RSSOptions, RssPlugin } from "vitepress-plugin-rss";
import { defineConfig } from "vitepress";
import dayjs from "dayjs";
import lunisolar from "lunisolar";

const baseUrl = "https://upthen.me";
const RSS: RSSOptions = {
  title: "闻 · 斋",
  baseUrl,
  copyright: `CC BY-NC-SA 4.0${lunisolar(dayjs().format("YYYY-MM-DD")).format("cY")}©闻 · 斋`,
  description:
    "Robert Zeng 的线上小书屋，我在这里敲一点代码，写一些文字，以及一些关于诗、书、旅行、摄影之类的点滴",
  language: "zh-cn",
  author: {
    name: "Robert Zeng",
    email: "zyb.6616@icloud.com",
    link: "https://upthen.me",
  },
  icon: false,
  filename: "feed.xml",
};

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
      { text: "编程人生", link: "/coding/" },
      { text: "随笔", link: "/essay/" },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/upthen/up-blogs" },
    ],
  },
  vite: {
    plugins: [RssPlugin(RSS)],
  },
});
