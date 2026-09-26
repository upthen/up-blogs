<template>
  <canvas ref="canvasRef" class="up-dot-grid" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useEventListener, usePreferredReducedMotion } from "@vueuse/core";

/* ======================= 方案C「网格微光」参数 =======================
   点间距 24 / 点径 1 / 呼吸幅度小但覆盖广（比例 45%）/
   光晕 220 大而弱 / vignette 稍强。设计稿见 design-mockups/方案C-网格微光.html */
const SCHEME = {
  // 点阵
  spacing: 24, // 点间距 px
  dotSize: 1.0, // 底层点径 px
  baseAlpha: 0.4, // 暗色模式基础点透明度
  lightAlpha: 0.42, // 亮色模式点透明度（深灰静态点阵）
  // 呼吸场
  breatheRatio: 0.45, // 参与呼吸的点比例（覆盖广）
  breatheAmp: 0.4, // 呼吸峰值附加亮度（共识确认后加亮：0.30 → 0.40）
  breatheLo: 0.38, // 噪声触发下阈
  breatheHi: 0.88, // 噪声饱和上阈
  fieldScale: 1 / 220, // 噪声场空间频率（波长越长光斑越绵延）
  timeRate: 0.09, // 时间速率：呼吸节奏更慢
  // 鼠标光晕
  glowRadius: 220, // 光晕半径 px（大而弱）
  glowGain: 0.36, // 光晕内点增亮上限（0.30 → 0.36）
  glowSpot: 0.13, // 光晕斑本体峰值透明度（0.10 → 0.13）
  glowLambda: 7, // 跟随刚度（指数 lerp，越大越跟手）
  fadeLambda: 3.0, // 鼠标离开窗口后的淡出速度
  // 边缘渐隐
  vignette: 0.46, // 暗色模式边缘渐暗
  lightEdgeFade: 0.75, // 亮色模式点阵向边缘渐隐（不压暗背景）
};

const TAU = Math.PI * 2;
const DPR_CAP = 2; // devicePixelRatio 封顶
const BUCKETS = 14; // 亮度分桶，减少 fillStyle 切换
const STATIC_T = 16.0; // 降级静态帧的时间点（呼吸场中段，波形丰富）

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isDark = ref(false);
const reducedMotion = usePreferredReducedMotion();

let ctx: CanvasRenderingContext2D | null = null;
let W = 0,
  H = 0,
  dpr = 1;
let dotX: Float32Array | null = null;
let dotY: Float32Array | null = null;
let dotCount = 0;
let breathers: number[] = []; // 参与呼吸的点，扁平 [x,y,x,y,...]
let baseLayer: HTMLCanvasElement | null = null; // 静态层缓存：点阵 + vignette，画一次
let glowSprite: HTMLCanvasElement | null = null;
let breatheColors: string[] = [];
let rafId = 0;
let lastNow = 0;
let startNow = -1;
let finePointer = false;
let classObserver: MutationObserver | null = null;

const glow = { x: 0, y: 0, tx: 0, ty: 0, a: 0, ta: 0, seen: false };

/* ======================= 确定性 value noise（3D） ======================= */
function hash3i(x: number, y: number, z: number): number {
  let h =
    Math.imul(x, 0x27d4eb2f) ^
    Math.imul(y, 0x165667b1) ^
    Math.imul(z, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const fade = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// 三维 value noise，第三维作为时间轴 → 相邻点明暗天然相关（联动呼吸）
function noise3(x: number, y: number, z: number): number {
  const xi = Math.floor(x),
    yi = Math.floor(y),
    zi = Math.floor(z);
  const u = fade(x - xi),
    v = fade(y - yi),
    w = fade(z - zi);
  const n000 = hash3i(xi, yi, zi),
    n100 = hash3i(xi + 1, yi, zi);
  const n010 = hash3i(xi, yi + 1, zi),
    n110 = hash3i(xi + 1, yi + 1, zi);
  const n001 = hash3i(xi, yi, zi + 1),
    n101 = hash3i(xi + 1, yi, zi + 1);
  const n011 = hash3i(xi, yi + 1, zi + 1),
    n111 = hash3i(xi + 1, yi + 1, zi + 1);
  const a = n000 + (n100 - n000) * u,
    b = n010 + (n110 - n010) * u;
  const c = n001 + (n101 - n001) * u,
    d = n011 + (n111 - n011) * u;
  const e = a + (b - a) * v,
    f = c + (d - c) * v;
  return e + (f - e) * w; // [0, 1)
}

/* ======================= 构建：点阵 / 精灵 / 静态层 ======================= */
function rebuild() {
  const canvas = canvasRef.value;
  if (!canvas || !ctx) return;
  W = window.innerWidth;
  H = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
  canvas.width = Math.max(1, Math.round(W * dpr));
  canvas.height = Math.max(1, Math.round(H * dpr));
  buildGrid();
  buildSprites();
  buildBreatheColors();
  buildBaseLayer();
}

function buildGrid() {
  const s = SCHEME.spacing;
  const offX = (((W % s) + s) % s) / 2; // 让点阵在视口内近似居中
  const offY = (((H % s) + s) % s) / 2;
  const cols = Math.floor((W - offX) / s) + 1;
  const rows = Math.floor((H - offY) / s) + 1;

  dotCount = cols * rows;
  dotX = new Float32Array(dotCount);
  dotY = new Float32Array(dotCount);

  breathers = [];
  let k = 0;
  for (let j = 0; j < rows; j++) {
    const y = offY + j * s;
    for (let i = 0; i < cols; i++) {
      const x = offX + i * s;
      dotX[k] = x;
      dotY[k] = y;
      k++;
      // 确定性哈希选点：按比例选出参与呼吸的点
      if (hash3i(i, j, 0x51ed27) < SCHEME.breatheRatio) breathers.push(x, y);
    }
  }
}

function makeSprite(sizeCss: number, stops: Array<[number, string]>) {
  const c = document.createElement("canvas");
  c.width = c.height = Math.max(2, Math.round(sizeCss * dpr));
  const g = c.getContext("2d");
  if (!g) return c;
  const r = c.width / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  for (const [o, col] of stops) grad.addColorStop(o, col);
  g.fillStyle = grad;
  g.fillRect(0, 0, c.width, c.height);
  return c;
}

function buildSprites() {
  glowSprite = makeSprite(SCHEME.glowRadius * 2, [
    [0, `rgba(232,244,255,${SCHEME.glowSpot})`],
    [0.35, `rgba(154,216,250,${(SCHEME.glowSpot * 0.5).toFixed(3)})`],
    [1, "rgba(125,211,252,0)"],
  ]);
}

function buildBreatheColors() {
  breatheColors = [];
  for (let i = 0; i < BUCKETS; i++) {
    const u = (i + 0.5) / BUCKETS; // 桶内代表强度
    const m = Math.pow(u, 0.8); // 强度越高，色相越趋近白（亮核趋白）
    const r = Math.round(125 + 125 * m); // 125 → 250
    const g = Math.round(211 + 41 * m); // 211 → 252
    const b = Math.round(252 + 3 * m); // 252 → 255
    breatheColors.push(
      `rgba(${r},${g},${b},${(SCHEME.breatheAmp * u).toFixed(3)})`,
    );
  }
}

function buildBaseLayer() {
  if (!baseLayer || !dotX || !dotY) return;
  baseLayer.width = Math.max(1, Math.round(W * dpr));
  baseLayer.height = Math.max(1, Math.round(H * dpr));
  const b = baseLayer.getContext("2d");
  if (!b) return;
  b.setTransform(dpr, 0, 0, dpr, 0, 0);
  b.clearRect(0, 0, W, H);

  // 底层点阵（只画一次，缓存）；画布透明，站点 body 背景色透出
  b.fillStyle = isDark.value
    ? `rgba(213,220,229,${SCHEME.baseAlpha})` // 暗色：灰白点阵
    : `rgba(58,60,66,${SCHEME.lightAlpha})`; // 亮色：深灰静态点阵
  const r = SCHEME.dotSize / 2;
  b.beginPath();
  for (let k = 0; k < dotCount; k++) {
    b.moveTo(dotX[k] + r, dotY[k]);
    b.arc(dotX[k], dotY[k], r, 0, TAU);
  }
  b.fill();

  const grad = b.createRadialGradient(
    W / 2,
    H / 2,
    Math.min(W, H) * 0.45,
    W / 2,
    H / 2,
    Math.hypot(W, H) * 0.52,
  );
  grad.addColorStop(0, "rgba(0,0,0,0)");
  if (isDark.value) {
    // 边缘渐暗 vignette
    grad.addColorStop(1, `rgba(0,0,0,${SCHEME.vignette})`);
    b.fillStyle = grad;
    b.fillRect(0, 0, W, H);
  } else {
    // 亮色：不压暗背景，仅让点阵向边缘渐隐
    grad.addColorStop(1, `rgba(0,0,0,${SCHEME.lightEdgeFade})`);
    b.globalCompositeOperation = "destination-out";
    b.fillStyle = grad;
    b.fillRect(0, 0, W, H);
    b.globalCompositeOperation = "source-over";
  }
}

/* ======================= 动态绘制（仅暗色模式） ======================= */
function drawBreathing(t: number) {
  if (!dotX || !dotY) return;
  const zs = t * SCHEME.timeRate;
  const fs = SCHEME.fieldScale;
  const lo = SCHEME.breatheLo,
    hi = SCHEME.breatheHi;

  // 噪声场采样 → 亮度分桶，减少 fillStyle 切换
  const buckets: Array<number[] | undefined> = new Array(BUCKETS);
  for (let k = 0; k < breathers.length; k += 2) {
    const x = breathers[k],
      y = breathers[k + 1];
    const n = noise3(x * fs, y * fs, zs);
    const it = smoothstep(lo, hi, n);
    if (it < 0.03) continue;
    const bi = Math.min(BUCKETS - 1, (it * BUCKETS) | 0);
    (buckets[bi] || (buckets[bi] = [])).push(x, y);
  }

  for (let bi = 0; bi < BUCKETS; bi++) {
    const arr = buckets[bi];
    if (!arr) continue;
    const u = (bi + 0.5) / BUCKETS;
    ctx!.fillStyle = breatheColors[bi];
    ctx!.beginPath();
    const rr = (SCHEME.dotSize / 2) * (1 + u * 0.4); // 越亮微微越大，光感更柔
    for (let k = 0; k < arr.length; k += 2) {
      ctx!.moveTo(arr[k] + rr, arr[k + 1]);
      ctx!.arc(arr[k], arr[k + 1], rr, 0, TAU);
    }
    ctx!.fill();
  }
}

function drawGlowDots() {
  if (!dotX || !dotY) return;
  const R = SCHEME.glowRadius,
    R2 = R * R;
  const gx = glow.x,
    gy = glow.y;
  const buckets: Array<number[] | undefined> = new Array(BUCKETS);

  // 光晕范围内的点随距离衰减增亮，与呼吸场叠加
  for (let k = 0; k < dotCount; k++) {
    const dx = dotX[k] - gx,
      dy = dotY[k] - gy;
    const d2 = dx * dx + dy * dy;
    if (d2 >= R2) continue;
    let f = 1 - Math.sqrt(d2) / R;
    f = f * f * f; // 三次衰减，边缘更柔
    const bi = Math.min(BUCKETS - 1, (f * BUCKETS) | 0);
    (buckets[bi] || (buckets[bi] = [])).push(dotX[k], dotY[k]);
  }

  const r = SCHEME.dotSize * 0.62;
  for (let bi = 0; bi < BUCKETS; bi++) {
    const arr = buckets[bi];
    if (!arr) continue;
    const a = SCHEME.glowGain * glow.a * ((bi + 0.5) / BUCKETS);
    ctx!.fillStyle = `rgba(224,243,255,${a.toFixed(3)})`;
    ctx!.beginPath();
    for (let k = 0; k < arr.length; k += 2) {
      ctx!.moveTo(arr[k] + r, arr[k + 1]);
      ctx!.arc(arr[k], arr[k + 1], r, 0, TAU);
    }
    ctx!.fill();
  }
}

function drawGlowSpot() {
  const R = SCHEME.glowRadius;
  ctx!.globalAlpha = glow.a;
  ctx!.drawImage(glowSprite!, glow.x - R, glow.y - R, R * 2, R * 2);
  ctx!.globalAlpha = 1;
}

function render(t: number) {
  if (!ctx || !baseLayer) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(baseLayer, 0, 0, W, H);
  if (!isDark.value) return; // 亮色模式：完全静态，无光、无交互

  ctx.globalCompositeOperation = "lighter";
  drawBreathing(t);
  if (glow.a > 0.008) {
    drawGlowDots();
    drawGlowSpot();
  }
  ctx.globalCompositeOperation = "source-over";
}

/* ======================= 主循环与鼠标光晕 ======================= */
function updateGlow(dt: number) {
  const kp = 1 - Math.exp(-SCHEME.glowLambda * dt); // 帧率无关的指数 lerp
  glow.x += (glow.tx - glow.x) * kp;
  glow.y += (glow.ty - glow.y) * kp;
  const ka = 1 - Math.exp(-SCHEME.fadeLambda * dt);
  glow.a += (glow.ta - glow.a) * ka;
}

function loop(now: number) {
  if (startNow < 0) startNow = now;
  const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016;
  lastNow = now;
  updateGlow(dt);
  render((now - startNow) / 1000);
  rafId = requestAnimationFrame(loop);
}

function startLoop() {
  if (rafId || !ctx) return;
  lastNow = 0;
  startNow = -1;
  rafId = requestAnimationFrame(loop);
}

function stopLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

// 依当前主题与动效偏好决定：跑动画，还是渲染一帧静态点阵
function syncLoop() {
  if (isDark.value && reducedMotion.value !== "reduce") {
    startLoop();
  } else {
    stopLoop();
    render(STATIC_T);
  }
}

/* ======================= 生命周期 ======================= */
onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  if (!ctx) return;
  baseLayer = document.createElement("canvas");
  finePointer = window.matchMedia("(pointer: fine)").matches;

  isDark.value = document.documentElement.classList.contains("dark");
  classObserver = new MutationObserver(() => {
    isDark.value = document.documentElement.classList.contains("dark");
  });
  classObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  rebuild();
  syncLoop();

  if (finePointer) {
    useEventListener(window, "mousemove", (e: MouseEvent) => {
      if (!glow.seen) {
        // 首次进入：光晕直接出现在鼠标处，不飞入
        glow.x = glow.tx = e.clientX;
        glow.y = glow.ty = e.clientY;
        glow.seen = true;
      }
      glow.tx = e.clientX;
      glow.ty = e.clientY;
      glow.ta = 1;
    }, { passive: true });
    useEventListener(document, "mouseout", (e: MouseEvent) => {
      if (!e.relatedTarget) glow.ta = 0; // 鼠标离开窗口 → 光晕平滑淡出
    });
    useEventListener(window, "blur", () => {
      glow.ta = 0;
    });
  }

  useEventListener(window, "resize", () => {
    rebuild();
    if (!rafId) render(STATIC_T); // 静态模式下 resize 后补一帧
  });
  useEventListener(document, "visibilitychange", () => {
    if (document.hidden) stopLoop();
    else syncLoop();
  });
});

onBeforeUnmount(() => {
  stopLoop();
  classObserver?.disconnect();
  classObserver = null;
});

watch(isDark, () => {
  glow.ta = 0;
  glow.a = 0;
  rebuild();
  syncLoop();
});
watch(reducedMotion, () => syncLoop());
</script>

<style scoped>
.up-dot-grid {
  position: fixed;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}
</style>
