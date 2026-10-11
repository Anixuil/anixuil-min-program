<template>
  <ElDialog
    :model-value="open"
    :title="title"
    :width="wide ? 'min(880px, calc(100vw - 32px))' : 'min(560px, calc(100vw - 32px))'"
    class="admin-dialog"
    align-center
    append-to-body
    destroy-on-close
    :show-close="!busy"
    :close-on-click-modal="!busy"
    :close-on-press-escape="!busy"
    :before-close="beforeClose"
    @update:model-value="value => { if (!value && !busy) emit('close'); }"
  >
    <template #header="{ titleId, titleClass }">
      <span class="eyebrow">一羽成局 / 管理操作</span>
      <h2 :id="titleId" :class="titleClass">{{ title }}</h2>
    </template>
    <div :aria-busy="busy"><slot /></div>
  </ElDialog>
</template>

<script setup lang="ts">
import { ElDialog } from "element-plus";
const props = defineProps<{ open: boolean; title: string; busy?: boolean; wide?: boolean }>();
const emit = defineEmits<{ (event: "close"): void }>();
function beforeClose(done: () => void) {
  if (!props.busy) done();
}
</script>

