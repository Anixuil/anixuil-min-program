<template>
  <view v-if="mounted" ref="modalElement" class="bm-modal" :aria-hidden="!modelValue || covered" :inert="!modelValue || covered ? true : undefined" :class="{ 'is-open': visible, 'is-closing': !modelValue, 'is-reduced': reducedMotion || !active, 'is-shared': shared, 'is-covered': covered }">
    <view class="bm-backdrop" @click="requestClose" @touchmove.stop.prevent />
    <view class="bm-sheet" :style="keyboardStyle" role="dialog" :aria-label="title" @touchmove.stop>
      <view class="bm-sheet-handle" /><view class="bm-row bm-between bm-sheet-title"><text class="bm-heading" :style="titleStyle">{{ title }}</text><button class="bm-icon-button" :disabled="busy || !modelValue || covered" :hover-class="busy || !modelValue || covered ? 'none' : 'bm-touch'" aria-label="关闭" @click="requestClose">×</button></view>
      <scroll-view scroll-y class="bm-sheet-scroll" :style="scrollStyle" @scroll="$emit('layout-change')"><view class="bm-sheet-body"><slot /></view></scroll-view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed, provide, nextTick, onMounted, onUpdated, onUnmounted, ref, watch } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import { reducedMotion, useLayoutMotion } from "@/composables/useMotion";
import { motionDuration, useMotionClock } from "@/composables/useMotionState";
const props = defineProps<{ modelValue: boolean; title: string; busy?: boolean; shared?: boolean; covered?: boolean; contentKey?: string | number }>();
const emit = defineEmits<{ (e: "update:modelValue", value: boolean): void; (e: "close"): void; (e: "ready"): void; (e: "closed"): void; (e: "layout-change"): void }>();
const mounted = ref(false), visible = ref(false), keyboard = ref(0);
const modalElement = ref<any>(null), bodyHeight = ref(0);
const { measure } = useLayoutMotion();
const titleClock = useMotionClock(), active = titleClock.active, titleStyle = ref("");
const fitClock = useMotionClock();
defineExpose({ measure });
let ticket = 0, measureTicket = 0, readyTicket = -1, alive = true;
let fitSuspended = Boolean(props.covered);
function reportReady() { if (readyTicket !== ticket) { readyTicket = ticket; emit("ready"); } }
let timer: ReturnType<typeof setTimeout> | undefined;
const keyboardStyle = computed(() => `bottom:${keyboard.value}px;`);
const scrollStyle = computed(() => {
  const available = Math.max(120, uni.getWindowInfo().windowHeight * .78 - keyboard.value);
  return `height:${Math.min(bodyHeight.value || available, available)}px;${keyboard.value || !visible.value || props.shared ? 'transition:none;' : ''}`;
});
async function fitBody() {
  if (!mounted.value || !props.modelValue || !active.value || props.covered || fitSuspended) return;
  const current = ticket, measurement = ++measureTicket;
  const [body] = await fitClock.measure(".bm-sheet-body");
  if (alive && current === ticket && measurement === measureTicket && body && props.modelValue && active.value && !props.covered && !fitSuspended) bodyHeight.value = Math.ceil(body.height);
}
function resumeFitAfterDepth() {
  fitClock.clear(); measureTicket++; fitSuspended = true;
  if (props.covered || !props.modelValue || !active.value) return;
  const current = fitClock.ticket();
  // Selector rectangles include scale. Wait until the underlying sheet is full size.
  void nextTick().then(() => {
    if (!fitClock.valid(current)) return;
    fitClock.later(() => {
      if (!props.modelValue || props.covered || !active.value) return;
      fitSuspended = false; void fitBody();
    }, reducedMotion.value ? 0 : motionDuration.sheet + 32);
  });
}
watch(() => props.covered, resumeFitAfterDepth, { flush: "sync" });
provide("bm:fit-sheet", fitBody);
watch(() => [props.contentKey, props.title], async () => {
  titleClock.clear(); titleStyle.value = "";
  if (!props.modelValue || !visible.value || props.covered || reducedMotion.value || !active.value) return;
  const current = titleClock.ticket();
  titleStyle.value = "opacity:0;transition:none;";
  await nextTick();
  if (!titleClock.valid(current)) return;
  titleClock.later(() => { titleStyle.value = "opacity:1;transition:opacity 160ms ease;"; }, 32);
  titleClock.later(() => { titleStyle.value = ""; }, 192);
  void fitBody();
});
// #ifdef H5
let previousFocus: HTMLElement | null = null;
let pendingFocus: HTMLElement | null = null;
function restoreFocus(current: number) {
  void nextTick().then(() => {
    if (!alive || current !== ticket || props.modelValue || props.covered || !active.value) return;
    const target = pendingFocus;
    pendingFocus = null;
    if (target?.isConnected && !target.closest('[inert],[aria-hidden="true"]')) target.focus({ preventScroll: true });
  });
}
function focusables(): HTMLElement[] {
  const root = modalElement.value?.$el || modalElement.value;
  return Array.from(root?.querySelectorAll("button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex='0']") || []).filter((node: any) => node.getClientRects().length && !node.closest('[aria-hidden="true"]')) as HTMLElement[];
}
function trapKey(event: KeyboardEvent) {
  if (!props.modelValue || props.covered) return;
  const root = modalElement.value?.$el || modalElement.value;
  const overlays = Array.from(document.querySelectorAll(".bm-modal.is-open"));
  if (overlays[overlays.length - 1] !== root) return;
  if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); requestClose(); }
  if (event.key === "Tab") {
    const nodes = focusables(); if (!nodes.length) return;
    const index = nodes.indexOf(document.activeElement as HTMLElement);
    if (event.shiftKey && index <= 0) { event.preventDefault(); nodes[nodes.length - 1].focus(); }
    else if (!event.shiftKey && (index === nodes.length - 1 || index < 0)) { event.preventDefault(); nodes[0].focus(); }
  }
}
// #endif
watch(() => props.modelValue, async open => {
  const current = ++ticket; clearTimeout(timer);
  fitClock.clear(); measureTicket++;
  if (open) {
    // #ifdef H5
    pendingFocus = null;
    previousFocus = document.activeElement as HTMLElement;
    // #endif
    mounted.value = true; await nextTick();
    if (fitSuspended && !props.covered) resumeFitAfterDepth();
    await fitBody();
    if (!alive || current !== ticket) return;
    timer = setTimeout(() => { if (current === ticket && alive) {
      visible.value = true; reportReady();
      // #ifdef H5
      nextTick().then(() => { if (current === ticket && props.modelValue && !props.covered) focusables()[0]?.focus({ preventScroll: true }); });
      // #endif
    } }, reducedMotion.value || !active.value ? 0 : 32);
  } else {
    visible.value = false;
    // #ifdef H5
    pendingFocus = props.covered ? null : previousFocus;
    previousFocus = null;
    // #endif
    timer = setTimeout(() => { if (current === ticket && alive) {
      mounted.value = false; fitSuspended = Boolean(props.covered); emit("closed");
      // #ifdef H5
      restoreFocus(current);
      // #endif
    } }, reducedMotion.value || !active.value ? 0 : motionDuration.sheet);
  }
}, { immediate: true });
watch(reducedMotion, reduced => {
  if (!reduced) return;
  const wasVisible = visible.value;
  const wasMounted = mounted.value;
  ticket++; clearTimeout(timer);
  fitClock.clear(); measureTicket++; fitSuspended = Boolean(props.covered);
  titleClock.clear(); titleStyle.value = "";
  mounted.value = props.modelValue;
  visible.value = props.modelValue;
  if (props.modelValue && !wasVisible) reportReady();
  if (!props.modelValue && wasMounted) {
    emit("closed");
    // #ifdef H5
    restoreFocus(ticket);
    // #endif
  }
  void nextTick().then(fitBody);
});
function requestClose() { if (props.busy || !props.modelValue || props.covered) return; emit("close"); }
function onKeyboard(event: { height: number }) { keyboard.value = event.height; if (props.modelValue) emit("layout-change"); }
onHide(() => {
  ticket++; measureTicket++; clearTimeout(timer); titleClock.clear(); titleStyle.value = "";
  // #ifdef H5
  previousFocus = pendingFocus = null;
  // #endif
  fitClock.clear(); fitSuspended = Boolean(props.covered);
  const closing = mounted.value && !props.modelValue;
  mounted.value = visible.value = props.modelValue;
  if (closing) emit("closed");
});
onShow(async () => {
  if (!props.modelValue) return;
  const current = ticket;
  await nextTick();
  if (alive && current === ticket && props.modelValue) { void fitBody(); reportReady(); }
});
onUpdated(fitBody);
onMounted(() => {
  uni.onKeyboardHeightChange?.(onKeyboard);
  // #ifdef H5
  document.addEventListener("keydown", trapKey);
  // #endif
});
onUnmounted(() => {
  alive = false; ticket++; measureTicket++; clearTimeout(timer); fitClock.clear(); uni.offKeyboardHeightChange?.(onKeyboard);
  // #ifdef H5
  previousFocus = pendingFocus = null;
  document.removeEventListener("keydown", trapKey);
  // #endif
});
</script>

<style scoped lang="scss">
@import "@/styles/_components.scss";
@include bm-sheet-styles;
</style>
