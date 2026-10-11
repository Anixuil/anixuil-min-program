<template>
  <view class="bm-page has-dock bm-results-page" :class="{ 'is-reduced': reducedMotion }">
    <view id="result-loading-region" :style="loadingContainerStyle">
      <view v-if="loadingRendered" :style="loadingStyle"><BmState kind="loading" /></view>
      <BmState v-if="error" kind="error" title="战绩分享不可用" :message="error" action="重新加载" :busy="loading" :disabled="loading" @action="reload" />
      <view v-if="result" :style="contentStyle">
        <view class="bm-hero dark bm-results-header" :style="sectionStyle(0, 'fade')">
          <view class="bm-court" />
          <view class="bm-hero-content">
            <view class="bm-row bm-between"><text class="bm-eyebrow">{{ modeLabels[result.match.mode] }} · 球局战绩</text><text class="bm-tag completed">已结束</text></view>
            <text class="bm-title bm-results-title">{{ result.match.name }}</text>
            <view class="bm-results-location">{{ result.match.location }}</view>
            <view class="bm-muted bm-results-date">{{ dateLabel(result.match.startsAt) }} — {{ dateLabel(result.match.endsAt) }}</view>
            <view class="bm-muted">{{ result.players.length }} 位球友 · {{ result.match.courtCount }} 片场地 · {{ completedCount }} 局已完成</view>
          </view>
        </view>

        <view class="bm-sticky" :style="sectionStyle(1, 'fade')"><BmSegments v-model="tab" :items="tabs" /></view>
        <view :style="tabContainerStyle">
          <view id="result-tab-content" :style="tabStyle" :aria-hidden="!tabInteractive">
            <template v-if="displayedTab === 'results'">
              <view class="bm-muted bm-section" :style="sectionStyle(2, 'fade')">只统计已完成对局，取消对局不计战绩。按胜场、净胜分、得分排序；同指标并列。</view>
              <view v-for="(section, sectionIndex) in statSections" :key="section.key" class="bm-card" :style="sectionStyle(sectionIndex + 3, 'fade')">
                <text class="bm-heading">{{ section.title }}</text>
                <view v-for="standing in section.rows" :key="standing.id" class="bm-person bm-results-person">
                  <text class="bm-rank" :class="{ top: standing.rank <= 3 }">{{ standing.rank }}</text>
                  <view class="bm-grow">
                    <text class="bm-person-name">{{ standing.name }}</text>
                    <view class="bm-muted">{{ standing.played }} 局 · 胜率 {{ (standing.winRate * 100).toFixed(1) }}%</view>
                    <view class="bm-muted">得失分 {{ standing.pointsFor }}/{{ standing.pointsAgainst }} · 净胜 {{ standing.difference }}</view>
                  </view>
                  <text class="bm-tag">{{ standing.wins }} 胜 {{ standing.losses }} 负</text>
                </view>
                <view v-if="!section.rows.length" class="bm-muted bm-results-empty">暂无排名数据</view>
              </view>
            </template>
            <template v-else>
              <view class="bm-row bm-between bm-section" :style="sectionStyle(2, 'fade')"><text class="bm-muted">共 {{ result.totalGames }} 局 · {{ completedCount }} 局已完成</text><text v-if="cancelledCount" class="bm-muted">{{ cancelledCount }} 局已取消</text></view>
              <BmState v-if="!rounds.length" title="暂无对局记录" message="这场球局还没有可以展示的比分。" />
              <view v-for="(round, roundIndex) in rounds" :key="round.number" class="bm-card" :style="sectionStyle(roundIndex + 3, 'fade')">
                <view class="bm-row bm-between"><text class="bm-heading">第 {{ round.number }} 轮</text><text class="bm-eyebrow">ROUND {{ round.number }}</text></view>
                <view v-for="game in round.games" :key="game.id" class="bm-divider">
                  <view class="bm-row bm-between"><text class="bm-muted">{{ game.court }} 号场 · 第 {{ game.sequence }} 局</text><text class="bm-tag" :class="game.status">{{ game.status === 'completed' ? '已完成' : game.status === 'cancelled' ? '已取消 · 不计战绩' : '待录分' }}</text></view>
                  <ScoreBoard :team-a="teamName(game.teamA)" :team-b="teamName(game.teamB)" :score-a="game.status === 'completed' ? game.scoreA : null" :score-b="game.status === 'completed' ? game.scoreB : null" />
                </view>
              </view>
            </template>
          </view>
        </view>
        <view class="bm-muted bm-results-note">比分更正后，下拉刷新即可查看最新战绩。</view>
      </view>
    </view>

    <view class="bm-dock">
      <view class="bm-dock-inner">
        <view class="bm-results-home"><BmButton variant="secondary" :disabled="homePending" @click="goHome">返回首页</BmButton></view>
        <!-- #ifdef MP-WEIXIN -->
        <view v-if="shareReady" class="bm-dock-main"><button class="bm-button" open-type="share" hover-class="bm-pressed" :hover-stay-time="80">分享战绩</button></view>
        <!-- #endif -->
        <!-- #ifdef H5 -->
        <view v-if="shareReady" class="bm-dock-main"><BmButton :loading="copying" @click="copyShare">复制战绩链接</BmButton></view>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { onHide, onLoad, onPullDownRefresh, onShareAppMessage, onShow, onUnload } from "@dcloudio/uni-app";
import { api } from "@/api/competition";
import type { PublicMatchResult } from "@/types/competition";
import BmButton from "@/components/badminton/BmButton.vue";
import BmSegments from "@/components/badminton/BmSegments.vue";
import BmState from "@/components/badminton/BmState.vue";
import ScoreBoard from "@/components/badminton/ScoreBoard.vue";
import { reducedMotion } from "@/composables/useMotion";
import { useLoadingMotion, usePageMotion, useSwitchMotion } from "@/composables/useMotionState";
import { dateLabel, modeLabels } from "@/utils/navigation";
import { copyResultShare, resultSharePayload, setResultShareMenu } from "@/utils/resultShare";

const token = ref("");
const result = ref<PublicMatchResult | null>(null);
const loading = ref(false), error = ref(""), visible = ref(false);
const copying = ref(false), homePending = ref(false), tab = ref("results");
const tabs = [{ value: "results", label: "排名" }, { value: "games", label: "每局比分" }];
let alive = true, loaded = false, revision = 0, copyRevision = 0;
const { sectionStyle } = usePageMotion();
const tabMotion = useSwitchMotion(() => tab.value, { order: () => ["results", "games"], selector: "#result-tab-content" });
const { displayed: displayedTab, style: tabStyle, containerStyle: tabContainerStyle, interactive: tabInteractive } = tabMotion;
const loadingMotion = useLoadingMotion(() => loading.value && !result.value, () => !!result.value, { selector: "#result-loading-region" });
const { loadingRendered, loadingStyle, contentStyle, containerStyle: loadingContainerStyle } = loadingMotion;
const shareReady = computed(() => visible.value && !!result.value && !loading.value && !error.value);
const completedCount = computed(() => result.value?.games.filter(game => game.status === "completed").length || 0);
const cancelledCount = computed(() => result.value?.games.filter(game => game.status === "cancelled").length || 0);
const playerNames = computed(() => new Map(result.value?.players.map(player => [player.id, player.name]) || []));
const statSections = computed(() => result.value ? [
  { key: "personal", title: "个人排名", rows: result.value.stats },
  ...(result.value.match.mode === "fixed" ? [{ key: "team", title: "固定搭档排名", rows: result.value.teamStats }] : []),
] : []);
const rounds = computed(() => {
  const games = result.value?.games || [];
  return [...new Set(games.map(game => game.round))].sort((a, b) => a - b).map(number => ({
    number,
    games: games.filter(game => game.round === number).sort((a, b) => a.sequence - b.sequence),
  }));
});

watch(shareReady, ready => { if (visible.value) setResultShareMenu(ready); }, { flush: "sync" });
function teamName(ids: string[]) { return ids.map(id => playerNames.value.get(id) || "未知选手").join(" / "); }

async function reload() {
  if (!alive || !visible.value || loading.value) return;
  const ticket = ++revision;
  loading.value = true;
  error.value = "";
  setResultShareMenu(false);
  try {
    if (!token.value) {
      result.value = null;
      error.value = "链接不完整，请重新打开球友分享的战绩。";
      return;
    }
    const data = await api.sharedResults(token.value);
    if (!alive || !visible.value || ticket !== revision) return;
    result.value = data;
  } catch (cause: unknown) {
    if (!alive || !visible.value || ticket !== revision) return;
    result.value = null;
    const code = Number((cause as { code?: number })?.code);
    error.value = [400, 403, 404, 410].includes(code)
      ? "链接已失效，或这场球局暂不支持查看战绩。"
      : "暂时无法读取战绩，请稍后重新加载。";
  } finally {
    if (alive && visible.value && ticket === revision) loading.value = false;
  }
}

async function copyShare() {
  if (!shareReady.value || copying.value) return;
  const ticket = ++copyRevision;
  copying.value = true;
  try {
    await copyResultShare(token.value);
    if (alive && visible.value && ticket === copyRevision) uni.showToast({ title: "战绩链接已复制", icon: "none" });
  } catch {
    if (alive && visible.value && ticket === copyRevision) uni.showToast({ title: "复制失败，请重试", icon: "none" });
  } finally {
    if (alive && visible.value && ticket === copyRevision) copying.value = false;
  }
}

function goHome() {
  if (homePending.value) return;
  homePending.value = true;
  uni.switchTab({
    url: "/pages/index/index",
    fail: () => { if (alive && visible.value) uni.showToast({ title: "首页打开失败，请重试", icon: "none" }); },
    complete: () => { homePending.value = false; },
  });
}

function suspend() {
  if (visible.value) setResultShareMenu(false);
  visible.value = false;
  revision++;
  copyRevision++;
  loading.value = false;
  copying.value = false;
  tabMotion.cancel();
  uni.stopPullDownRefresh();
}

onLoad(query => {
  token.value = String(query?.token || "");
  loaded = true;
  setResultShareMenu(false);
});
onShow(() => {
  visible.value = true;
  if (loaded) void reload();
});
onHide(suspend);
onUnload(() => { alive = false; suspend(); });
onPullDownRefresh(async () => {
  try { await reload(); }
  finally { if (alive && visible.value) uni.stopPullDownRefresh(); }
});
onShareAppMessage(() => shareReady.value && result.value
  ? resultSharePayload(result.value.match.name, token.value)
  : { title: "球局战绩", path: "/pages/index/index" });
</script>

<style scoped lang="scss">
.bm-results-header { margin-top: 0; }
.bm-results-title { margin: 18rpx 0; }
.bm-results-location { overflow-wrap: anywhere; }
.bm-results-date { margin-top: 12rpx; }
.bm-results-person:last-child { border-bottom: 0; }
.bm-results-person .bm-rank { flex-shrink: 0; }
.bm-results-empty { margin-top: 20rpx; }
.bm-results-note { margin-top: 32rpx; text-align: center; }
.bm-results-home { flex: 0 0 220rpx; }
</style>
