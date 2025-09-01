import { defineConfig } from "unocss";
import { presetAttributify } from "unocss";
import presetWind4, { theme } from "@unocss/preset-wind4";
import { presetTheme } from "unocss-preset-theme";
import type { Theme } from "unocss/preset-uno";
import { light, dark } from "./.vitepress/theme/unoTheme";
import presetIcons from "@unocss/preset-icons";
import path from "path";
import sysPreflights from "./.vitepress/sysPreflights";

const themeKeys = [
  "primary",
  "accent",
  "aux1",
  "aux2",
  "dynamic",
  "hover",
  "white",
  "deep",
];

export default defineConfig({
  theme: {
    colors: {
      // 主背景色 - 用于页面主体背景
      primary: "var(--color-primaryGray)",
      // 强调色 - 用于标题、重要文字
      accent: "var(--color-accentBlack)",
      // 辅助色1 - 用于边框、分隔线、按钮背景
      aux1: "var(--color-auxGray1)",
      // 辅助色2 - 用于次要文本、图标等
      aux2: "var(--color-auxGray2)",
      // 动态灰色 - 用于H3标题等中等重要性的元素
      dynamic: "var(--color-dynamicGray)",
      // 悬停灰色 - 用于按钮、链接的悬停状态
      hover: "var(--color-hoverGray)",
      // 白色/深色背景 - 用于卡片、内容区块
      white: "var(--color-white)",
      // 深灰色 - 用于某些特殊元素或强调
      deep: "var(--color-deepGray)",
    },
  },
  // theme: light,
  presets: [
    presetWind4({
      reset: true,
    }),
    presetAttributify(),
    presetIcons({}),
    presetTheme<Theme>({
      theme: {
        dark: {
          colors: {
            // 主背景色 - 用于页面主体背景
            primary: "var(--color-primaryGray)",
            // 强调色 - 用于标题、重要文字
            accent: "var(--color-accentBlack)",
            // 辅助色1 - 用于边框、分隔线、按钮背景
            aux1: "var(--color-auxGray1)",
            // 辅助色2 - 用于次要文本、图标等
            aux2: "var(--color-auxGray2)",
            // 动态灰色 - 用于H3标题等中等重要性的元素
            dynamic: "var(--color-dynamicGray)",
            // 悬停灰色 - 用于按钮、链接的悬停状态
            hover: "var(--color-hoverGray)",
            // 白色/深色背景 - 用于卡片、内容区块
            white: "var(--color-white)",
            // 深灰色 - 用于某些特殊元素或强调
            deep: "var(--color-deepGray)",
          },
        },
        compat: {},
      },
    }),
  ],

  safelist: [
    ...themeKeys.map((key) => `bg-${key}`),
    ...themeKeys.map((key) => `text-${key}`),
  ],

  preflights: [
    {
      getCSS: () => `
              :root {
                /* 明亮主题颜色变量 */
                --color-primaryGray: #F5F5F7;   /* 主页面背景色 */
                --color-accentBlack: #212121;   /* 标题和重要文本颜色 */
                --color-auxGray1: #E0E0E0;      /* 边框、分隔线和按钮背景 */
                --color-auxGray2: #9E9E9E;      /* 次要文本和图标颜色 */
                --color-dynamicGray: #616161;   /* H3标题等中等重要性元素 */
                --color-hoverGray: #BDBDBD;     /* 交互元素悬停状态 */
                --color-white: #FFFFFF;         /* 卡片和内容区块背景 */
                --color-deepGray: #424242;      /* 特殊元素强调色 */
              }
              .dark {
                /* 暗黑主题颜色变量 */
                --color-primaryGray: #121212;   /* 深色模式背景 */
                --color-accentBlack: #E0E0E0;   /* 深色模式标题颜色 */
                --color-auxGray1: #424242;      /* 深色模式边框/分隔线 */
                --color-auxGray2: #9E9E9E;      /* 深色模式次要文本 */
                --color-dynamicGray: #BDBDBD;   /* 深色模式H3标题 */
                --color-hoverGray: #616161;     /* 深色模式悬停状态 */
                --color-white: #1F1F1F;         /* 深色模式卡片背景 */
                --color-deepGray: #E0E0E0;      /* 深色模式特殊元素 */
              }
            `,
    },
    sysPreflights,
  ],
});
