<template>
  <view>
  <!-- #ifdef MP-WEIXIN -->
  <view class="match-nav-spacer" :style="`height:${navigation.height}px`" />
  <view class="match-navigation" :style="`height:${navigation.height}px;padding-top:${navigation.status}px`">
    <view class="match-navigation-row" :style="`height:${navigation.height - navigation.status}px`">
      <button v-if="match" class="match-back" aria-label="返回球局列表" hover-class="bm-touch" @click="back"><view class="match-back-icon" /></button>
      <text>{{ match ? '球局详情' : title }}</text>
    </view>
  </view>
  <!-- Only owns the native back stack. It never wraps or transforms our UI. -->
  <page-container v-if="supported" :show="guard" :duration="0" :overlay="false" :close-on-slide-down="false" custom-style="height:0;background:transparent;" @beforeleave="nativeBack" />
  <view v-if="match" class="match-presentation" :class="{ 'is-reduced': reducedMotion, 'is-moving': phase !== 'open' }" :style="`top:${navigation.height}px;opacity:${phase === 'opening' || phase === 'open' ? 1 : 0};`" @touchmove.stop>
    <view class="match-content-frame">
      <MatchDetailContent ref="content" style="display:flex;flex-direction:column;height:100%;min-height:0;" :id="match.id" :initial="match" embedded :freeze-header="phase === 'preparing' || phase === 'opening'" :hero-hidden="phase !== 'open'" :active="phase === 'open' && visible" @ready="ready" @deleted="closeImmediately" />
    </view>
  </view>
  <MatchMorph v-if="match && from && to" :match="flightMatch || match" :from="from" :to="to" :moved="moved" />
  <!-- #endif -->
  </view>
</template>
<script setup lang="ts">
import { nextTick, onUnmounted, ref, shallowRef, watch } from "vue";
import { onHide, onShow, onResize } from "@dcloudio/uni-app";
import { BRAND_NAME } from "@/config/brand";
import { openMatch, reducedMotion } from "@/composables/useMotion";
import { hiddenMatchCard, supportsMatchPresentation, type MatchSnapshot, type MatchSource } from "@/composables/useMatchPresentation";
import type { CompetitionSummary } from "@/types/competition";
import { useUserStore } from "@/store/modules/user";
import MatchDetailContent from "./MatchDetailContent.vue";
import MatchMorph from "./MatchMorph.vue";

defineProps<{ title?: string }>();
const emit = defineEmits<{ closed: [] }>();
const supported = supportsMatchPresentation(), user = useUserStore();
function navigationLayout() {
  const window = uni.getWindowInfo(), status = window.statusBarHeight || 0;
  // #ifdef MP-WEIXIN
  const capsule = uni.getMenuButtonBoundingClientRect();
  if (capsule.height > 0 && capsule.top >= status) return { status, height: capsule.bottom + capsule.top - status };
  // #endif
  return { status, height: status + 44 };
}
const navigation = ref(navigationLayout());
const match = shallowRef<CompetitionSummary | null>(null), flightMatch = shallowRef<CompetitionSummary | null>(null);
const phase = ref<"preparing" | "opening" | "open" | "closing">("preparing");
const guard = ref(false), visible = ref(true), moved = ref(false);
const from = shallowRef<MatchSnapshot | null>(null), to = shallowRef<MatchSnapshot | null>(null);
const content = ref<InstanceType<typeof MatchDetailContent> | null>(null);
let source: MatchSource | null = null, sourceRect: MatchSnapshot | null = null;
let restingHeader: MatchSnapshot | null = null;
let generation = 0, alive = true, opening = false, requestingBack = false;
const timers = new Set<ReturnType<typeof setTimeout>>();
function clearTimers() { timers.forEach(clearTimeout); timers.clear(); }
function later(action: () => void, ms: number) {
  const ticket = generation;
  const timer = setTimeout(() => { timers.delete(timer); if (alive && ticket === generation) action(); }, ms);
  timers.add(timer);
}
function clearFlight() { from.value = to.value = null; moved.value = false; }
function showTabBar() { uni.showTabBar({ animation: false }); }
async function open(value: CompetitionSummary, origin: MatchSource) {
  if (!supported) { await openMatch(value); return; }
  if (opening || match.value || !visible.value) return;
  opening = true;
  const ticket = ++generation;
  await new Promise<void>(resolve => uni.hideTabBar({ animation: false, complete: () => resolve() }));
  sourceRect = reducedMotion.value ? null : await origin.measure();
  if (!alive || ticket !== generation || !visible.value) { opening = false; showTabBar(); return; }
  source = origin;
  phase.value = "preparing";
  flightMatch.value = { ...value };
  match.value = { ...value };
  guard.value = true;
  opening = false;
}
async function animate(start: MatchSnapshot | null, end: MatchSnapshot | null, done: () => void) {
  if (!start || !end || reducedMotion.value) { done(); return; }
  const ticket = generation;
  from.value = start; to.value = end; moved.value = false;
  await nextTick();
  if (!alive || ticket !== generation) return;
  later(() => { moved.value = true; }, 32);
  later(done, 380);
}
async function ready() {
  const ticket = generation;
  const target = await content.value?.measureHero();
  if (!alive || ticket !== generation || !match.value || phase.value !== "preparing") return;
  restingHeader = target || null;
  hiddenMatchCard.value = source?.key || "";
  phase.value = "opening";
  void animate(sourceRect, target || null, () => { clearFlight(); phase.value = "open"; });
}
function closeImmediately() {
  if (!match.value && !opening) return;
  generation++; clearTimers(); clearFlight();
  guard.value = false;
  hiddenMatchCard.value = "";
  match.value = flightMatch.value = null;
  source = null; sourceRect = restingHeader = null; opening = requestingBack = false;
  showTabBar();
  void nextTick(() => { if (alive) emit("closed"); });
}
async function back() {
  if (!match.value || requestingBack || phase.value === "closing") return;
  if (phase.value !== "open") { closeImmediately(); return; }
  requestingBack = true;
  const ticket = generation;
  const allowed = await content.value?.requestBack();
  requestingBack = false;
  if (!alive || ticket !== generation || !match.value) return;
  if (!allowed) { guard.value = true; return; }
  clearTimers(); clearFlight();
  flightMatch.value = content.value?.getSummary() || match.value;
  phase.value = "closing";
  content.value?.suspend();
  if (reducedMotion.value) { closeImmediately(); return; }
  // Restore the header even after scrolling; never discard the reverse pairing.
  const header = await content.value?.restoreHeader();
  if (!alive || ticket !== generation) return;
  await new Promise<void>(resolve => uni.showTabBar({ animation: false, complete: () => resolve() }));
  const target = await source?.measure();
  if (!alive || ticket !== generation) return;
  const start = header && header.rects.surface.top >= navigation.value.height ? header : restingHeader;
  void animate(start, target || null, closeImmediately);
}
async function nativeBack() {
  if (!match.value) return;
  guard.value = false;
  await nextTick();
  if (!match.value) return;
  guard.value = true;
  await back();
}
watch(() => user.token, () => closeImmediately());
watch(reducedMotion, reduced => { if (!reduced || !match.value) return; clearTimers(); clearFlight(); if (phase.value === "closing") closeImmediately(); else if (phase.value === "opening") phase.value = "open"; });
onHide(() => {
  visible.value = false;
  if (opening) { closeImmediately(); return; }
  clearTimers(); clearFlight();
  content.value?.suspend();
  if (phase.value === "closing") closeImmediately();
  else if (match.value) phase.value = "open";
  if (match.value || opening) showTabBar();
});
onShow(() => { visible.value = true; if (match.value) uni.hideTabBar({ animation: false }); });
onResize(() => { navigation.value = navigationLayout(); content.value?.invalidateShared(); if (phase.value === "opening") { clearTimers(); clearFlight(); phase.value = "open"; } });
function share() { return content.value?.share() || { title: BRAND_NAME, path: "/pages/index/index" }; }
onUnmounted(() => { alive = false; generation++; clearTimers(); if (source?.key === hiddenMatchCard.value) hiddenMatchCard.value = ""; if (match.value || opening) showTabBar(); });
defineExpose({ isOpen: match, open, share });
</script>
<style scoped lang="scss">
@import "@/styles/_tokens.scss";
.match-navigation { position: fixed; top: 0; left: 0; right: 0; z-index: 100; box-sizing: border-box; background: $bm-page; }
.match-navigation-row { position: relative; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 500; }
.match-back { position: absolute; left: 12px; top: 0; bottom: 0; display: flex; align-items: center; justify-content: center; width: 40px; padding: 0; margin: 0; background: transparent; }
.match-back::after { border: 0; }
.match-back-icon { width: 11px; height: 11px; border-left: 2px solid $bm-ink; border-bottom: 2px solid $bm-ink; transform: rotate(45deg); }
.match-presentation { position: fixed; left: 0; right: 0; bottom: 0; z-index: 70; background: $bm-page; transition: opacity 180ms ease; }
.match-content-frame { height: 100%; min-height: 0; }
.match-presentation.is-moving .match-content-frame { pointer-events: none; }
.match-presentation.is-reduced { transition: none; }
</style>
