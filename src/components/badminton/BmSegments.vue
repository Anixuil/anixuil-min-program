<template><view class="bm-segments" :class="{ 'is-reduced': reducedMotion }"><view class="bm-segment-track"><view class="bm-segment-indicator" :style="indicator" /></view><button v-for="item in items" :key="item.value" class="bm-segment" :class="{ selected: modelValue === item.value, 'is-disabled': disabled }" :hover-class="disabled ? 'none' : 'bm-touch'" :disabled="disabled" :aria-pressed="modelValue === item.value" @click="select(item.value)">{{ item.label }}</button></view></template>
<script setup lang="ts">
import { computed } from "vue";
import { reducedMotion } from "@/composables/useMotion";
const props = defineProps<{ modelValue: string; items: { value: string; label: string }[]; disabled?: boolean }>();
const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();
const indicator = computed(() => `width:${100 / Math.max(1, props.items.length)}%;transform:translateX(${Math.max(0, props.items.findIndex(i => i.value === props.modelValue)) * 100}%);`);
function select(value: string) { if (!props.disabled && value !== props.modelValue) emit("update:modelValue", value); }
</script>

<style scoped lang="scss">
@import "@/styles/_components.scss";
@include bm-segment-styles;
</style>
