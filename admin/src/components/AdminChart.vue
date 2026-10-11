<template>
  <div class="admin-chart" :style="{ minHeight: `${height}px` }" :aria-busy="loading">
    <div v-show="!empty && !failure" ref="container" class="admin-chart-canvas" :style="{ height: `${height}px` }" role="img" :aria-label="label" />
    <div v-if="loading && !empty" class="chart-placeholder" role="status">
      <ElSkeleton :rows="3" :animated="!reducedMotion" />
      <span class="chart-loading-label">正在呈现图表…</span>
    </div>
    <ElEmpty v-if="empty" :description="emptyText" :image-size="64" />
    <div v-else-if="failure" class="chart-failure">
      <ElAlert title="图表暂时无法显示，仍可阅读下方数据。" type="warning" :closable="false" show-icon />
      <ElButton native-type="button" @click="retry">重新加载图表</ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElAlert, ElButton, ElEmpty, ElSkeleton } from "element-plus";
import type { AdminChartInstance, AdminChartOption } from "../charts";

const props = withDefaults(defineProps<{
  option: AdminChartOption;
  label: string;
  empty?: boolean;
  emptyText?: string;
  height?: number;
}>(), { empty: false, emptyText: "暂无数据", height: 280 });

const container = ref<HTMLElement>();
const loading = ref(false), failure = ref(false), reducedMotion = ref(false);
let chart: AdminChartInstance | undefined;
let observer: ResizeObserver | undefined;
let motion: MediaQueryList | undefined;
let mounted = false, importing = false, resizeFrame = 0;

function releaseChart() {
  chart?.dispose();
  chart = undefined;
}

function updateOption() {
  chart?.setOption({
    ...props.option,
    textStyle: { fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif', color: "#64756e" },
    animation: !reducedMotion.value,
    animationDuration: reducedMotion.value ? 0 : 420,
    animationDurationUpdate: reducedMotion.value ? 0 : 260,
    aria: { enabled: true, label: { description: props.label } },
  }, { notMerge: true });
}

async function render() {
  if (!mounted || failure.value) return;
  if (props.empty) { releaseChart(); loading.value = false; return; }
  await nextTick();
  if (!mounted || props.empty || !container.value || !container.value.clientWidth || !container.value.clientHeight) return;
  if (chart) {
    try { updateOption(); chart.resize(); }
    catch { releaseChart(); failure.value = true; }
    return;
  }
  if (importing) return;
  importing = true;
  loading.value = true;
  try {
    const { createChart } = await import("../charts");
    // Imports may resolve after the view changed, became empty, or unmounted.
    if (!mounted || props.empty || !container.value || !container.value.clientWidth || !container.value.clientHeight) return;
    chart = createChart(container.value);
    updateOption();
  } catch {
    if (mounted) { releaseChart(); failure.value = true; }
  } finally {
    importing = false;
    if (mounted) loading.value = false;
  }
}

function resize() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    if (!mounted || props.empty || failure.value) return;
    if (chart) {
      try { chart.resize(); }
      catch { releaseChart(); failure.value = true; }
    } else void render();
  });
}

function motionChanged(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches;
  void render();
}

function retry() { failure.value = false; void render(); }

watch(() => [props.option, props.empty, props.height, props.label], () => { void render(); }, { deep: true, flush: "post" });
onMounted(() => {
  mounted = true;
  motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion.value = motion.matches;
  motion.addEventListener("change", motionChanged);
  if (typeof ResizeObserver !== "undefined") {
    observer = new ResizeObserver(resize);
    if (container.value) observer.observe(container.value);
  }
  window.addEventListener("resize", resize);
  void render();
});
onBeforeUnmount(() => {
  mounted = false;
  cancelAnimationFrame(resizeFrame);
  observer?.disconnect();
  motion?.removeEventListener("change", motionChanged);
  window.removeEventListener("resize", resize);
  releaseChart();
});
</script>

<style scoped>
.admin-chart { position: relative; min-width: 0; width: 100%; }
.admin-chart-canvas { width: 100%; min-width: 0; }
.chart-placeholder { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; gap: 20px; padding: 30px; background: var(--el-bg-color, #fff); }
.chart-loading-label { font-size: 12px; color: var(--el-text-color-secondary); }
.chart-failure { display: grid; align-content: center; justify-items: start; gap: 16px; min-height: 240px; }
</style>
