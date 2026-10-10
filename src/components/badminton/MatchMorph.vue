<template>
  <view class="match-morph" aria-hidden="true">
    <view class="match-morph-surface" :style="surfaceStyle">
      <view class="bm-court" :style="`opacity:${current.hero ? 1 : 0};transition:opacity 320ms ease;`" />
      <view class="match-morph-arrow" :style="`opacity:${current.hero ? 0 : 1};`">↗</view>
      <view class="match-morph-line" :style="`opacity:${current.hero ? 0 : 1};top:calc(${current.rects.date.top - current.rects.surface.top}px - 22rpx);`" />
    </view>
    <view v-for="part in textParts" :key="part" class="match-morph-text" :class="part === 'status' ? ['bm-tag', match.status] : ''" :style="partStyle(part)">{{ labels[part] }}</view>
  </view>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { CompetitionSummary } from "@/types/competition";
import type { MatchPart, MatchSnapshot } from "@/composables/useMatchPresentation";
import { dateLabel, modeLabels, statusLabels } from "@/utils/navigation";
const props = defineProps<{ match: CompetitionSummary; from: MatchSnapshot; to: MatchSnapshot; moved: boolean }>();
const textParts = ["mode", "status", "name", "location", "date", "meta"] as const;
const current = computed(() => props.moved ? props.to : props.from);
const labels = computed(() => ({ mode: modeLabels[props.match.mode], status: statusLabels[props.match.status], name: props.match.name, location: props.match.location, date: dateLabel(props.match.startsAt), meta: `${props.match._count?.players || 0} 位球友 · ${props.match.courtCount} 片场地` }));
const ease = "320ms cubic-bezier(.2,.8,.2,1)";
const transition = computed(() => props.moved ? `transition:left ${ease},top ${ease},width ${ease},height ${ease},font-size ${ease},line-height ${ease},color ${ease},background-color ${ease},border-color ${ease};` : "transition:none;");
function geometry(part: MatchPart) {
  const r = current.value.rects[part];
  return `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
}
const surfaceStyle = computed(() => `${geometry("surface")}${transition.value}background:${current.value.hero ? "#17231f" : "#fff"};border-color:${current.value.hero ? "#17231f" : "#dce2dc"};`);
function partStyle(part: typeof textParts[number]) {
  const hero = current.value.hero;
  const size = { mode: 22, status: 22, name: hero ? 48 : 36, location: hero ? 28 : 26, date: hero ? 24 : 27, meta: 24 }[part];
  const color = part === "status" ? "" : part === "mode" ? (hero ? "#ffad7b" : "#65716a") : hero ? (["date", "meta"].includes(part) ? "#c1cdc5" : "#fff") : (["location", "meta"].includes(part) ? "#65716a" : "#17231f");
  const line = part === "name" ? (hero ? 1.3 : 1.4) : ((part === "date" && hero) || part === "meta" ? 1.7 : 1.5);
  const weight = part === "name" ? 700 : (part === "mode" || (part === "date" && !hero) ? 600 : 400);
  return `${geometry(part)}${transition.value}font-size:${size}rpx;line-height:${line};font-weight:${weight};${color ? `color:${color};` : ""}${part === "mode" ? "letter-spacing:2rpx;" : ""}`;
}
</script>
<style scoped lang="scss">
.match-morph { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 90; pointer-events: none; }
.match-morph-surface { position: absolute; box-sizing: border-box; overflow: hidden; border: 1rpx solid; border-radius: 24rpx; }
.match-morph-text { position: absolute; box-sizing: border-box; overflow: hidden; overflow-wrap: break-word; margin: 0; }
.match-morph-arrow { position: absolute; right: 30rpx; bottom: 30rpx; width: 60rpx; height: 60rpx; border-radius: 50%; background: #edf0ed; color: #17231f; text-align: center; font-size: 30rpx; line-height: 60rpx; transition: opacity 160ms ease; }
.match-morph-line { position: absolute; left: 30rpx; right: 30rpx; border-top: 1rpx solid #dce2dc; transition: opacity 160ms ease, top 320ms cubic-bezier(.2,.8,.2,1); }
</style>
