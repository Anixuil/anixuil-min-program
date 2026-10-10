<template><BmSheet :model-value="!!message" title="确认操作" @close="$emit('answer', false)"><view class="bm-confirm-copy">{{ displayed }}</view><view class="bm-actions"><view><BmButton variant="secondary" @click="$emit('answer', false)">再想想</BmButton></view><view><BmButton @click="$emit('answer', true)">确认</BmButton></view></view></BmSheet></template>
<script setup lang="ts">
import BmSheet from "./BmSheet.vue";
import BmButton from "./BmButton.vue";
import { ref, watch } from "vue";
const props = defineProps<{ message: string }>(); defineEmits<{ (e: "answer", value: boolean): void }>();
const displayed = ref("");
watch(() => props.message, value => { if (value) displayed.value = value; }, { immediate: true });
</script>

<style scoped lang="scss">
@import "@/styles/_tokens.scss";

.bm-confirm-copy {
  padding: 10rpx 0 20rpx;
  color: $bm-muted;
  line-height: 1.9;
}
.bm-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 26rpx;
}
.bm-actions > view {
  flex: 1;
  min-width: 0;
}
@media (max-width: 360px) {
  .bm-actions { flex-wrap: wrap; }
  .bm-actions > view { flex-basis: 240rpx; }
}
</style>
