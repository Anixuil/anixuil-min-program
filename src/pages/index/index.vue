<template>
  <view>
  <MatchDetailHost ref="matchHost" :title="BRAND_NAME" @closed="load" />
  <view class="bm-page" :class="{ 'is-reduced': reducedMotion }">
    <view class="bm-row bm-between bm-home-heading" :style="sectionStyle(0)"><view class="bm-grow"><BmBrand compact /><text class="bm-title" style="margin-top:16rpx">{{ user.userInfo?.nickname ? `${user.userInfo.nickname}，上场吧` : '一起，打场好球' }}</text></view></view>
    <view class="bm-hero bm-home-hero" :style="sectionStyle(1)"><view class="bm-court" /><view class="bm-hero-content"><text class="bm-eyebrow">{{ BRAND_NAME }}</text><text class="bm-hero-title">好球，有序成局。</text><view class="bm-muted">约好球友，排好球局，记下每一场好球。</view><view style="margin-top:24rpx"><BmButton @click="create">＋ 发起一场球局</BmButton></view></view></view>
    <view v-if="!user.token" :style="sectionStyle(2)"><BmState title="球友都在等你" message="登录后查看球局，也可以从好友的邀请进入。" action="登录 / 注册" @action="toLogin" /></view>
    <template v-else>
      <view v-if="errorRendered" :style="errorStyle"><view :style="sectionStyle(2, 'fade')"><BmState kind="error" title="暂时没连上球场" :message="displayedError" action="重新加载" :disabled="!error" :busy="loading" @action="error && load()" /></view></view>
      <view id="home-loading-region" :style="containerStyle">
        <view v-if="loadingRendered" :style="loadingStyle"><view :style="sectionStyle(2, 'fade')"><BmState kind="loading" /></view></view>
        <view v-if="recent.length || active.length || !loading" :style="contentStyle">
          <view v-if="activeRows.length" :style="sectionStyle(2, 'fade')"><view class="bm-row bm-between bm-section"><text class="bm-heading bm-section-heading">正在进行</text><text class="bm-tag active">LIVE</text></view><view v-for="row in activeRows" :id="`home-active-${row.key}`" :key="row.key" class="home-active-row" :style="row.style"><MatchCard :match="row.item" :disabled="row.leaving" /></view></view>
          <view :style="sectionStyle(3)"><PointsCard compact /></view>
          <view :style="sectionStyle(4, 'fade')">
            <view class="bm-row bm-between bm-section"><text class="bm-heading bm-section-heading">最近球局</text><button class="bm-text-button" @click="all" hover-class="bm-touch" :hover-stay-time="80">查看全部 →</button></view>
            <view v-for="row in recentRows" :id="`home-recent-${row.key}`" :key="row.key" class="home-recent-row" :style="row.style"><MatchCard :match="row.item" :disabled="row.leaving" /></view>
            <BmState v-if="!recent.length && !loading && !error" title="第一场，从这里开始" message="发起球局，或请球友分享邀请给你。" action="发起球局" @action="create" />
          </view>
        </view>
      </view>
    </template>
    <view :style="sectionStyle(user.token ? 5 : 3, 'fade')"><view class="bm-muted" style="text-align:center;margin-top:40rpx">{{ BRAND_TAGLINE }}</view></view>
  </view>

  </view>
</template>
<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import { onShow, onPullDownRefresh, onShareAppMessage } from "@dcloudio/uni-app";
import BmBrand from "@/components/badminton/BmBrand.vue";
import { BRAND_NAME, BRAND_TAGLINE } from "@/config/brand";
import MatchDetailHost from "@/components/badminton/MatchDetailHost.vue";
import { provideMatchPresentation } from "@/composables/useMatchPresentation";
import { api } from "@/api/competition";
import { useUserStore } from "@/store/modules/user";
import { reducedMotion } from "@/composables/useMotion";
import { useLoadingMotion, useMotionList, usePageMotion, usePresence } from "@/composables/useMotionState";
import { toLogin } from "@/utils/navigation";
import type { CompetitionSummary } from "@/types/competition";
import BmButton from "@/components/badminton/BmButton.vue";
import BmState from "@/components/badminton/BmState.vue";
import MatchCard from "@/components/badminton/MatchCard.vue";
import PointsCard from "@/components/badminton/PointsCard.vue";
import { usePointsStore } from "@/store/modules/points";
const points = usePointsStore();
const matchHost = ref<InstanceType<typeof MatchDetailHost> | null>(null);
provideMatchPresentation(() => matchHost.value);
const user = useUserStore(), recent = ref<CompetitionSummary[]>([]), active = ref<CompetitionSummary[]>([]), loading = ref(false), error = ref("");
const { sectionStyle } = usePageMotion();
const { loadingRendered, loadingStyle, contentStyle, containerStyle } = useLoadingMotion(() => loading.value && !recent.value.length && !active.value.length, () => Boolean(recent.value.length || active.value.length), { selector: "#home-loading-region" });
const { rendered: errorRendered, displayed: displayedError, style: errorStyle } = usePresence(() => user.token ? error.value : "", { immediate: () => !user.token });
const { rows: activeRows } = useMotionList(() => active.value, match => match.id, { resetKey: () => user.token, selector: ".home-active-row", idPrefix: "home-active-" });
const { rows: recentRows } = useMotionList(() => recent.value, match => match.id, { resetKey: () => user.token, selector: ".home-recent-row", idPrefix: "home-recent-" });
let revision = 0, lastSession = "";
watch(() => user.token, () => { revision++; recent.value = []; active.value = []; error.value = ""; loading.value = false; }, { flush: "sync" });
async function load() {
  if (matchHost.value?.isOpen) return;
  const current = ++revision; const session = user.token;
  if (session !== lastSession) { recent.value = []; active.value = []; lastSession = session; }
  if (!session) { recent.value = []; active.value = []; loading.value = false; return; }
  loading.value = true; error.value = "";
  try { await user.restore(); const [latest, ongoing] = await Promise.all([api.list(1, "all", ""), api.list(1, "all", "active")]); if (current !== revision || session !== user.token || matchHost.value?.isOpen) return; recent.value = latest.list.slice(0, 3); active.value = ongoing.list.slice(0, 2); }
  catch (e: any) { if (current === revision) error.value = e.message; }
  finally { if (current === revision) loading.value = false; }
}
function create() { if (!user.token) toLogin(); else uni.navigateTo({ url: "/pages/create/index" }); }
function all() { uni.switchTab({ url: "/pages/schedule/index" }); }
onShow(() => { void load(); void points.load().catch(() => {}); }); onPullDownRefresh(async () => { try { await Promise.allSettled([load(), points.load()]); } finally { uni.stopPullDownRefresh(); } }); onUnmounted(() => { revision++; });
onShareAppMessage(() => matchHost.value?.share() || { title: BRAND_NAME, path: "/pages/index/index" });
</script>



