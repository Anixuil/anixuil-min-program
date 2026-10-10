<template>
  <view class="bm-tab-space" aria-hidden="true" />
  <view v-if="!hidden && ready" class="bm-tab-bar" :class="{ 'is-reduced': reducedMotion }">
    <button v-for="item in items" :key="item.key" class="bm-tab-item"
      :class="{ 'is-selected': active === item.key }" :aria-label="item.label"
      :aria-current="active === item.key ? 'page' : undefined" :disabled="switching"
      hover-class="bm-tab-pressed" :hover-stay-time="80" @click="select(item)">
      <view class="bm-tab-symbol"><image class="bm-tab-icon" :src="`/static/tabbar/${item.icon}${active === item.key ? '-active' : ''}.png`" mode="aspectFit" /></view>
      <text class="bm-tab-label">{{ item.label }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { nextTick, onUnmounted, ref } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import { reducedMotion } from "@/composables/useMotion";
import { notifyViewportLayoutChange } from "@/composables/useViewportLayout";

const props = defineProps<{ active: "home" | "schedule" | "profile"; hidden?: boolean }>();
const items = [
  { key: "home", label: "首页", icon: "home", url: "/pages/index/index" },
  { key: "schedule", label: "球局", icon: "history", url: "/pages/schedule/index" },
  { key: "profile", label: "我的", icon: "profile", url: "/pages/profile/index" },
];
const ready = ref(false), switching = ref(false);
let visibilityTicket = 0;
onHide(() => { visibilityTicket++; });
onUnmounted(() => { visibilityTicket++; });
onShow(() => {
  const current = ++visibilityTicket;
  switching.value = false;
  // Keep the registered tab routes and native page lifecycle. If hiding fails,
  // leave the native navigation available instead of drawing two bars.
  uni.hideTabBar({
    animation: false,
    success: () => {
      if (current !== visibilityTicket) return;
      ready.value = true;
      void nextTick().then(() => { if (current === visibilityTicket) notifyViewportLayoutChange(); });
    },
    fail: () => { if (current === visibilityTicket) ready.value = false; },
  });
});
function select(item: typeof items[number]) {
  if (switching.value || item.key === props.active) return;
  switching.value = true;
  uni.switchTab({
    url: item.url,
    fail: () => { uni.showToast({ title: "切换失败，请重试", icon: "none" }); },
    complete: () => { switching.value = false; },
  });
}
</script>

<style scoped lang="scss">
.bm-tab-space { height: 120rpx; }
.bm-tab-bar {
  position: fixed; z-index: 30; left: 0; right: 0; bottom: 0;
  display: flex; box-sizing: border-box; padding: 12rpx 24rpx calc(8rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid rgba(255, 255, 255, .85);
  background: rgba(248, 249, 246, .96);
  box-shadow: 0 -6rpx 32rpx rgba(29, 48, 37, .045);
}
@supports ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .bm-tab-bar { background: rgba(248, 249, 246, .78); -webkit-backdrop-filter: blur(22px) saturate(135%); backdrop-filter: blur(22px) saturate(135%); }
}
.bm-tab-item {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 100rpx; margin: 0; padding: 0; border: 0; border-radius: 20rpx;
  background: transparent; color: #65716a; line-height: 1.4;
  transition: transform 140ms ease, opacity 140ms ease, color 140ms ease;
}
.bm-tab-item::after { border: 0; }
.bm-tab-item[disabled] { background: transparent; color: #65716a; }
.bm-tab-item.is-selected { color: #e96b35; }
.bm-tab-symbol { display: flex; align-items: center; justify-content: center; width: 72rpx; height: 56rpx; }
.bm-tab-icon { display: block; width: 52rpx; height: 52rpx; }
.bm-tab-label { margin-top: 6rpx; font-size: 22rpx; font-weight: 500; }
.is-selected .bm-tab-label { font-weight: 600; }
.bm-tab-pressed { transform: scale(.94); opacity: .7; }
.bm-tab-item:focus-visible { outline: 2px solid #e96b35; outline-offset: -2px; }
.is-reduced .bm-tab-item { transition: none; }
.is-reduced .bm-tab-pressed { transform: none; }
@media (prefers-reduced-motion: reduce) {
  .bm-tab-item { transition: none; }
  .bm-tab-pressed { transform: none; }
}
</style>
