<template>
  <view class="bm-page points-page" :class="{ 'is-reduced': reducedMotion }">
    <view :style="pageStyle">
    <view class="bm-page-header" :style="sectionStyle(0)"><text class="bm-eyebrow">CHEER / 为好球喝彩</text><text class="bm-title">我的积分</text></view>
    <view v-if="!user.token" :style="sectionStyle(1)"><BmState title="为每一场好球助威" message="登录后每日签到领取积分，查看你的助威记录。" action="登录 / 注册" @action="toLogin" /></view>
    <template v-else>
      <view :style="sectionStyle(1)"><PointsCard :show-link="false" @checked-in="afterCheckIn" /></view>
      <view v-if="unconfirmed" class="bm-card pending-cheer" :style="sectionStyle(2)">
        <text class="bm-heading">有一笔助威结果待确认</text>
        <view class="bm-muted">{{ unconfirmed.quote.side }} 方 · {{ unconfirmed.quote.propName }} × {{ unconfirmed.quote.quantity }} · {{ unconfirmed.quote.points }} 分</view>
        <view class="bm-muted">将核对原订单，不会另建一笔购买。确认完成后再继续助威。</view>
        <view class="bm-section"><BmButton :loading="recovering" @click="recover">确认原订单结果</BmButton></view>
      </view>
      <view v-if="noticeRendered" class="points-feedback" :style="noticeStyle" role="status">{{ displayedNotice }}</view>
      <view v-if="feedbackRendered" :style="feedbackStyle" class="bm-error" role="alert">{{ feedbackText }}<button v-if="!unconfirmed" class="bm-text-button" :disabled="!recoveryError" @click="recoveryError && refresh()">重新读取账户</button></view>
      <view class="points-rules" :style="sectionStyle(3)">
        <text>北京时间每日签到 +{{ points.summary?.checkInReward || 100 }} 分；积分仅用于站内娱乐。</text>
        <text>助威获胜返还包含本金，落败不返还；取消对局退回投入。改判差额可在流水查看。</text>
      </view>
      <view class="bm-sticky" :style="sectionStyle(4, 'fade')"><BmSegments :model-value="tab" :items="tabs" @update:model-value="selectTab($event)" /></view>
      <view :style="sectionStyle(4, 'fade')"><view :style="tabContainerStyle"><view id="points-records" :style="tabStyle" :aria-hidden="!tabInteractive">
      <BmState v-if="displayedPager.state.loading && !displayedPager.state.list.length" kind="loading" />
      <template v-if="displayedTab === 'transactions'">
        <view v-for="row in transactionRows" :key="row.key" :id="`transaction-${row.key}`" :style="row.style" :aria-hidden="row.leaving" class="points-record">
          <view class="points-record-heading"><text class="points-record-title">{{ row.item.description }}</text><text class="points-delta" :class="{ positive: row.item.delta > 0 }">{{ row.item.delta > 0 ? '+' : '' }}{{ row.item.delta }}</text></view>
          <view class="points-record-footer"><text>{{ timeLabel(row.item.createdAt) }}</text><text>{{ row.item.balanceAfter < 0 ? `待抵扣 ${-row.item.balanceAfter}` : `结余 ${row.item.balanceAfter}` }} 分</text></view>
        </view>
        <BmState v-if="transactions.state.loaded && !transactions.state.list.length && !transactions.state.loading" title="还没有积分流水" message="签到领取第一笔积分，或去正在进行的球局助威。" />
      </template>
      <template v-else>
        <view v-for="row in orderRows" :key="row.key" :id="`order-${row.key}`" :style="row.style" :aria-hidden="row.leaving" class="points-order">
          <view class="points-record-heading"><text class="points-record-title">{{ row.item.matchName }} · 第 {{ row.item.gameSequence }} 局</text><text class="bm-tag" :class="orderTone[row.item.status]">{{ orderLabels[row.item.status] }}</text></view>
          <text class="points-support">支持 {{ row.item.side === 'A' ? row.item.teamAName : row.item.teamBName }}</text>
          <view class="bm-muted">{{ row.item.propName }} × {{ row.item.quantity }} · 消耗 {{ row.item.points }} 分</view>
          <view class="points-order-details"><view><text class="points-detail-label">锁定赔率</text><text>{{ (row.item.oddsHundredths / 100).toFixed(2) }} 倍</text></view><view><text class="points-detail-label">获胜预计返还</text><text>{{ row.item.expectedReturn }} 分</text></view><view><text class="points-detail-label">实际返还</text><text>{{ row.item.status === 'pending' ? '待结算' : `${row.item.settledReturn} 分` }}</text></view></view>
          <text class="points-time">{{ timeLabel(row.item.createdAt) }}</text>
        </view>
        <BmState v-if="orders.state.loaded && !orders.state.list.length && !orders.state.loading" title="还没有助威记录" message="在已开始球局的对阵卡片中，选择你支持的一方。" />
      </template>
      <view v-if="displayedPager.state.error" class="bm-error" role="alert"><text>{{ displayedPager.state.error }}</text><view style="margin-top:16rpx"><BmButton small variant="secondary" :loading="displayedPager.state.loading" :disabled="!tabInteractive" @click="tabInteractive && displayedPager.retry()">重新读取记录</BmButton></view></view>
      <view v-else-if="displayedPager.state.list.length" class="points-list-footer">
        <BmButton v-if="displayedPager.state.list.length < displayedPager.state.total" variant="ghost" :loading="displayedPager.state.loading" :disabled="!tabInteractive" @click="more">加载更多</BmButton>
        <text v-else class="bm-muted">{{ displayedPager.state.loading ? '正在更新记录…' : '已显示全部记录' }}</text>
      </view>
      </view></view></view>
    </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, shallowReactive, watch } from "vue";
import { onHide, onPullDownRefresh, onReachBottom, onShow } from "@dcloudio/uni-app";
import { pendingCheer, pointsApi, purchaseCheer } from "@/api/points";
import type { PendingCheer } from "@/api/points";
import type { Page } from "@/types/competition";
import type { CheerOrder, PointTransaction } from "@/types/points";
import { usePointsStore } from "@/store/modules/points";
import { useUserStore } from "@/store/modules/user";
import { usePresence, useSwitchMotion, usePageMotion, useMotionList } from "@/composables/useMotionState";
import BmSegments from "@/components/badminton/BmSegments.vue";
import { reducedMotion } from "@/composables/useMotion";
import { toLogin } from "@/utils/navigation";
import BmButton from "@/components/badminton/BmButton.vue";
import BmState from "@/components/badminton/BmState.vue";
import PointsCard from "@/components/badminton/PointsCard.vue";

type Tab = "transactions" | "orders";
interface PagerState<T> { list: T[]; page: number; total: number; loading: boolean; loaded: boolean; error: string }
const user = useUserStore(), points = usePointsStore(), tab = ref<Tab>("transactions");
const unconfirmed = ref<PendingCheer | null>(null), recovering = ref(false), recoveryError = ref(""), recoveryNotice = ref("");
let revision = 0, visible = false;
const orderLabels: Record<CheerOrder["status"], string> = { pending: "待结算", won: "助威获胜", lost: "助威落败", refunded: "已退款" };
const orderTone: Record<CheerOrder["status"], string> = { pending: "scheduled", won: "completed", lost: "cancelled", refunded: "cancelled" };

function createPager<T extends { id: string }>(fetchPage: (page: number) => Promise<Page<T>>) {
  const state = shallowReactive<PagerState<T>>({ list: [], page: 0, total: 0, loading: false, loaded: false, error: "" });
  let requestRevision = 0, failedPage = 1;
  function invalidate(clear = false) {
    requestRevision++; state.loading = false; state.loaded = false;
    if (clear) { state.list = []; state.page = 0; state.total = 0; state.error = ""; failedPage = 1; }
  }
  async function load(page: number) {
    if (!user.token || state.loading) return;
    const current = ++requestRevision, session = user.token;
    state.loading = true; state.error = ""; failedPage = page;
    try {
      const result = await fetchPage(page);
      if (current !== requestRevision || session !== user.token) return;
      const existingIds = new Set(state.list.map(item => item.id));
      state.list = page === 1 ? result.list : [...state.list, ...result.list.filter(item => !existingIds.has(item.id))];
      state.page = result.page; state.total = result.total; state.loaded = true;
    } catch (cause: any) {
      if (current === requestRevision && session === user.token) state.error = cause.message || "记录暂时无法读取，请重试";
    } finally { if (current === requestRevision && session === user.token) state.loading = false; }
  }
  return { state, invalidate, load, retry: () => load(failedPage) };
}
const transactions = createPager<PointTransaction>(pointsApi.transactions), orders = createPager<CheerOrder>(pointsApi.orders);
const { pageStyle, sectionStyle } = usePageMotion();
const { rows: transactionRows } = useMotionList(() => transactions.state.list, item => item.id, { selector: ".points-record", idPrefix: "transaction-", resetKey: () => user.token, enabled: () => tab.value === "transactions" });
const { rows: orderRows } = useMotionList(() => orders.state.list, item => item.id, { selector: ".points-order", idPrefix: "order-", resetKey: () => user.token, enabled: () => tab.value === "orders" });
const currentPager = computed(() => tab.value === "transactions" ? transactions : orders);
const tabs = [{ value: "transactions", label: "积分流水" }, { value: "orders", label: "我的助威" }];
const tabMotion = useSwitchMotion(() => tab.value, { order: () => ["transactions", "orders"], selector: "#points-records" });
const { displayed: displayedTab, style: tabStyle, containerStyle: tabContainerStyle, interactive: tabInteractive } = tabMotion;
const displayedPager = computed(() => displayedTab.value === "transactions" ? transactions : orders);
const { rendered: noticeRendered, displayed: displayedNotice, style: noticeStyle } = usePresence(() => user.token ? recoveryNotice.value : "", { immediate: () => !user.token });
const { rendered: feedbackRendered, displayed: feedbackText, style: feedbackStyle } = usePresence(() => user.token ? recoveryError.value : "", { immediate: () => !user.token });
function reset() {
  revision++; transactions.invalidate(true); orders.invalidate(true); tabMotion.cancel();
  unconfirmed.value = null; recovering.value = false; recoveryError.value = ""; recoveryNotice.value = "";
}
watch(() => user.token, () => {
  reset();
  // Login finishes updating storage after changing the token; read only after that synchronous update.
  void Promise.resolve().then(() => { if (visible && user.token) return refresh(); });
}, { flush: "sync" });

async function refresh() {
  const current = ++revision, session = user.token;
  transactions.invalidate(); orders.invalidate();
  if (!session) return;
  recoveryError.value = "";
  try {
    await user.restore();
    if (current !== revision || session !== user.token) return;
    unconfirmed.value = user.userInfo ? pendingCheer(user.userInfo.id) : null;
  } catch (cause: any) {
    if (current === revision && session === user.token) recoveryError.value = cause.message || "账户暂时无法读取";
  }
  if (current !== revision || session !== user.token) return;
  await Promise.allSettled([points.load(), currentPager.value.load(1)]);
}
function selectTab(value: string) {
  if (value !== "transactions" && value !== "orders") return;
  tab.value = value;
  if (!currentPager.value.state.loaded && !currentPager.value.state.loading) void currentPager.value.load(1);
}
function more() {
  if (!tabInteractive.value) return;
  const pager = currentPager.value;
  if (!pager.state.error && pager.state.loaded && pager.state.list.length < pager.state.total) void pager.load(pager.state.page + 1);
}
function afterCheckIn() {
  transactions.invalidate();
  if (tab.value === "transactions") void transactions.load(1);
}
async function recover() {
  if (recovering.value || !unconfirmed.value || !user.userInfo) return;
  const intent = unconfirmed.value, session = user.token, accountId = user.userInfo.id;
  if (intent.userId !== accountId) return;
  recovering.value = true; recoveryError.value = ""; recoveryNotice.value = "";
  try {
    const result = await purchaseCheer(intent);
    if (session !== user.token || accountId !== user.userInfo?.id) return;
    points.accept(result.wallet); unconfirmed.value = pendingCheer(accountId);
    recoveryNotice.value = "已确认原助威订单，扣款与奖励以流水为准";
    transactions.invalidate(); orders.invalidate();
    await Promise.allSettled([currentPager.value.load(1), points.load()]);
  } catch (cause: any) {
    if (session === user.token && accountId === user.userInfo?.id) {
      unconfirmed.value = pendingCheer(accountId);
      recoveryError.value = cause.message || "暂未取得原订单结果，请继续确认";
    }
  } finally { if (session === user.token && accountId === user.userInfo?.id) recovering.value = false; }
}
function timeLabel(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? `${new Date(time + 8 * 60 * 60 * 1000).toISOString().slice(0, 16).replace("T", " ")} 北京时间` : "";
}
onShow(() => { visible = true; void refresh(); });
onHide(() => { visible = false; revision++; transactions.invalidate(); orders.invalidate(); });
onReachBottom(more);
onPullDownRefresh(async () => { try { await refresh(); } finally { uni.stopPullDownRefresh(); } });
onUnmounted(() => { visible = false; reset(); });
</script>

<style scoped lang="scss">
@import "@/styles/_tokens.scss";
.points-rules { display: flex; flex-direction: column; gap: 10rpx; margin: 24rpx 0 32rpx; color: $bm-muted; font-size: 23rpx; line-height: 1.8; }
.points-record { padding: 28rpx 0; border-bottom: 2rpx solid $bm-line; }
.points-record-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 20rpx; }
.points-record-title { flex: 1; min-width: 0; font-size: 27rpx; font-weight: 600; line-height: 1.65; overflow-wrap: anywhere; }
.points-delta { flex-shrink: 0; padding-top: 2rpx; color: $bm-ink; font-size: 30rpx; font-weight: 700; font-variant-numeric: tabular-nums; }
.points-delta.positive { color: $bm-primary; }
.points-record-footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8rpx; margin-top: 12rpx; color: $bm-muted; font-size: 24rpx; line-height: 1.7; }
.points-order { padding: 26rpx; margin: 24rpx 0; border: 2rpx solid $bm-line; border-radius: $bm-radius-panel; background: $bm-surface; }
.points-support { display: block; margin: 20rpx 0 8rpx; color: $bm-ink; font-size: 27rpx; line-height: 1.7; overflow-wrap: anywhere; }
.points-order-details { display: flex; flex-wrap: wrap; gap: 22rpx; padding: 22rpx 0; margin-top: 14rpx; border-top: 2rpx solid $bm-line; font-size: 25rpx; }
.points-order-details > view { flex: 1; min-width: 120rpx; }
.points-detail-label { display: block; margin-bottom: 10rpx; color: $bm-muted; font-size: 24rpx; line-height: 1.7; }
.points-time { display: block; color: $bm-muted; font-size: 24rpx; line-height: 1.7; }
.points-list-footer { padding: 28rpx 0; text-align: center; }
.pending-cheer { border-color: $bm-primary; border-left-width: 6rpx; }
.pending-cheer .bm-section { margin-bottom: 0; }
.points-feedback { padding: 22rpx; margin: 20rpx 0; border-radius: $bm-radius; background: $bm-primary-soft; color: $bm-ink; font-size: 25rpx; line-height: 1.7; }
</style>
