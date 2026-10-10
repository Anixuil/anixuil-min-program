<template>
  <view class="bm-page" :class="{ 'is-reduced': reducedMotion }">
    <view id="match-list-background" :style="backgroundStyle" :aria-hidden="backgroundBlocked" :inert="backgroundBlocked ? true : undefined">
    <view class="bm-row bm-between bm-page-header" :style="sectionStyle(0)"><view class="bm-grow"><text class="bm-eyebrow">COURT / 我的赛程</text><text class="bm-title">我的球局</text></view><BmButton small @click="create">＋ 发起</BmButton></view>
    <view v-if="!user.token" :style="sectionStyle(1)"><BmState title="每一场，都值得记录" message="登录后查看你参与和发起的球局。" action="登录 / 注册" @action="toLogin" /></view>
    <template v-else>
      <view class="bm-sticky"><view :style="sectionStyle(1)"><BmSegments :model-value="scope" :items="scopes" @update:model-value="setScope" /></view></view>
      <view class="bm-row bm-between" :style="sectionStyle(2)"><text class="bm-muted">{{ total }} 场球局</text><button class="bm-filter-button" :aria-expanded="filterOpen" @click="filterOpen = true" hover-class="bm-touch" :hover-stay-time="80"><text>{{ statuses[statusIndex].label }}</text><view class="bm-chevron" :class="{ 'is-open': filterOpen }" /></button></view>
      <view v-if="errorRendered" :style="errorStyle"><view :style="sectionStyle(3, 'fade')"><BmState kind="error" title="加载失败" :message="displayedError" action="重试" :disabled="!error" :busy="loading" @action="error && load(true)" /></view></view>
      <view :style="filterStyle" :aria-hidden="!filterInteractive">
        <view id="match-list-loading-region" :style="containerStyle">
          <view v-if="loadingRendered" :style="loadingStyle"><view :style="sectionStyle(3, 'fade')"><BmState kind="loading" /></view></view>
          <view v-if="rows.length || !loading" :style="contentStyle">
            <view :style="sectionStyle(3, 'fade')">
              <view v-for="row in rows" :id="`match-list-${row.key}`" :key="row.key" class="match-list-row" :style="row.style"><MatchCard :match="row.item" :disabled="row.leaving || !filterInteractive" /></view>
              <BmState v-if="!rows.length && !loading && !error" title="这里还没有球局" message="试试其他筛选，或发起新的一场。" action="发起球局" :disabled="!filterInteractive" @action="filterInteractive && create()" />
              <view v-if="list.length" style="padding:20rpx 0;text-align:center"><BmButton v-if="list.length < total" variant="ghost" :loading="loading" :disabled="!filterInteractive" @click="load(false)">加载更多</BmButton><text v-else class="bm-muted">已经到底了，球场见</text></view>
            </view>
          </view>
        </view>
      </view>
    </template>
    </view>
    <BmSheet :model-value="filterOpen" title="球局状态" @close="filterOpen = false"><button v-for="(item, index) in statuses" :key="item.value" class="bm-option" :class="{ selected: index === statusIndex }" :disabled="!filterOpen" @click="filterOpen && setStatus(index)" :hover-class="filterOpen ? 'bm-touch' : 'none'" :hover-stay-time="80">{{ item.label }}<text v-if="index === statusIndex" style="float:right">✓</text></button></BmSheet>
  </view>
</template>
<script setup lang="ts">
import { onUnmounted, ref, shallowRef, watch } from "vue";
import { api } from "@/api/competition";
import { useUserStore } from "@/store/modules/user";
import { statusLabels, toLogin } from "@/utils/navigation";
import { reducedMotion } from "@/composables/useMotion";
import { useLoadingMotion, useMotionList, usePageMotion, usePresence, useSwitchMotion } from "@/composables/useMotionState";
import { useSheetBackground } from "@/composables/useSheetBackground";
import type { CompetitionSummary } from "@/types/competition";
import BmButton from "./BmButton.vue"; import BmSheet from "./BmSheet.vue"; import BmSegments from "./BmSegments.vue"; import BmState from "./BmState.vue"; import MatchCard from "./MatchCard.vue";
const props = defineProps<{ suspended?: boolean }>();
const user = useUserStore(), list = ref<CompetitionSummary[]>([]), total = ref(0), page = ref(0), scope = ref("all"), statusIndex = ref(0), filterOpen = ref(false), error = ref(""), loading = ref(false);
const { sectionStyle } = usePageMotion();
const { backgroundStyle, backgroundBlocked } = useSheetBackground(() => filterOpen.value, { selector: "#match-list-background" });
const { displayed: displayedFilter, style: filterStyle, interactive: filterInteractive, cancel: cancelFilterMotion } = useSwitchMotion(() => `${scope.value}:${statusIndex.value}`);
const previousList = shallowRef<CompetitionSummary[]>([]);
watch([list, displayedFilter, scope, statusIndex], () => { if (displayedFilter.value === `${scope.value}:${statusIndex.value}`) previousList.value = list.value; }, { immediate: true, flush: "sync" });
const { loadingRendered, loadingStyle, contentStyle, containerStyle } = useLoadingMotion(() => loading.value && !list.value.length && filterInteractive.value, () => Boolean(list.value.length), { get selector() { return backgroundBlocked.value ? undefined : "#match-list-loading-region"; } });
const { rendered: errorRendered, displayed: displayedError, style: errorStyle } = usePresence(() => user.token ? error.value : "", { immediate: () => !user.token });
const { rows } = useMotionList(() => displayedFilter.value === `${scope.value}:${statusIndex.value}` ? list.value : previousList.value, match => match.id, { enabled: () => !backgroundBlocked.value, resetKey: () => `${user.token}:${displayedFilter.value}`, selector: ".match-list-row", idPrefix: "match-list-" });
const scopes = [{ value: "all", label: "全部相关" }, { value: "joined", label: "我参与" }, { value: "owned", label: "我发起" }];
const statuses = [{ value: "", label: "全部状态" }, ...Object.entries(statusLabels).map(([value, label]) => ({ value, label }))];
let revision = 0, lastSession = "";
watch(() => user.token, () => { revision++; list.value = []; previousList.value = []; total.value = 0; page.value = 0; loading.value = false; error.value = ""; filterOpen.value = false; cancelFilterMotion(); }, { flush: "sync" });
async function load(reset = true) {
  if (props.suspended || (loading.value && !reset)) return;
  const current = ++revision, session = user.token;
  if (session !== lastSession) { list.value = []; total.value = 0; page.value = 0; lastSession = session; }
  if (!session) { list.value = []; total.value = 0; loading.value = false; return; }
  loading.value = true; error.value = ""; const next = reset ? 1 : page.value + 1;
  try { await user.restore(); const result = await api.list(next, scope.value, statuses[statusIndex.value].value); if (current !== revision || session !== user.token || props.suspended) return; list.value = reset ? result.list : [...list.value, ...result.list]; total.value = result.total; page.value = next; }
  catch (e: any) { if (current === revision) error.value = e.message; }
  finally { if (current === revision) loading.value = false; }
}
function setScope(value: string) { if (scope.value === value) return; scope.value = value; list.value = []; total.value = 0; page.value = 0; load(true); }
function setStatus(value: number) { filterOpen.value = false; if (statusIndex.value === value) return; statusIndex.value = value; list.value = []; total.value = 0; page.value = 0; load(true); }
function create() { if (!user.token) toLogin(); else uni.navigateTo({ url: "/pages/create/index" }); }
function more() { if (!loading.value && !error.value && list.value.length < total.value) load(false); }
onUnmounted(() => { revision++; }); defineExpose({ refresh: () => load(true), more });
</script>

