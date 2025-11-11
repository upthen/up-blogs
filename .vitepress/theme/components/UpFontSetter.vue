<template>
  <ul class="cursor-pointer select-none">
    <li
      v-for="(item, index) in fontFamilies"
      :key="index"
      @click="setFontFamily(item)"
      class="py-1"
    >
      <span class="underline-slide-in">{{ item.name }}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import fontFamilies from "./font.config";
defineOptions({
  name: "UpFontSetter",
});

const fontFamily = ref(
  (() => {
    if (window !== undefined && window.localStorage) {
      return localStorage?.getItem("fontFamily") || fontFamilies[0].value;
    }
    return fontFamilies[0].value;
  })()
);

const setFontFamily = (family: { name: string; value: string }) => {
  // 设置全局字体
  document.body.style.fontFamily = family.value;
  fontFamily.value = family.value;
  if (window !== undefined && window.localStorage) {
    // 检查是否支持 localStorage
    localStorage?.setItem("fontFamily", family.value);
  }
};

onMounted(() => {
  document.body.style.fontFamily = fontFamily.value;
});
</script>

<style scoped></style>
