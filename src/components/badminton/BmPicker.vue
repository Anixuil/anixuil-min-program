<template>
  <picker :mode="mode" :value="modelValue" :disabled="disabled" @change="change">
    <view class="bm-picker-control" :class="{ 'is-invalid': invalid, 'is-disabled': disabled, 'is-reduced': reducedMotion }" :hover-class="disabled ? 'none' : 'is-pressed'" :hover-stay-time="80" :aria-label="label" :aria-invalid="invalid">
      <text class="bm-picker-value">{{ modelValue }}</text><view class="bm-picker-chevron" />
    </view>
  </picker>
</template>
<script setup lang="ts">
import { reducedMotion } from "@/composables/useMotion";
const props = defineProps<{ modelValue: string; mode: "date" | "time"; label: string; disabled?: boolean; invalid?: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();
function change(event: { detail: { value: string } }) {
  if (!props.disabled) emit("update:modelValue", event.detail.value);
}
</script>
<style scoped lang="scss">
@import "@/styles/_tokens.scss";
.bm-picker-control {
  @include bm-control;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $bm-control-height;
  padding: 0 24rpx;
  line-height: 1.4;
}
.bm-picker-value { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }
.bm-picker-chevron { flex-shrink: 0; width: 12rpx; height: 12rpx; margin: -6rpx 0 0 16rpx; border-right: 2rpx solid $bm-muted; border-bottom: 2rpx solid $bm-muted; transform: rotate(45deg); }
.is-pressed { background: $bm-primary-soft; border-color: $bm-primary; }
.is-invalid { border-color: $bm-error; background: #fff6f3; }
.is-disabled { @include bm-disabled-control; }
.is-reduced { transition: none; }
</style>
