<template>
  <BmSheet :model-value="modelValue" title="把喝彩送给球友" :busy="busy" @close="$emit('close')">
    <view v-if="game" :class="{ 'is-reduced': reducedMotion }">
      <view class="bm-muted">第 {{ game.sequence }} 局 · {{ teamA }} vs {{ teamB }}</view>
      <view class="cheer-wallet"><text>可用 {{ points.summary?.available ?? '—' }} 积分</text><button class="bm-text-button" :disabled="busy" @click="openPoints">积分中心 →</button></view>
      <view v-if="points.summary?.debt" class="bm-error">待抵扣 {{ points.summary.debt }} 分，后续收入将先抵扣。</view>
      <view v-if="pending" class="cheer-notice">
        <text class="bm-heading">有一笔助威结果待确认</text>
        <view class="bm-muted">{{ samePending ? '继续确认原订单，不会再次购买。即使已封盘，也可以恢复结果。' : '请先到积分中心确认另一笔订单，再购买新的道具。' }}</view>
        <BmButton :loading="busy" :disabled="busy" @click="samePending ? recoverPurchase() : openPoints()">{{ samePending ? '确认原订单结果' : '前往积分中心' }}</BmButton>
      </view>
      <view v-if="successRendered" class="cheer-notice" :style="successStyle" role="status">{{ displayedSuccess }}<view class="bm-muted">之后可在积分中心查看结算和流水。</view></view>
      <view v-if="!market?.open" class="bm-muted bm-section">{{ game.status === 'cancelled' ? '本局已取消，已购买的助威积分会退回。' : game.status === 'completed' ? '本局已结算，返还按各笔锁定赔率计算。' : market?.closedAt ? '本局已结束助威，等待录入最终比分。' : '整场球局开始后开放助威。' }}</view>
      <template v-if="market?.open && !pending">
        <text class="bm-label">支持哪一方</text>
        <view class="cheer-options">
          <button v-for="entry in teams" :key="entry.side" class="cheer-choice" :aria-pressed="side === entry.side" :class="{ selected: side === entry.side }" :disabled="busy || !!market.mySupport && market.mySupport.side !== entry.side" @click="chooseSide(entry.side)" :hover-class="busy ? 'none' : 'cheer-pressed'">
            <text class="bm-heading">{{ entry.side }} 方 {{ side === entry.side ? '✓' : '' }}</text><text class="bm-muted">{{ entry.name }}</text>
          </button>
        </view>
        <view class="bm-muted">{{ market.mySupport ? `已支持 ${market.mySupport.side} 方 ${market.mySupport.points} 分，可继续追加。` : '本局第一次购买后锁定支持方向，不能换边或撤回。' }}</view>
        <text class="bm-label">选择助威道具</text>
        <view class="cheer-options">
          <button v-for="item in points.summary?.props || []" :key="item.id" class="cheer-choice" :aria-pressed="propId === item.id" :class="{ selected: propId === item.id }" :disabled="busy" @click="chooseProp(item.id)" :hover-class="busy ? 'none' : 'cheer-pressed'"><text>{{ item.name }} {{ propId === item.id ? '✓' : '' }}</text><text class="bm-muted">{{ item.points }} 分 / 件</text></button>
        </view>
        <text class="bm-label">数量</text>
        <view class="cheer-quantity">
          <button class="cheer-step" aria-label="减少道具数量" :disabled="decreaseDisabled" :hover-class="decreaseDisabled ? 'none' : 'cheer-step-pressed'" :hover-stay-time="80" @click="stepQuantity(-1)">−</button>
          <view class="cheer-quantity-input"><BmField v-model="quantity" label="道具数量" type="number" maxlength="2" :disabled="quantityLocked" :adjust-position="false" /></view>
          <button class="cheer-step" aria-label="增加道具数量" :disabled="increaseDisabled" :hover-class="increaseDisabled ? 'none' : 'cheer-step-pressed'" :hover-stay-time="80" @click="stepQuantity(1)">＋</button>
        </view>
        <view class="bm-muted">本次消耗 {{ cost }} 分 · 本局还可投入 {{ remaining }} 分</view>
        <view v-if="limitMessage" class="bm-error">{{ limitMessage }}</view>
        <view v-if="quote" class="cheer-quote" aria-live="polite">
          <text class="bm-heading">{{ quote.propName }} × {{ quote.quantity }} · {{ quote.points }} 分</text>
          <view>本笔返还倍数 <text class="cheer-number">{{ (quote.oddsHundredths / 100).toFixed(2) }}</text></view>
          <view>获胜返还 <text class="cheer-number">{{ quote.expectedReturn }}</text> 分（含本金）</view>
          <view class="bm-muted">失败不返还，不再额外扣分。购买后本笔赔率固定。</view>
          <view class="bm-muted">{{ quoteInvalid ? '报价已失效，请重新获取后确认。' : `请在 ${secondsLeft} 秒内确认；他人购买后需要重新报价。` }}</view>
        </view>
        <view class="bm-section">
          <BmButton v-if="!quote || quoteInvalid" :loading="busy" :disabled="busy || !!limitMessage || !points.summary" @click="getQuote">{{ quote ? '重新获取报价' : '查看返还并确认' }}</BmButton>
          <BmButton v-else :loading="busy" :disabled="busy || !!limitMessage" @click="buy">确认支付 {{ quote.points }} 积分</BmButton>
        </view>
      </template>
      <view v-if="feedbackRendered" :style="feedbackStyle" class="bm-error" role="alert">{{ feedbackText }}<BmButton v-if="points.error || !points.summary" small variant="secondary" :disabled="busy || points.loading || !(error || points.error)" @click="loadWallet">重新读取积分</BmButton></view>
      <view class="bm-muted bm-section">历史实力占 60%，助威人数与积分各占 20%。购买报价已计入本次投入；每人每局最多 500 分。道具不影响竞技比分。</view>
    </view>
  </BmSheet>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import { reducedMotion } from "@/composables/useMotion";
import { usePresence } from "@/composables/useMotionState";
import BmSheet from "@/components/badminton/BmSheet.vue";
import BmButton from "@/components/badminton/BmButton.vue";
import BmField from "@/components/badminton/BmField.vue";
import { pendingCheer, pointsApi, prepareCheer, purchaseCheer, type PendingCheer } from "@/api/points";
import { usePointsStore } from "@/store/modules/points";
import { useUserStore } from "@/store/modules/user";
import type { Game } from "@/types/competition";
import type { CheerMarket, CheerQuote, CheerSide } from "@/types/points";
const props = defineProps<{ modelValue: boolean; matchId: string; game: Game | null; market?: CheerMarket; teamA: string; teamB: string }>();
const emit = defineEmits<{ (e: "close"): void; (e: "refresh"): void; (e: "busy", value: boolean): void }>();
const user = useUserStore(), points = usePointsStore();
const side = ref<CheerSide>("A"), propId = ref("stick"), quantity = ref("1"), quote = ref<CheerQuote | null>(null);
const busy = ref(false), error = ref(""), success = ref(""), pending = ref<PendingCheer | null>(null), now = ref(Date.now());
let revision = 0, timer: ReturnType<typeof setInterval> | undefined;
const teams = computed(() => [{ side: "A" as const, name: props.teamA }, { side: "B" as const, name: props.teamB }]);
const selectedProp = computed(() => points.summary?.props.find(item => item.id === propId.value));
const cost = computed(() => /^\d+$/.test(quantity.value) ? Number(quantity.value) * (selectedProp.value?.points || 0) : 0);
const remaining = computed(() => Math.max(0, (points.summary?.perGameLimit ?? 500) - (props.market?.mySupport?.points || 0)));
const quantityNumber = computed(() => /^\d+$/.test(quantity.value) ? Number(quantity.value) : 0);
const maxQuantity = computed(() => {
  const price = selectedProp.value?.points || 0;
  if (!points.summary || price <= 0) return 0;
  return Math.max(0, Math.min(99, Math.floor(Math.min(remaining.value, points.summary.available) / price)));
});
const quantityLocked = computed(() => busy.value || !props.modelValue || !props.market?.open || !!pending.value);
const decreaseDisabled = computed(() => quantityLocked.value || quantityNumber.value <= 1);
const increaseDisabled = computed(() => quantityLocked.value || maxQuantity.value < 1 || quantityNumber.value >= maxQuantity.value);
function stepQuantity(direction: -1 | 1) {
  if (direction === -1 ? decreaseDisabled.value : increaseDisabled.value) return;
  quantity.value = String(Math.max(1, Math.min(Math.max(1, maxQuantity.value), quantityNumber.value + direction)));
}
const limitMessage = computed(() => {
  if (!points.summary) return "";
  if (!/^\d+$/.test(quantity.value) || Number(quantity.value) < 1) return "数量须为正整数";
  if (!selectedProp.value) return "请选择助威道具";
  if (cost.value > remaining.value) return "已达到或超过本局 500 分助威上限";
  if (cost.value > points.summary.available) return "可用积分不足，可以到积分中心签到";
  return "";
});
const samePending = computed(() => pending.value?.matchId === props.matchId && pending.value?.gameId === props.game?.id);
const secondsLeft = computed(() => quote.value ? Math.max(0, Math.ceil((Date.parse(quote.value.expiresAt) - now.value) / 1000)) : 0);
const quoteInvalid = computed(() => !quote.value || !secondsLeft.value || !props.market?.open || quote.value.marketVersion !== props.market.version);
watch(busy, value => emit("busy", value), { flush: "sync" });
watch([side, propId, quantity], () => { quote.value = null; error.value = ""; success.value = ""; }, { flush: "sync" });
watch(() => props.market?.mySupport?.side, value => { if (value) side.value = value; });
const { rendered: successRendered, displayed: displayedSuccess, style: successStyle } = usePresence(() => props.modelValue ? success.value : "", { immediate: () => !props.modelValue });
const { rendered: feedbackRendered, displayed: feedbackText, style: feedbackStyle } = usePresence(() => props.modelValue ? error.value || points.error : "", { immediate: () => !props.modelValue });
function stopClock() { clearInterval(timer); timer = undefined; }
function startClock() { stopClock(); now.value = Date.now(); if (props.modelValue) timer = setInterval(() => { now.value = Date.now(); }, 1000); }
function readPending() { pending.value = user.userInfo?.id ? pendingCheer(user.userInfo.id) : null; }
watch(() => `${props.modelValue}:${props.matchId}:${props.game?.id}:${user.token}`, () => {
  revision++; busy.value = false; quote.value = null; error.value = ""; success.value = "";
  side.value = props.market?.mySupport?.side || "A"; propId.value = "stick"; quantity.value = "1";
  readPending(); startClock(); if (props.modelValue) void loadWallet();
}, { immediate: true });
async function loadWallet() { try { await points.load(); } catch { /* The store exposes the read error and retry action. */ } }
function chooseSide(value: CheerSide) { if (!busy.value) side.value = value; }
function chooseProp(value: string) { if (!busy.value) propId.value = value; }
function openPoints() { if (busy.value) return; emit("close"); uni.navigateTo({ url: "/pages/points/index" }); }
async function getQuote() {
  if (busy.value || !props.game || !props.market?.open || limitMessage.value || pending.value) return;
  const current = revision, session = user.token, gameId = props.game.id;
  busy.value = true; error.value = ""; success.value = ""; quote.value = null;
  try {
    const result = await pointsApi.quote(props.matchId, gameId, { side: side.value, propId: propId.value, quantity: Number(quantity.value) });
    if (current !== revision || session !== user.token) return;
    quote.value = result; now.value = Date.now(); emit("refresh");
  } catch (e: any) { if (current === revision) { error.value = e.message; emit("refresh"); } }
  finally { if (current === revision) busy.value = false; }
}
async function buy() {
  if (busy.value || !quote.value || quoteInvalid.value || !props.game || !user.userInfo || limitMessage.value) return;
  try {
    pending.value = prepareCheer(user.userInfo.id, props.matchId, props.game.id, quote.value);
    await recoverPurchase();
  } catch (e: any) { error.value = e.message || "无法保存订单请求，请稍后重试"; readPending(); }
}
async function recoverPurchase() {
  if (busy.value || !pending.value || pending.value.userId !== user.userInfo?.id) return;
  const intent = pending.value, current = revision, session = user.token;
  busy.value = true; error.value = "";
  try {
    const result = await purchaseCheer(intent);
    if (session !== user.token) return;
    points.accept(result.wallet);
    // Idempotent recovery can return the original wallet before later settlements or corrections.
    void loadWallet();
    if (current !== revision) return;
    quote.value = null; readPending();
    success.value = `已确认 ${result.order.propName} × ${result.order.quantity}，消耗 ${result.order.points} 积分。`;
    emit("refresh");
  } catch (e: any) {
    if (current !== revision || session !== user.token) return;
    readPending(); error.value = pending.value ? `${e.message || "暂时无法确认"}；请继续确认原订单，不要重新购买。` : e.message;
    if (!pending.value) { quote.value = null; void loadWallet(); }
    emit("refresh");
  } finally { if (current === revision) busy.value = false; }
}
onHide(stopClock); onShow(() => { readPending(); startClock(); });
onUnmounted(() => { revision++; stopClock(); });
</script>

<style scoped lang="scss">
@import "@/styles/_tokens.scss";
.cheer-wallet { display: flex; justify-content: space-between; align-items: center; gap: 16rpx; flex-wrap: wrap; padding: 24rpx 0; font-weight: 600; }
.cheer-options { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 16rpx; }
.cheer-choice { display: flex; flex: 1; min-width: 130rpx; flex-direction: column; gap: 8rpx; margin: 0; padding: 20rpx 12rpx; border: 2rpx solid $bm-line; border-radius: $bm-radius; background: $bm-surface; color: $bm-ink; font-size: 26rpx; line-height: 1.5; overflow-wrap: anywhere; transition: border-color $bm-motion-press ease, background-color $bm-motion-press ease, transform $bm-motion-press $bm-ease; }
.cheer-choice::after { border: 0; }
.cheer-choice.selected { border-color: $bm-primary; background: $bm-primary-soft; }
.cheer-choice[disabled] { opacity: .5; }
.cheer-choice.cheer-pressed:not([disabled]) { transform: scale(.98); }
.is-reduced .cheer-choice { transition: none; transform: none; }
.cheer-quantity { display: flex; align-items: center; gap: 12rpx; }
.cheer-quantity-input { flex: 1; min-width: 0; }
.cheer-step { display: flex; flex: 0 0 96rpx; align-items: center; justify-content: center; box-sizing: border-box; width: 96rpx; height: 96rpx; margin: 0; padding: 0; border: 2rpx solid $bm-line; border-radius: $bm-radius; background: $bm-soft; color: $bm-ink; font-size: 40rpx; font-weight: 600; line-height: 1; transition: transform $bm-motion-press $bm-ease, background-color $bm-motion-press ease, opacity $bm-motion-press ease; }
.cheer-step::after { border: 0; }
.cheer-step[disabled] { color: $bm-disabled; opacity: .45; }
.cheer-step.cheer-step-pressed:not([disabled]) { transform: scale(.94); background: $bm-primary-soft; }
.is-reduced .cheer-step { transition: none; transform: none; }
.cheer-notice, .cheer-quote { margin: 20rpx 0; padding: 24rpx; border-radius: $bm-radius; background: $bm-primary-soft; line-height: 1.8; }
.cheer-quote { background: $bm-soft; border-left: 6rpx solid $bm-primary; }
.cheer-number { font-size: 34rpx; font-weight: 700; font-variant-numeric: tabular-nums; }
</style>
