<template>
  <button class="bm-button" :class="[variant, { small, 'is-disabled': disabled || loading, 'is-reduced': reducedMotion }]" :disabled="disabled || loading" :loading="loading && !reducedMotion" :aria-busy="loading" :hover-class="disabled || loading ? 'none' : 'bm-pressed'" :hover-stay-time="100" @click="activate">
    <text v-show="loading && reducedMotion">处理中…</text>
    <!-- Do not mount/unmount the native slot when loading changes. -->
    <view v-show="!(loading && reducedMotion)" class="bm-button-content"><slot /></view>
  </button>
</template>
<script setup lang="ts">
import { reducedMotion } from "@/composables/useMotion";
const props = withDefaults(defineProps<{ loading?: boolean; disabled?: boolean; variant?: string; small?: boolean }>(), { variant: "primary" });
const emit = defineEmits<{ (e: "click"): void }>();
function activate() { if (!props.disabled && !props.loading) emit("click"); }
</script>

<style scoped lang="scss">
@import "@/styles/_components.scss";
@include bm-button-styles;
</style>
