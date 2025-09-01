<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import "./up-doc.css";

const { width: vw } = useWindowSize({
  initialWidth: 0,
  includeScrollbar: false,
});
</script>

<template>
  <div
    class="up-doc fade-in-down"
    :style="vw ? { '--vp-offset': `calc(50% - ${vw / 2}px)` } : {}"
  >
    <slot />
  </div>
</template>

<style scoped>
.vp-doc :deep(.VPHomeSponsors),
.vp-doc :deep(.VPTeamPage) {
  margin-left: var(--vp-offset, calc(50% - 50vw));
  margin-right: var(--vp-offset, calc(50% - 50vw));
}

.vp-doc :deep(.VPHomeSponsors h2) {
  border-top: none;
  letter-spacing: normal;
}

.vp-doc :deep(.VPHomeSponsors a),
.vp-doc :deep(.VPTeamPage a) {
  text-decoration: none;
}
</style>
