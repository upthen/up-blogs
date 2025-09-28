// https://vitepress.dev/guide/custom-theme
import Layout from "./Layout.vue";
import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import ElementPlus from "element-plus";
import { generateHanziSVG } from "../faviconGene";

import imageViewer from "vitepress-plugin-image-viewer";
import vImageViewer from "vitepress-plugin-image-viewer/lib/vImageViewer.vue";
import { useRoute } from "vitepress";
import "./animation.css";
import "virtual:uno.css";
import "./style.css";
import "./font.css";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "viewerjs/dist/viewer.min.css";

const theme = {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {
    app.use(ElementPlus);
    app.component("vImageViewer", vImageViewer);

    // 初始设置
    if (typeof window !== "undefined") {
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        // favicon.href = generateHanziSVG('闻')
        Object.assign(favicon, {
          href: generateHanziSVG("闻"),
        });
      }
      setTimeout(() => {
        const defaultFavicon = document.createElement("link");
        defaultFavicon.rel = "icon";
        defaultFavicon.href = generateHanziSVG("闻");
        document.head.appendChild(defaultFavicon);
        if (typeof document !== "undefined" && document.body) {
          document.body.click();
        }
      }, 100);
    }
  },
  setup() {
    const route = useRoute();
    imageViewer(route, ".up-doc");
  },
} satisfies Theme;

export default theme;
