<!-- @description -->
<template>
  <div class="up-theme" w-full>
    <h2>BgColor</h2>
    <div flex items-center justify-center gap-col-2>
      <div
        v-for="value in theme"
        :class="`bg-${value}`"
        w-30
        h-20
        rounded-md
        flex
        items-center
        justify-center
        cursor-pointer
      >
        {{ value }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineOptions({
  name: "ComponentName",
});

const theme = [
  "primary",
  "accent",
  "aux1",
  "aux2",
  "dynamic",
  "hover",
  "white",
  "deep",
];
</script>

<style scoped lang="scss"></style>
