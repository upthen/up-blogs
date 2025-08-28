// import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid({
  assetsDir: "static",
  lang: "zh-CN",
  title: "Upthen",
  description: "Upthen's Blog",
  themeConfig: {
    logo: "/logo.png",
    search: {
      provider: "local",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "关于我", link: "/" },
      { text: "前端", link: "/fe/index.md" },
      { text: "历史", link: "/history/index.md" },
    ],

    sidebar: {
      "/fe/": [
        {
          text: "前端开发",
          collapsed: false,
          items: [
            {
              text: "前端如何管理JS内存",
              link: "/fe/前端如何管理JS内存_2025_08_26/",
            },
            {
              text: "eslint三元运算符格式化和缩进规则冲突问题",
              link: "/fe/eslint三元运算符格式化和缩进规则冲突问题_2025_08_26/",
            },
            {
              text: "浏览器中实现通话铃声和手机振动的一些注意事项",
              link: "/fe/关于H5应用中实现音频播放和触发手机振动的一些注意事项_2025_0827/",
            },
            { text: "常用VSCode插件", link: "/fe/常用VSCode插件_-2025_08_26/" },
            { text: "常用素材网站", link: "/fe/常用素材网站_2025_08_26/" },
            {
              text: "移动端高度兼容性问题",
              link: "/fe/移动端浏览器因工具栏导致的高度兼容性问题_2025_08_26/",
            },
          ],
        },
        {
          text: "AI赋能",
          items: [
            {
              text: "VibeCoding技巧",
              link: "/fe/VibeCoding技巧_2025_08_26/",
            },
          ],
        },
      ],
      "/history/": [
        {
          text: "宋代历史研究",
          collapsed: false,
          items: [
            { text: "历代皇帝", link: "/history/song/历代皇帝/" },
            { text: "东坡", link: "/history/song/东坡/" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/upthen/up-blogs" },
    ],
  },
});
