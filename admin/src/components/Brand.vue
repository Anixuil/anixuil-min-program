<template>
  <div class="brand" :class="{ 'brand--compact': compact }" :aria-label="compact ? '一羽成局 · 运营管理' : undefined">
    <img :src="brandMark" alt="" class="brand-symbol" width="44" height="44" />
    <div v-if="!compact" class="brand-copy"><strong>一羽成局</strong><small>运营管理工作台</small></div>
  </div>
</template>

<script setup lang="ts">
import brandMark from "../assets/brand-mark.png";
defineProps<{ compact?: boolean }>();
</script>

