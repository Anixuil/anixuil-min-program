<template><view class="bm-scoreboard"><view class="bm-score-side"><text class="bm-team">{{ teamA }}</text><text class="bm-score">{{ scoreA ?? '—' }}</text></view><text class="bm-versus">VS</text><view class="bm-score-side"><text class="bm-team">{{ teamB }}</text><text class="bm-score">{{ scoreB ?? '—' }}</text></view></view></template>
<script setup lang="ts">defineProps<{ teamA: string; teamB: string; scoreA: number | null; scoreB: number | null }>();</script>

<style scoped lang="scss">
@import "@/styles/_components.scss";
@include bm-score-styles;
</style>
