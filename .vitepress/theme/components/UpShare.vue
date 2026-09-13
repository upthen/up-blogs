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
      <button class="up-share-action" @click="generateImage">生成分享图</button>
      <button class="up-share-action" @click="copyLink">复制链接</button>
      <button v-if="canSystemShare" class="up-share-action" @click="systemShare">
        系统分享
      </button>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useData } from "vitepress";
import { snapdom } from "@zumer/snapdom";
import { ElNotification } from "element-plus";

const { frontmatter } = useData();

// 仅文章正文页显示分享入口，首页/列表页隐藏
const visible = computed(
  () => !["list", "home"].includes(frontmatter.value.layout)
);

const canSystemShare = computed(
  () => typeof navigator !== "undefined" && typeof navigator.share === "function"
);

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

const generateImage = async () => {
  const docEle = document.getElementById("up-content");
  if (!docEle) return;
  const snapdomResult = await snapdom(docEle, {
    backgroundColor: "#ffffff",
    format: "png",
    quality: 1,
    scale: 1,
  });
  if (snapdomResult) {
    await snapdomResult.download(`up-content.png`);
    ElNotification.success({
      title: "分享成功",
      message: "图片已保存到本地",
    });
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
}
</style>
