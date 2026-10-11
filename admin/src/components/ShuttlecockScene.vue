<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElButton } from "element-plus";
import { RefreshRight, VideoPause, VideoPlay } from "@element-plus/icons-vue";
import fallbackUrl from "../assets/shuttlecock-fallback.svg";
import type { ShuttlecockSceneController } from "../three/shuttlecock";

const host = ref<HTMLElement>();
const status = ref<"loading" | "ready" | "fallback">("loading");
const paused = ref(false);
const reducedMotion = ref(false);
const dragging = ref(false);
const hint = computed(() => {
  if (status.value === "loading") return "正在准备立体视图";
  if (status.value === "fallback") return "每一次挥拍，都是新的开始";
  return dragging.value ? "松开，停留在喜欢的角度" : "拖动旋转 · 发现每一处细节";
});
let controller: ShuttlecockSceneController | undefined;
let disposed = false;
let motionQuery: MediaQueryList | undefined;
let gesture: {
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  captured: boolean;
} | undefined;

function motionChanged() {
  reducedMotion.value = motionQuery?.matches ?? false;
}

function releaseGesture() {
  if (gesture && host.value?.hasPointerCapture(gesture.pointerId)) {
    host.value.releasePointerCapture(gesture.pointerId);
  }
  gesture = undefined;
  dragging.value = false;
}

function pointerDown(event: PointerEvent) {
  if (status.value !== "ready" || !event.isPrimary || event.button !== 0) return;
  releaseGesture();
  gesture = {
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    startX: event.clientX,
    startY: event.clientY,
    lastX: event.clientX,
    lastY: event.clientY,
    captured: event.pointerType !== "touch",
  };
  if (gesture.captured) {
    host.value?.setPointerCapture(event.pointerId);
    dragging.value = true;
  }
  controller?.clearPointer();
}

function pointerMove(event: PointerEvent) {
  if (!controller || !host.value) return;
  if (gesture && event.pointerId === gesture.pointerId) {
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (!gesture.captured && gesture.pointerType === "touch") {
      // The browser owns vertical scrolling; only a deliberate horizontal drag rotates.
      if (Math.abs(dy) > 7 && Math.abs(dy) >= Math.abs(dx)) {
        releaseGesture();
        return;
      }
      if (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      gesture.captured = true;
      host.value.setPointerCapture(event.pointerId);
      dragging.value = true;
    }
    controller.rotate(
      (event.clientX - gesture.lastX) * 0.008,
      gesture.pointerType === "touch" ? 0 : (event.clientY - gesture.lastY) * 0.006,
    );
    gesture.lastX = event.clientX;
    gesture.lastY = event.clientY;
    return;
  }
  if (event.pointerType !== "mouse" || dragging.value) return;
  const bounds = host.value.getBoundingClientRect();
  controller.point(
    ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
    ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
  );
}

function pointerEnd(event: PointerEvent) {
  if (event.pointerId !== gesture?.pointerId) return;
  releaseGesture();
  controller?.clearPointer();
}

function keyboardRotate(event: KeyboardEvent) {
  if (!controller) return;
  const movement: Record<string, [number, number]> = {
    ArrowLeft: [-0.18, 0],
    ArrowRight: [0.18, 0],
    ArrowUp: [0, -0.12],
    ArrowDown: [0, 0.12],
  };
  if (movement[event.key]) {
    event.preventDefault();
    controller.rotate(...movement[event.key]);
  } else if (event.key === "Home" || event.key.toLowerCase() === "r") {
    event.preventDefault();
    controller.reset();
  } else if (event.key === " " && !reducedMotion.value) {
    event.preventDefault();
    if (!event.repeat) paused.value = !paused.value;
  }
}

watch(paused, (value) => controller?.setPaused(value));
watch(reducedMotion, (value) => controller?.setReducedMotion(value));

onMounted(async () => {
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  motionChanged();
  motionQuery.addEventListener("change", motionChanged);
  try {
    const { createShuttlecockScene } = await import("../three/shuttlecock");
    if (disposed || !host.value) return;
    const scene = createShuttlecockScene(host.value, {
      paused: paused.value,
      reducedMotion: reducedMotion.value,
      onError: () => {
        if (disposed) return;
        releaseGesture();
        status.value = "fallback";
        controller = undefined;
      },
    });
    if (disposed) {
      scene.dispose();
      return;
    }
    controller = scene;
    status.value = "ready";
  } catch {
    if (!disposed) status.value = "fallback";
  }
});

onBeforeUnmount(() => {
  disposed = true;
  releaseGesture();
  motionQuery?.removeEventListener("change", motionChanged);
  controller?.dispose();
  controller = undefined;
});
</script>

<template>
  <section class="shuttle-scene" :class="{ 'is-dragging': dragging }">
    <div class="shuttle-scene__halo" aria-hidden="true" />
    <span class="shuttle-scene__detail shuttle-scene__detail--top" aria-hidden="true">16 片羽翼 · 同一份热爱</span>
    <div
      ref="host"
      class="shuttle-scene__stage"
      :class="{ 'is-ready': status === 'ready' }"
      :tabindex="status === 'ready' ? 0 : -1"
      role="group"
      aria-label="羽毛球立体展示。拖动或使用方向键旋转，按 Home 或 R 键恢复视角，空格暂停自动动效。"
      :aria-busy="status === 'loading'"
      @pointerdown="pointerDown"
      @pointermove="pointerMove"
      @pointerup="pointerEnd"
      @pointercancel="pointerEnd"
      @lostpointercapture="pointerEnd"
      @pointerleave="controller?.clearPointer()"
      @keydown="keyboardRotate"
    />
    <img
      v-if="status !== 'ready'"
      class="shuttle-scene__fallback"
      :src="fallbackUrl"
      alt="暖白色羽毛与橙色环带的羽毛球"
    />
    <div class="shuttle-scene__footer">
      <span class="shuttle-scene__hint" role="status">{{ hint }}</span>
      <div v-if="status === 'ready'" class="shuttle-scene__controls">
        <ElButton
          v-if="!reducedMotion"
          class="shuttle-scene__control"
          :icon="paused ? VideoPlay : VideoPause"
          :aria-label="paused ? '继续羽毛球自动动效' : '暂停羽毛球自动动效'"
          :aria-pressed="paused"
          :title="paused ? '继续动效' : '暂停动效'"
          native-type="button"
          circle
          @click="paused = !paused"
        />
        <ElButton
          class="shuttle-scene__control"
          :icon="RefreshRight"
          aria-label="恢复羽毛球初始视角"
          title="恢复视角"
          native-type="button"
          circle
          @click="controller?.reset()"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.shuttle-scene {
  position: relative;
  height: clamp(280px, 45vh, 490px);
  width: 100%;
  isolation: isolate;
}

.shuttle-scene__halo {
  position: absolute;
  inset: 8% 12% 13%;
  z-index: -1;
  border: 1px solid rgb(81 103 79 / 8%);
  border-radius: 50%;
  background: radial-gradient(ellipse, rgb(255 254 249 / 88%), rgb(250 244 230 / 12%) 65%, transparent 72%);
  pointer-events: none;
}

.shuttle-scene__halo::before {
  position: absolute;
  inset: 11%;
  border: 1px solid rgb(81 103 79 / 5%);
  border-radius: inherit;
  content: "";
}

.shuttle-scene__stage,
.shuttle-scene__fallback {
  position: absolute;
  inset: 0 0 24px;
  width: 100%;
  height: calc(100% - 24px);
}

.shuttle-scene__stage {
  touch-action: pan-y;
  border-radius: 24px;
  outline: 2px solid transparent;
  outline-offset: -4px;
  transition: outline-color 180ms ease;
}

.shuttle-scene__stage.is-ready {
  cursor: grab;
}

.shuttle-scene.is-dragging .shuttle-scene__stage {
  cursor: grabbing;
}

.shuttle-scene__stage:focus-visible {
  outline-color: var(--el-color-primary, #d97842);
}

.shuttle-scene__fallback {
  object-fit: contain;
  pointer-events: none;
}

.shuttle-scene__detail {
  position: absolute;
  z-index: 1;
  color: #7c8174;
  font-size: 10px;
  letter-spacing: 0.18em;
  pointer-events: none;
}

.shuttle-scene__detail--top {
  top: 8%;
  left: 4%;
  writing-mode: vertical-rl;
}

.shuttle-scene__footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  min-height: 34px;
}

.shuttle-scene__hint {
  color: #727b6c;
  font-size: 11px;
  letter-spacing: 0.05em;
}

.shuttle-scene__controls {
  display: flex;
  gap: 7px;
}

.shuttle-scene__control.el-button {
  --el-button-bg-color: rgb(255 255 250 / 65%);
  --el-button-border-color: rgb(77 101 77 / 15%);
  --el-button-text-color: #62745e;
  --el-button-hover-bg-color: #fffaf1;
  --el-button-hover-border-color: #d97842;
  --el-button-hover-text-color: #b26033;
  width: 30px;
  height: 30px;
  margin: 0;
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.shuttle-scene__control.el-button:active {
  transform: scale(0.94);
}

@media (max-width: 640px) {
  .shuttle-scene {
    height: 280px;
  }

  .shuttle-scene__detail--top {
    left: 8%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shuttle-scene__stage,
  .shuttle-scene__control.el-button {
    transition: none;
  }

  .shuttle-scene__control.el-button:active {
    transform: none;
  }
}
</style>
