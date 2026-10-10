<template>
  <view :class="['bm-state', { 'is-reduced': reducedMotion, 'is-paused': !active }]" :role="kind === 'error' ? 'alert' : 'status'" :aria-busy="kind === 'loading'" :aria-label="kind === 'loading' ? '加载中' : title">
    <view v-if="kind === 'loading'" class="bm-skeleton"><view class="bm-skeleton-line wide" aria-hidden="true" /><view class="bm-skeleton-line" aria-hidden="true" /><view class="bm-skeleton-line short" aria-hidden="true" /><text class="bm-loading-copy">加载中…</text></view>
    <template v-else><view class="bm-state-symbol">{{ kind === 'error' ? '!' : '○' }}</view><text class="bm-heading">{{ title }}</text><view class="bm-muted">{{ message }}</view><view v-if="action" class="bm-state-action"><BmButton variant="secondary" :loading="busy" :disabled="disabled" @click="$emit('action')">{{ action }}</BmButton></view></template>
  </view>
</template>
<script setup lang="ts">
import BmButton from "./BmButton.vue";
import { reducedMotion } from "@/composables/useMotion";
import { useMotionClock } from "@/composables/useMotionState";
const { active } = useMotionClock();
defineProps<{ kind?: "loading" | "empty" | "error"; title?: string; message?: string; action?: string; busy?: boolean; disabled?: boolean }>(); defineEmits<{ (e: "action"): void }>();
</script>

<style scoped lang="scss">
@import "@/styles/_components.scss";
@include bm-state-styles;
@include bm-keyframes;
</style>
