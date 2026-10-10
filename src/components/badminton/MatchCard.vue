<template>
  <view class="bm-match-card-space">

  <view id="bm-share-surface" class="bm-match-card bm-share-node" :class="[match.status, { 'is-reduced': reducedMotion }]" :style="transitionStyle" :aria-disabled="disabled" :hover-class="disabled ? 'none' : 'bm-card-pressed'" :hover-stay-time="100" @click="open">
    <view class="bm-row bm-between"><text id="bm-share-mode" class="bm-eyebrow bm-share-node">{{ modeLabels[match.mode] }}</text><text id="bm-share-status" class="bm-tag bm-share-node" :class="match.status">{{ statusLabels[match.status] }}</text></view>
    <text id="bm-share-name" class="bm-match-name bm-share-node">{{ match.name }}</text><view id="bm-share-location" class="bm-location bm-share-node">{{ match.location }}</view>
    <view class="bm-match-footer"><view><text id="bm-share-date" class="bm-match-date bm-share-node">{{ dateLabel(match.startsAt) }}</text><view id="bm-share-meta" class="bm-muted bm-share-node">{{ match._count?.players || 0 }} 位球友 · {{ match.courtCount }} 片场地</view></view><view class="bm-arrow">↗</view></view>
  </view>

  </view>
</template>
<script setup lang="ts">
import { computed, inject, ref } from "vue";

import { createMatchShareKey, matchPresentationKey, hiddenMatchCard, matchSnapshot } from "@/composables/useMatchPresentation";
import type { CompetitionSummary } from "@/types/competition";
import { dateLabel, modeLabels, statusLabels } from "@/utils/navigation";
import { openMatch, reducedMotion, transitioningMatch, useLayoutMotion } from "@/composables/useMotion";
const props = defineProps<{ match: CompetitionSummary; disabled?: boolean }>();
const selected = ref(false);
const { measure } = useLayoutMotion();
const sourceMeasure = async () => matchSnapshot(await measure(".bm-share-node"), false);
const shareKey = createMatchShareKey(), present = inject(matchPresentationKey, null);
async function open() { if (props.disabled || selected.value) return; selected.value = true; try { if (present) await present(props.match, { key: shareKey, measure: sourceMeasure }); else await openMatch(props.match); } finally { selected.value = false; } }
const transitionStyle = computed(() => {
  if (hiddenMatchCard.value === shareKey) return "opacity:0;pointer-events:none;";
  // #ifdef H5
  if (selected.value && transitioningMatch.value === props.match.id) return "view-transition-name:bm-match;";
  // #endif
  return selected.value ? "transform:none;transition:none;" : "";
});
</script>

<style scoped lang="scss">
@import "@/styles/_components.scss";
@include bm-card-styles;
@include bm-keyframes;
.bm-match-card-space { margin: 20rpx 0; }
.bm-match-card { margin: 0; }
.bm-location, .bm-match-date, .bm-eyebrow { line-height: 1.5; }
</style>

