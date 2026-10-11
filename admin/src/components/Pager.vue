<template>
  <footer class="pager">
    <span>共 {{ total }} 条 · 第 {{ page }} / {{ Math.max(1, Math.ceil(total / size)) }} 页</span>
    <ElPagination
      background
      size="small"
      layout="prev, pager, next"
      :pager-count="5"
      :current-page="page"
      :page-size="size"
      :total="total"
      :disabled="busy"
      @current-change="next => { if (!busy && next !== page) emit('change', next); }"
    />
  </footer>
</template>

<script setup lang="ts">
import { ElPagination } from "element-plus";
withDefaults(defineProps<{ total: number; page: number; size?: number; busy?: boolean }>(), { size: 20 });
const emit = defineEmits<{ (event: "change", page: number): void }>();
</script>

