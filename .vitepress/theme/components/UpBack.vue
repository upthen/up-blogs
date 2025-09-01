<!-- @description -->
<template>
  <div class="w-full h-40px">
    >
    <a
      href="#"
      class="px-1 underline-slide-in text-aux2 hover:op70"
      @click="handBack"
    >
      cd..
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "UpBack",
});

const handBack = () => {
  if (window !== undefined) {
    window.history.go(-1);
  }
};
</script>

<style scoped lang="scss"></style>
