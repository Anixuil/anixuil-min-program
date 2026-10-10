<template>
  <view v-if="user.token" class="points-card" :class="{ compact, 'is-reduced': reducedMotion }" aria-label="我的积分">
    <view class="points-card-row">
      <view class="points-card-main">
        <text class="points-card-label">可用积分</text>
        <text class="points-card-balance">{{ points.summary ? points.summary.available : '—' }}<text class="points-card-unit"> 分</text></text>
        <text v-if="points.summary?.debt" class="points-card-debt">待抵扣 {{ points.summary.debt }} 分 · 后续收入优先抵扣</text>
        <text v-else class="points-card-hint">每日签到 +{{ points.summary?.checkInReward || 100 }} · 为好球助威</text>
      </view>
      <BmButton small :loading="points.busy" :disabled="!points.summary || points.loading || points.summary.checkedIn" @click="checkIn">
        {{ points.summary?.checkedIn ? '今日已签到' : '签到领积分' }}
      </BmButton>
    </view>
    <view v-if="points.loading" class="points-card-hint" role="status">正在更新积分…</view>
    <view v-if="noticeRendered" class="points-card-notice" :style="noticeStyle" role="status">{{ displayedNotice }}</view>
    <view v-if="feedbackRendered" :style="feedbackStyle" class="points-card-error" role="alert"><text>{{ feedbackText }}</text><button class="points-card-link" :disabled="points.loading || points.busy || !points.error" @click="reload">重新读取</button></view>
    <view v-if="showLink" class="points-card-footer"><text>积分仅用于站内娱乐</text><button class="points-card-link" @click="open">积分中心 →</button></view>
  </view>
</template>

<script setup lang="ts">
import { reducedMotion } from "@/composables/useMotion";
import { usePresence } from "@/composables/useMotionState";
import BmButton from "@/components/badminton/BmButton.vue";
import { usePointsStore } from "@/store/modules/points";
import { useUserStore } from "@/store/modules/user";
withDefaults(defineProps<{ compact?: boolean; showLink?: boolean }>(), { compact: false, showLink: true });
const emit = defineEmits<{ (e: "checked-in"): void }>();
const points = usePointsStore(), user = useUserStore();
const { rendered: noticeRendered, displayed: displayedNotice, style: noticeStyle } = usePresence(() => user.token ? points.notice : "", { immediate: () => !user.token });
const { rendered: feedbackRendered, displayed: feedbackText, style: feedbackStyle } = usePresence(() => user.token ? points.error : "", { immediate: () => !user.token });
async function reload() { try { await points.load(); } catch { /* The shared wallet owns the error. */ } }
async function checkIn() {
  const session = user.token;
  try { await points.checkIn(); if (session === user.token && points.summary?.checkedIn) emit("checked-in"); }
  catch { /* Keep the action and the server error visible. */ }
}
function open() { uni.navigateTo({ url: "/pages/points/index" }); }
</script>

<style scoped lang="scss">
@import "@/styles/_tokens.scss";
.points-card { margin: 28rpx 0; padding: 30rpx; border: 2rpx solid $bm-ink; border-radius: $bm-radius-panel; background: $bm-ink; color: $bm-inverse; }
.points-card.compact { padding: 24rpx; }
.points-card-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20rpx; }
.points-card-main { flex: 1; min-width: 230rpx; }
.points-card-label, .points-card-balance, .points-card-hint, .points-card-debt { display: block; }
.points-card-label, .points-card-hint, .points-card-footer { font-size: 24rpx; color: $bm-inverse-muted; }
.points-card-balance { margin: 8rpx 0; font-size: 64rpx; font-weight: 700; line-height: 1.2; font-variant-numeric: tabular-nums; }
.points-card-unit { font-size: 22rpx; font-weight: 400; }
.points-card-debt { color: #ffb5a8; font-size: 24rpx; line-height: 1.6; }
.points-card-hint { margin-top: 8rpx; line-height: 1.6; }
.points-card-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16rpx; border-top: 2rpx solid #405048; margin-top: 22rpx; padding-top: 14rpx; }
.points-card-link { flex-shrink: 0; margin: 0; padding: 18rpx 0; background: transparent; border: 0; color: #ffad7b; font-size: 24rpx; line-height: 1.6; }
.points-card-link::after { border: 0; }
.points-card-notice { margin-top: 18rpx; color: $bm-inverse; font-size: 24rpx; line-height: 1.6; }
.points-card-error { margin-top: 18rpx; color: #ffb5a8; font-size: 24rpx; line-height: 1.6; }
.points-card-error .points-card-link { display: inline-block; margin-left: 16rpx; }
</style>
