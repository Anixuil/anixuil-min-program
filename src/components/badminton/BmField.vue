<template>
  <view class="bm-field" :class="{ 'is-multiline': multiline, 'is-score': variant === 'score' && !multiline, 'is-focused': focused && !disabled, 'is-invalid': invalid, 'is-disabled': disabled, 'is-reduced': reducedMotion }">
    <textarea v-if="multiline" class="bm-field-native bm-field-multiline" :value="modelValue" :disabled="disabled" :maxlength="maxlength" :placeholder="placeholder" :adjust-position="adjustPosition" :confirm-type="confirmType" :placeholder-style="placeholderStyle" :aria-label="label || placeholder" :aria-invalid="invalid" @input="input" @confirm="confirm" @focus="onFocus" @blur="onBlur" />
    <input v-else class="bm-field-native" :class="{ 'bm-field-score': variant === 'score' }" :value="modelValue" :disabled="disabled" :password="password" :type="type" :maxlength="maxlength" :placeholder="placeholder" :adjust-position="adjustPosition" :confirm-type="confirmType" :placeholder-style="placeholderStyle" :aria-label="label || placeholder" :aria-invalid="invalid" @input="input" @confirm="confirm" @focus="onFocus" @blur="onBlur" />
  </view>
</template>
<script lang="ts">
export default { inheritAttrs: false };
</script>
<script setup lang="ts">
import { ref, watch } from "vue";
import { reducedMotion } from "@/composables/useMotion";

const props = withDefaults(defineProps<{
  modelValue: string | number;
  multiline?: boolean;
  variant?: "default" | "score";
  invalid?: boolean;
  label?: string;
  disabled?: boolean;
  password?: boolean;
  type?: "text" | "number" | "idcard" | "digit" | "nickname";
  maxlength?: string | number;
  placeholder?: string;
  adjustPosition?: boolean;
  confirmType?: "send" | "search" | "next" | "go" | "done";
}>(), { variant: "default", type: "text", maxlength: 140, placeholder: "", label: "", adjustPosition: true, confirmType: "done" });
type FieldEvent = { detail: { value: string } };
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "confirm", event: FieldEvent): void;
  (e: "focus", event: FieldEvent): void;
  (e: "blur", event: FieldEvent): void;
}>();
const placeholderStyle = "color:#818b83;font-size:28rpx;";
const focused = ref(false);
watch(() => props.disabled, disabled => { if (disabled) focused.value = false; });
function input(event: FieldEvent) {
  if (!props.disabled) emit("update:modelValue", event.detail.value);
}
function confirm(event: FieldEvent) {
  if (props.disabled) return;
  emit("update:modelValue", event.detail.value);
  emit("confirm", event);
}
function onFocus(event: FieldEvent) { focused.value = !props.disabled; emit("focus", event); }
function onBlur(event: FieldEvent) { focused.value = false; emit("blur", event); }
</script>
<style scoped lang="scss">
@import "@/styles/_tokens.scss";
.bm-field {
  @include bm-control;
  display: flex;
  align-items: center;
  height: $bm-control-height;
  padding: 0 24rpx;
}
.bm-field-native {
  display: block;
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 56rpx;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: $bm-ink;
  font-size: 28rpx;
  line-height: 56rpx;
}
.is-multiline { height: 220rpx; padding: 20rpx 24rpx; align-items: flex-start; }
.bm-field-multiline { height: 176rpx; line-height: 44rpx; }
.is-score { height: 120rpx; background: $bm-soft; }
.bm-field-score { height: 88rpx; line-height: 88rpx; font-size: 72rpx; font-weight: 700; font-variant-numeric: tabular-nums; text-align: center; }
.is-focused { border-color: $bm-primary; background: $bm-primary-soft; }
.is-invalid { border-color: $bm-error; background: #fff6f3; }
.is-disabled { @include bm-disabled-control; }
.is-disabled .bm-field-native { color: $bm-disabled; }
.is-reduced { transition: none; }
</style>
