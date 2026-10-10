<template>
  <view class="bm-brand" :class="{ 'bm-brand--compact': compact }">
    <image class="bm-brand-mark" :src="BRAND_MARK" mode="aspectFit" aria-hidden="true" />
    <view class="bm-brand-copy">
      <text class="bm-brand-name">{{ BRAND_NAME }}</text>
      <text v-if="tagline" class="bm-brand-tagline">{{ BRAND_TAGLINE }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { BRAND_MARK, BRAND_NAME, BRAND_TAGLINE } from "@/config/brand";

defineProps<{ compact?: boolean; tagline?: boolean }>();
</script>

<style scoped lang="scss">
@import "@/styles/_tokens.scss";

.bm-brand {
  display: flex;
  align-items: center;
  max-width: 100%;
}
.bm-brand-mark {
  flex-shrink: 0;
  width: 96rpx;
  height: 96rpx;
}
.bm-brand-copy {
  min-width: 0;
  margin-left: 18rpx;
}
.bm-brand-name {
  display: block;
  color: $bm-ink;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 2rpx;
}
.bm-brand-tagline {
  display: block;
  margin-top: 6rpx;
  color: $bm-muted;
  font-size: 22rpx;
  line-height: 1.6;
  overflow-wrap: break-word;
}
.bm-brand--compact .bm-brand-mark {
  width: 56rpx;
  height: 56rpx;
}
.bm-brand--compact .bm-brand-copy {
  margin-left: 12rpx;
}
.bm-brand--compact .bm-brand-name {
  font-size: 28rpx;
  letter-spacing: 1rpx;
}
</style>
