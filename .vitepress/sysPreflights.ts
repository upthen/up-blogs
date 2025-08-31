export default {
  getCSS: () => `
    /* 基础重置 */
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    /* 文档元素 */
    html {
      line-height: 1.5;
      -webkit-text-size-adjust: 100%;
      -moz-tab-size: 4;
      tab-size: 4;
    }

    /* body 基础样式 */
    body {
      margin: 0;
      padding: 0;
      font-family: 'STZhongsong', 'SimSun', serif , system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
      line-height: inherit;
    }

    /* 标题元素 */
    h1, h2, h3, h4, h5, h6 {
      font-size: inherit;
      font-weight: inherit;
    }

    /* 列表元素 */
    ol, ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    /* 图片和媒体元素 */
    img, svg, video, canvas, audio, iframe, embed, object {
      display: block;
      vertical-align: middle;
    }

    img, video {
      max-width: 100%;
      height: auto;
    }

    /* 表单元素 */
    button, input, optgroup, select, textarea {
      font-family: inherit;
      font-size: 100%;
      line-height: inherit;
      color: inherit;
      margin: 0;
      padding: 0;
    }

    button, select {
      text-transform: none;
    }

    /* 按钮 */
    button,
    [type='button'],
    [type='reset'],
    [type='submit'] {
      -webkit-appearance: button;
      background-color: transparent;
      background-image: none;
    }

    /* 表格 */
    table {
      text-indent: 0;
      border-color: inherit;
      border-collapse: collapse;
    }

    /* 水平线 */
    hr {
      height: 0;
      color: inherit;
      border-top-width: 1px;
    }

    /* 文本样式 */
    a {
      color: inherit;
      text-decoration: inherit;
    }

    abbr:where([title]) {
      text-decoration: underline dotted;
    }

    b, strong {
      font-weight: bolder;
    }

    code, kbd, samp, pre {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 1em;
    }

    small {
      font-size: 80%;
    }

    sub, sup {
      font-size: 75%;
      line-height: 0;
      position: relative;
      vertical-align: baseline;
    }

    sub {
      bottom: -0.25em;
    }

    sup {
      top: -0.5em;
    }

    /* 表单输入 */
    button,
    input,
    optgroup,
    select,
    textarea {
      padding: 0;
      line-height: inherit;
      color: inherit;
    }

    /* 聚焦样式 */
    :focus {
      outline: none;
    }
  `,
}
