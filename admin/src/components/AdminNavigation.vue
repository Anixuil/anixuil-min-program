<template>
  <ElMenu :default-active="active" :collapse="collapsed" :collapse-transition="false" class="admin-menu" aria-label="后台导航" @select="select">
    <ElMenuItem v-for="item in items" :key="item.id" :index="item.id" :aria-current="active === item.id ? 'page' : undefined">
      <ElIcon><component :is="item.icon" /></ElIcon>
      <template #title>{{ item.name }}</template>
    </ElMenuItem>
  </ElMenu>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { ElIcon, ElMenu, ElMenuItem } from "element-plus";
defineProps<{ items: { id: string; name: string; icon: Component }[]; active: string; collapsed?: boolean }>();
const emit = defineEmits<{ (event: "navigate"): void }>();
function select(id: string) {
  location.hash = id;
  emit("navigate");
}
</script>

