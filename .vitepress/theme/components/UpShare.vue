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

// 署名卡用内联样式 + 主题变量，插入活 DOM 后由 snapdom 内联计算样式
const makeHeaderCard = () => {
  const header = document.createElement("div");
  header.style.cssText =
    "padding:32px 36px 24px;border-bottom:1px solid var(--color-auxGray1)";
  header.innerHTML = `
    <div style="font-size:13px;letter-spacing:.12em;color:var(--color-aux2)">${site.value.title}</div>
    <div style="font-size:24px;font-weight:600;line-height:1.4;margin-top:10px;color:var(--color-accentBlack)">${pageTitle.value}</div>
    <div style="font-size:13px;margin-top:10px;color:var(--color-aux2)">${shareDate.value}</div>
  `;
  return header;
};

const makeFooterCard = (qrDataUrl: string) => {
  const footer = document.createElement("div");
  footer.style.cssText =
    "display:flex;align-items:center;justify-content:space-between;padding:24px 36px 32px;border-top:1px solid var(--color-auxGray1)";
  footer.innerHTML = `
    <div>
      <div style="font-size:14px;font-weight:600;color:var(--color-accentBlack)">${site.value.title}</div>
      <div style="font-size:13px;margin-top:4px;color:var(--color-aux2)">${window.location.origin}</div>
    </div>
    <img alt="文章二维码" style="width:88px;height:88px" src="${qrDataUrl}" />
  `;
  return footer;
};

const shareDate = computed(() => {
  const date = frontmatter.value.date as string | undefined;
  return date ? String(date).slice(0, 10) : dayjs().format("YYYY-MM-DD");
});

const generateImage = async () => {
  generating.value = true;
  try {
    const qrDataUrl = await QRCode.toDataURL(window.location.href, {
      width: 176,
      margin: 1,
      // 二维码固定黑底白码，保证任何主题下都可扫
      color: { dark: "#000000", light: "#ffffff" },
    });

    const docEle = document.getElementById("up-content");
    if (!docEle) {
      ElNotification.error({ title: "生成失败", message: "未找到文章内容" });
      return;
    }

    // 署名卡临时插进活的 DOM（snapdom 对活 DOM 的渲染最可靠），捕获完立即移除
    const mount = docEle.querySelector(".up-body") ?? docEle;
    const header = makeHeaderCard();
    const footer = makeFooterCard(qrDataUrl);
    // 捕获期间隐藏"返回"按钮（UpBack 根节点带 .up-back 标记）
    const backBoxes = [...docEle.querySelectorAll(".up-back")];
    backBoxes.forEach((el) => (el.style.display = "none"));
    mount.insertBefore(header, mount.firstChild);
    mount.appendChild(footer);

    try {
      // 背景跟随当前主题；snapdom 2.0.1 的 dpr/scale 选项不生效，用显式 2 倍宽高导出高清图。
      // 注意 toBlob 必须显式 type: "png"——snapdom 默认 type 是 svg，
      // 会直接返回 SVG blob，以 <img> 渲染时 foreignObject 内容会丢失
      const bgColor = getComputedStyle(document.body).backgroundColor || "#ffffff";
      const captureResult = await snapdom(docEle, {
        width: docEle.offsetWidth * 2,
        height: docEle.offsetHeight * 2,
        backgroundColor: bgColor,
      });
      shareBlob = await captureResult.toBlob({ type: "png" });
      previewUrl.value = URL.createObjectURL(shareBlob);
      previewVisible.value = true;
    } finally {
      header.remove();
      footer.remove();
      backBoxes.forEach((el) => (el.style.display = ""));
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
