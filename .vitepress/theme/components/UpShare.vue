<template>
  <el-popover
    v-if="visible"
    placement="left-start"
    :width="160"
    trigger="click"
  >
    <template #reference>
      <div
        class="up-share-entry flex items-center rounded-full w-8 h-8 border-rd text-aux1"
      >
        <div
          class="up-share-entry-icon cursor-pointer h-full w-full flex items-center justify-center"
          hover:op90
        >
          <div class="i-material-symbols-light:share" text-accent dark:text-accent></div>
        </div>
      </div>
    </template>
    <div class="flex flex-col gap-1">
      <button class="up-share-action" :disabled="generating" @click="generateImage">
        {{ generating ? "生成中…" : "生成分享图" }}
      </button>
      <button class="up-share-action" @click="copyLink">复制链接</button>
      <button v-if="canSystemShare" class="up-share-action" @click="systemShare">
        系统分享
      </button>
    </div>
  </el-popover>

  <el-dialog
    v-model="previewVisible"
    :width="!isMobile ? '680px' : '86%'"
    align-center
    title="分享图预览"
  >
    <img v-if="previewUrl" :src="previewUrl" alt="分享图预览" class="w-full rd-8px" />
    <template #footer>
      <el-button @click="previewVisible = false">取消</el-button>
      <el-button v-if="canSystemShare" @click="shareImage">转发 / 保存</el-button>
      <el-button type="primary" @click="downloadImage">下载</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useData } from "vitepress";
import { useWindowSize } from "@vueuse/core";
import { snapdom } from "@zumer/snapdom";
import QRCode from "qrcode";
import { ElNotification } from "element-plus";
import dayjs from "dayjs";

const { frontmatter, site } = useData();

// 仅文章正文页显示分享入口，首页/列表页隐藏
const visible = computed(
  () => !["list", "home"].includes(frontmatter.value.layout)
);

const { width: windowWidth } = useWindowSize();
const isMobile = computed(() => windowWidth.value <= 640);

const canSystemShare = computed(
  () => typeof navigator !== "undefined" && typeof navigator.share === "function"
);

const pageTitle = computed(
  () =>
    (frontmatter.value.title as string) ||
    (typeof document !== "undefined" ? document.title : "")
);

// 文件名保留中英文与数字，替换文件系统非法字符
const imageName = computed(() =>
  pageTitle.value.replace(/[\\/:*?"<>|\s]+/g, "-").replace(/^-+|-+$/g, "")
);

const generating = ref(false);
const previewVisible = ref(false);
const previewUrl = ref("");
let shareBlob: Blob | null = null;

// 关闭预览后释放 object URL，避免长图占用内存
watch(previewVisible, (visible) => {
  if (!visible) {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = "";
    shareBlob = null;
  }
});

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    ElNotification.success({ title: "链接已复制", message: "快去粘贴给朋友吧" });
  } catch {
    ElNotification.error({ title: "复制失败", message: "请手动复制地址栏链接" });
  }
};

const systemShare = async () => {
  try {
    await navigator.share({ title: document.title, url: window.location.href });
  } catch (err) {
    // 用户主动取消系统分享面板不算失败
    if ((err as DOMException)?.name !== "AbortError") {
      ElNotification.error({ title: "分享失败", message: "请稍后重试" });
    }
  }
};

// 设计 A · 素笺：通栏署名卡，用内联样式 + 主题变量，插入活 DOM 后由 snapdom 内联计算样式
const makeHeaderCard = () => {
  const header = document.createElement("div");
  header.style.cssText =
    "padding:56px 60px 32px;border-bottom:1px solid var(--color-auxGray1)";
  header.innerHTML = `
    <div style="font-size:14px;letter-spacing:.35em;color:var(--color-aux2)">${site.value.title}</div>
    <div style="font-size:34px;font-weight:600;line-height:1.5;margin-top:18px;color:var(--color-accentBlack)">${pageTitle.value}</div>
    <div style="font-size:14px;letter-spacing:.08em;color:var(--color-aux2);margin-top:14px">${shareDate.value}</div>
  `;
  return header;
};

const makeFooterCard = (qrDataUrl: string) => {
  const footer = document.createElement("div");
  footer.style.cssText =
    "display:flex;align-items:center;justify-content:space-between;padding:28px 60px 44px;border-top:1px solid var(--color-auxGray1)";
  footer.innerHTML = `
    <div>
      <div style="font-size:16px;font-weight:600;color:var(--color-accentBlack)">${site.value.title}</div>
      <div style="font-size:13px;color:var(--color-aux2);margin-top:5px">${window.location.origin}</div>
    </div>
    <div style="padding:7px;border:1px solid var(--color-auxGray1);border-radius:10px;flex:none">
      <img alt="文章二维码" style="width:84px;height:84px;display:block" src="${qrDataUrl}" />
    </div>
  `;
  return footer;
};

const shareDate = computed(() => {
  const date = frontmatter.value.date as string | undefined;
  const raw = date ? String(date).slice(0, 10) : dayjs().format("YYYY-MM-DD");
  return raw.replaceAll("-", " / ");
});

// 正文节选区最大高度：超出即截断并用渐变过渡到卡片底色（同时避免长文导出超 canvas 上限）
const EXCERPT_MAX = 620;
// 渐隐过渡带高度：从半透明到完全融入卡片底色
const FADE_HEIGHT = 180;

const generateImage = async () => {
  generating.value = true;
  try {
    // 二维码深浅模块跟随主题文字色、底色透明融入卡片，避免暗色主题下刺眼的白色方块；
    // 模块色与卡片底色对比度足够（约 12:1），不影响扫码
    const themeDark = document.documentElement.classList.contains("dark");
    const qrDataUrl = await QRCode.toDataURL(window.location.href, {
      width: 184,
      margin: 1,
      color: {
        dark: themeDark ? "#e0e0e0" : "#212121",
        light: "#00000000",
      },
    });

    const docEle = document.getElementById("up-content");
    if (!docEle) {
      ElNotification.error({ title: "生成失败", message: "未找到文章内容" });
      return;
    }
    const card = docEle.querySelector(".up-body") ?? docEle;
    const content = card.querySelector(".up-doc") ?? card.firstElementChild;

    // 记录原状，捕获后恢复
    const docStyle = docEle.getAttribute("style");
    const cardStyle = card.getAttribute("style");
    const contentStyle = content?.getAttribute("style") ?? null;
    const backBoxes = [...docEle.querySelectorAll(".up-back")];

    const header = makeHeaderCard();
    const footer = makeFooterCard(qrDataUrl);
    const fade = document.createElement("div");
    fade.style.cssText =
      "position:absolute;left:0;right:0;bottom:0;height:" +
      FADE_HEIGHT +
      "px;background:linear-gradient(to bottom, transparent, var(--color-white));pointer-events:none";

    // 捕获期间临时"着装"：#up-content 即通栏白色卡片（设计 A，无幕布、无圆角）。
    // main#up-content 带 min-height:calc(100dvh-200px)，会把视口高度的空白区截进图里，压掉它
    backBoxes.forEach((el) => (el.style.display = "none"));
    docEle.style.cssText += ";background:var(--color-white);min-height:0";
    card.insertBefore(header, card.firstChild);
    card.appendChild(footer);

    // 长文截断：限制正文高度并加半隐→全隐渐变；短文不加，保持自适应
    const cutEls: HTMLElement[] = [];
    const tocEls: HTMLElement[] = [];
    const dupH1s: HTMLElement[] = [];
    if (content) {
      // 正文容器带 fade-in-down 入场动画（基础 opacity:0），
      // 后台标签或克隆场景下动画可能停在第一帧导致正文透明，捕获前强制可见
      content.style.cssText += ";animation:none;opacity:1";

      // 正文开头的 h1 与署名卡标题重复（设计稿正文直接从内容开始），捕获期间隐藏；
      // 只处理位于正文顶部的 h1，避免误伤文章中间的 h1
      const contentTop = content.getBoundingClientRect().top;
      for (const h of content.querySelectorAll("h1")) {
        if (h.getBoundingClientRect().top - contentTop < 150) {
          dupH1s.push(h as HTMLElement);
        }
        break;
      }
      dupH1s.forEach((el) => (el.style.display = "none"));

      // 作者手写的目录段（"## 目录/TOC/Contents" 标题 + 后续列表直到下一个标题/分隔线）
      // 不是正文，节选图里跳过：临时隐藏，捕获后还原
      for (const h of content.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
        if (/目录|contents|toc/i.test(h.textContent || "")) {
          tocEls.push(h as HTMLElement);
          let sib = h.nextElementSibling;
          while (sib && !/^H[1-6]$/.test(sib.tagName)) {
            tocEls.push(sib as HTMLElement);
            sib = sib.nextElementSibling;
          }
          break;
        }
      }
      tocEls.forEach((el) => (el.style.display = "none"));
    }
    if (content && content.scrollHeight > EXCERPT_MAX) {
      content.style.cssText +=
        `;position:relative;max-height:${EXCERPT_MAX}px;overflow:hidden`;
      content.appendChild(fade);
      // 给节选区以下的元素打标记，交给 snapdom 从克隆中整体剔除，
      // 否则它会内联整篇（数万 px）子树的样式导致挂起。
      // 注意边界必须是 EXCERPT_MAX 而非减去渐隐带：渐隐带内的文字要保留，
      // 否则渐变下面没有文字可溶解，渐隐看起来就像没生效
      const contentTop = content.getBoundingClientRect().top;
      content.querySelectorAll("*").forEach((el) => {
        if (el.contains(fade)) return;
        if (el.getBoundingClientRect().top - contentTop > EXCERPT_MAX) {
          el.classList.add("up-share-cut");
          cutEls.push(el as HTMLElement);
        }
      });
    }

    try {
      // 背景跟随当前主题；snapdom 2.0.1 的 dpr/scale 选项不生效，用显式 2 倍宽高导出高清图。
      // 注意 toBlob 必须显式 type: "png"——snapdom 默认 type 是 svg，
      // 会直接返回 SVG blob，以 <img> 渲染时 foreignObject 内容会丢失
      const bgColor = getComputedStyle(document.body).backgroundColor || "#ffffff";
      const captureResult = await snapdom(docEle, {
        width: docEle.offsetWidth * 2,
        height: docEle.offsetHeight * 2,
        backgroundColor: bgColor,
        exclude: [".up-share-cut"],
        excludeMode: "remove",
      });
      shareBlob = await captureResult.toBlob({ type: "png" });
      previewUrl.value = URL.createObjectURL(shareBlob);
      previewVisible.value = true;
    } finally {
      header.remove();
      footer.remove();
      fade.remove();
      backBoxes.forEach((el) => (el.style.display = ""));
      tocEls.forEach((el) => (el.style.display = ""));
      dupH1s.forEach((el) => (el.style.display = ""));
      cutEls.forEach((el) => el.classList.remove("up-share-cut"));
      if (docStyle === null) docEle.removeAttribute("style");
      else docEle.setAttribute("style", docStyle);
      if (cardStyle === null) card.removeAttribute("style");
      else card.setAttribute("style", cardStyle);
      if (content) {
        if (contentStyle === null) content.removeAttribute("style");
        else content.setAttribute("style", contentStyle);
      }
    }
  } catch {
    ElNotification.error({ title: "生成分享图失败", message: "请稍后重试" });
  } finally {
    generating.value = false;
  }
};

const downloadImage = () => {
  if (!previewUrl.value) return;
  const a = document.createElement("a");
  a.href = previewUrl.value;
  a.download = `${imageName.value}.png`;
  a.click();
  ElNotification.success({ title: "分享成功", message: "图片已保存到本地" });
};

const shareImage = async () => {
  try {
    if (!shareBlob) return;
    const file = new File([shareBlob], `${imageName.value}.png`, { type: "image/png" });
    // 系统分享能否接收文件因平台而异，先探测再调起，不支持则退回下载
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: pageTitle.value });
    } else {
      downloadImage();
    }
  } catch (err) {
    if ((err as DOMException)?.name !== "AbortError") {
      ElNotification.error({ title: "分享失败", message: "请改用下载保存" });
    }
  }
};
</script>

<style scoped lang="scss">
.up-share-entry-icon {
  transition: opacity 0.2s ease;
  opacity: 0.6;
  outline: none;
}

.up-share-action {
  padding: 7px 10px;
  border-radius: 6px;
  text-align: left;
  font-size: 13px;
  line-height: 1.4;
  color: var(--color-accentBlack);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: var(--color-primaryGray);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style>
