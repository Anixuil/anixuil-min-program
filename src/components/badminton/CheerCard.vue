<template>
  <view class="cheer-card">
    <view v-if="market" class="cheer-sides">
      <view v-for="entry in sides" :key="entry.side" class="cheer-side" :class="{ selected: market.mySupport?.side === entry.side }">
        <text class="cheer-label">{{ entry.side }} 方 · {{ market.mySupport?.side === entry.side ? '我支持的队伍' : '助威返还' }}</text>
        <text class="cheer-odds">{{ (entry.totals.oddsHundredths / 100).toFixed(2) }}<text class="cheer-unit"> 倍</text></text>
        <text class="cheer-meta">{{ entry.totals.people }} 人 · {{ entry.totals.points }} 积分</text>
      </view>
    </view>
    <view v-else class="cheer-meta">{{ failed ? '助威信息暂时无法读取' : '正在读取助威信息…' }}</view>
    <view class="cheer-footer">
      <text class="cheer-meta">{{ market?.mySupport ? `本局已助威 ${market.mySupport.points} 分` : '仅站内娱乐积分 · 返还含本金' }}</text>
      <BmButton small variant="secondary" :disabled="disabled || !market" @click="$emit('open')">{{ market?.open ? (market.mySupport ? '追加助威' : '为球友助威') : '查看助威' }}</BmButton>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed } from "vue";
import BmButton from "@/components/badminton/BmButton.vue";
import type { CheerMarket } from "@/types/points";
const props = defineProps<{ market?: CheerMarket; disabled?: boolean; failed?: boolean }>();
defineEmits<{ (e: "open"): void }>();
const sides = computed(() => props.market ? [{ side: "A", totals: props.market.a }, { side: "B", totals: props.market.b }] : []);
</script>
<style scoped lang="scss">
@import "@/styles/_tokens.scss";
.cheer-card { margin: 20rpx 0; padding: 20rpx; border-radius: $bm-radius; background: transparent; border: 2rpx solid $bm-line; }
.cheer-sides { display: flex; gap: 16rpx; }
.cheer-side { flex: 1; min-width: 0; padding: 16rpx; border: 2rpx solid transparent; border-radius: 12rpx; background: $bm-surface; }
.cheer-side.selected { border-color: $bm-primary; background: $bm-primary-soft; }
.cheer-label, .cheer-meta { display: block; color: $bm-muted; font-size: 24rpx; line-height: 1.6; }
.cheer-odds { display: block; margin: 6rpx 0; color: $bm-ink; font-size: 36rpx; font-weight: 700; font-variant-numeric: tabular-nums; }
.cheer-unit { font-size: 24rpx; font-weight: 400; }
.cheer-footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12rpx; margin-top: 16rpx; }
</style>
