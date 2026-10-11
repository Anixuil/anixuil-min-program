<template>
  <div v-if="loading || error || empty" class="state" :role="error && !loading ? 'alert' : 'status'" :aria-busy="loading">
    <template v-if="loading">
      <p class="state-caption">正在读取最新数据…</p>
      <ElSkeleton :rows="4" animated />
    </template>
    <ElResult v-else-if="error" icon="warning" title="暂时无法读取" :sub-title="error">
      <template #extra><ElButton :icon="RefreshRight" @click="$emit('retry')">重新加载</ElButton></template>
    </ElResult>
    <ElEmpty v-else :image-size="72" description="暂无记录，试试调整筛选条件。" />
  </div>
</template>

<script setup lang="ts">
import { ElButton, ElEmpty, ElResult, ElSkeleton } from "element-plus";
import { RefreshRight } from "@element-plus/icons-vue";
defineProps<{ loading?: boolean; error?: string; empty?: boolean }>();
defineEmits<{ (event: "retry"): void }>();
</script>

