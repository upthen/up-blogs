import { createContentLoader } from "vitepress";
import gitlog from "gitlog";
import dayjs from "dayjs";
import { normalizePath } from "vite";
import { getFileBirthTime, getFileLastUpdateTime } from "./content.data";

const config = (globalThis as any).VITEPRESS_CONFIG;

export default createContentLoader("**/**/*.md", {
  includeSrc: false,
  render: false,
  excerpt: true,
  transform(rawData) {
    console.log("rawData", rawData);
    return rawData
      .filter((item) => {
        // 过滤掉不需要显示的文件
        return (
          !item.url.includes(".vitepress") &&
          !item.frontmatter.draft &&
          item.url !== "/" &&
          item.url !== "/essay/" &&
          item.url !== "/coding/" &&
          !item.url.includes("README") && // 过滤 README 文件
          !item.frontmatter.draft
        );
      })
      .map((item) => {
        let fileName = "";
        let fileDate = "";
        if (item.url.endsWith(".html")) {
          fileName =
            item.url.split("/").pop()?.split(".").reverse().pop() ?? "无题";
          fileDate = dayjs().format("YYYY-MM-DD");
        } else if (item.url.endsWith("/")) {
          fileName =
            item.url.slice(0, item.url.lastIndexOf("/")).split("/").pop() ??
            "无题";
          const filePath = normalizePath(`${config.srcDir}/${item.url}`);
          fileDate = dayjs(getFileLastUpdateTime(filePath)).format(
            "YYYY-MM-DD"
          );
        }
        return {
          url: item.url,
          excerpt: item.excerpt,
          frontmatter: item.frontmatter,
          title: item.frontmatter.title || fileName,
          date: item.frontmatter.date || fileDate,
        };
      })
      .sort((a, b) => {
        // 按日期排序，最新的在前面
        return dayjs(b.date).unix() - dayjs(a.date).unix();
      });
  },
});
