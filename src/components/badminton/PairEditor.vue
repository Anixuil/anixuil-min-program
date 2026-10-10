<template><view :class="{ 'is-reduced': reducedMotion }">
  <view class="bm-muted">选择两位球友组成一队。所有人配对后一起保存。</view>
  <view v-for="row in playerRows" :id="`pair-${row.key}`" :key="row.key" class="bm-pair-choice bm-pair-motion" :class="{ selected: !row.leaving && selected.includes(row.item.id) }" :style="row.style" :aria-hidden="row.leaving" :hover-class="busy || row.leaving || row.item.groupLabel ? 'none' : 'bm-touch'" @click="!row.leaving && select(row.item.id)">
    <view class="bm-row"><view class="bm-avatar">{{ row.item.position + 1 }}</view><view class="bm-grow"><text class="bm-person-name">{{ row.item.name }}</text><text class="bm-muted">{{ row.item.groupLabel || '待配对 · 点击选择' }}</text></view><button v-if="row.item.groupLabel" class="bm-text-button" :disabled="busy || row.leaving" @click.stop="!row.leaving && unpair(row.item.id)" :hover-class="busy || row.leaving ? 'none' : 'bm-touch'" :hover-stay-time="80">解除</button><text v-else>{{ !row.leaving && selected.includes(row.item.id) ? '●' : '○' }}</text></view>
  </view>
  <view v-if="errorRendered" class="bm-error" :style="errorStyle">{{ displayedError }}</view>
  <view class="bm-actions"><view><BmButton variant="secondary" :disabled="busy || selected.length !== 2" @click="pair">组成一队（{{ selected.length }}/2）</BmButton></view><view><BmButton :loading="busy" :disabled="!complete" @click="save">保存搭档</BmButton></view></view>
</view></template>
<script setup lang="ts">
import { computed, ref } from "vue";
import type { Player } from "@/types/competition";
import { reducedMotion } from "@/composables/useMotion";
import { useMotionList, usePresence } from "@/composables/useMotionState";
import BmButton from "./BmButton.vue";
const props = defineProps<{ players: Player[]; busy: boolean }>();
const emit = defineEmits<{ (e: "save", pairs: string[][]): void; (e: "dirty", value: boolean): void }>();
const existing = new Map<string, string[]>(); props.players.forEach(p => { if (p.pairKey) existing.set(p.pairKey, [...(existing.get(p.pairKey) || []), p.id]); });
const groups = ref<string[][]>([...existing.values()]), selected = ref<string[]>([]), error = ref("");
const { rendered: errorRendered, displayed: displayedError, style: errorStyle } = usePresence(() => error.value);
const groupLabels = computed(() => Object.fromEntries(groups.value.flatMap((pair, index) => pair.map(id => [id, `第 ${index + 1} 队 · ${pair.map(pid => props.players.find(p => p.id === pid)?.name).join(' / ')}`]))));
const ordered = computed(() => { const ids = groups.value.flat(); return [...props.players].sort((a, b) => { const x = ids.indexOf(a.id), y = ids.indexOf(b.id); return (x < 0 ? 1000 + a.position : x) - (y < 0 ? 1000 + b.position : y); }); });
const { rows: playerRows } = useMotionList(() => ordered.value.map(player => ({ ...player, groupLabel: groupLabels.value[player.id] || "" })), player => player.id, { selector: ".bm-pair-motion", idPrefix: "pair-" });
const complete = computed(() => groups.value.length >= 2 && groups.value.every(pair => pair.length === 2) && new Set(groups.value.flat()).size === props.players.length);
function select(id: string) { if (props.busy || groupLabels.value[id] || !props.players.some(player => player.id === id)) return; selected.value = selected.value.includes(id) ? selected.value.filter(value => value !== id) : selected.value.length < 2 ? [...selected.value, id] : selected.value; }
function pair() { if (props.busy || selected.value.length !== 2 || selected.value.some(id => groupLabels.value[id] || !props.players.some(player => player.id === id))) return; const pair = [...selected.value]; selected.value = []; groups.value.push(pair); emit("dirty", true); }
function unpair(id: string) { if (props.busy || !groupLabels.value[id]) return; groups.value = groups.value.filter(pair => !pair.includes(id)); emit("dirty", true); }
function save() { if (!props.busy && complete.value) emit("save", groups.value.map(pair => [...pair])); }
</script>

<style scoped lang="scss">
.bm-error { animation: none; }
</style>
