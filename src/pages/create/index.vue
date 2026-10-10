<template>
  <view class="bm-page has-dock" :class="{ 'is-reduced': reducedMotion }">
    <view v-if="progressRendered" class="bm-working" :style="progressStyle" role="status" :aria-busy="busy">{{ displayedProgress }}</view>
    <view :style="pageStyle">
      <view class="bm-page-header" :style="sectionStyle(0)"><text class="bm-eyebrow">CREATE / 发起球局</text><text class="bm-title">下一场，你来发起</text><view class="bm-muted">定好时间，选好赛制，叫上球友。</view></view>
      <view v-show="!createdId && !needsConfirmation"><MatchForm :key="formKey" :busy="busy" @submit="save" @dirty="setDirty" /></view>
      <view v-if="outcomeRendered" class="bm-card" :style="outcomeStyle" role="status">
        <view :style="sectionStyle(1)">
        <text class="bm-heading">{{ displayedOutcome === 'created' ? '球局已创建' : '创建结果待确认' }}</text>
        <view class="bm-muted">{{ displayedOutcome === 'created' ? '名单和配置已保存，可以进入球局继续排赛。' : '服务尚未确认结果，球局可能已经创建。请重试确认，本次将沿用原名单和请求。' }}</view>
        </view>
        <view class="bm-section" :style="sectionStyle(2)">
          <BmButton v-if="displayedOutcome === 'created'" :loading="busy" :disabled="!createdId" @click="openCreated">{{ busy ? '正在打开球局' : '打开球局' }}</BmButton>
          <BmButton v-else :loading="busy" :disabled="!needsConfirmation" @click="retryCreate">{{ busy ? '正在确认创建结果' : '重试确认' }}</BmButton>
        </view>
      </view>
      <view v-if="errorRendered" class="bm-error" :style="errorStyle">{{ displayedError }}</view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import { onLoad, onShow, onHide, onUnload, onBackPress } from "@dcloudio/uni-app";
import MatchForm from "@/components/badminton/MatchForm.vue";
import BmButton from "@/components/badminton/BmButton.vue";
import { api } from "@/api/competition";
import { useUserStore } from "@/store/modules/user";
import { reducedMotion } from "@/composables/useMotion";
import { usePageMotion, usePresence } from "@/composables/useMotionState";
import { toLogin } from "@/utils/navigation";
import type { MatchInput } from "@/types/competition";
type CreateInput = MatchInput & { players: string[] };
const user = useUserStore();
const busy = ref(false), error = ref(""), dirty = ref(false), createdId = ref(""), needsConfirmation = ref(false), formKey = ref(0);
let leaving = false, alive = true, pageVisible = true, operation = 0, pendingInput: CreateInput | null = null;
const { pageStyle, sectionStyle } = usePageMotion();
const { rendered: errorRendered, displayed: displayedError, style: errorStyle } = usePresence(() => error.value);
const { rendered: progressRendered, displayed: displayedProgress, style: progressStyle } = usePresence(() => busy.value ? createdId.value ? "球局已创建，正在打开…" : needsConfirmation.value ? "正在确认创建结果…" : "正在创建球局，请稍候…" : "");
const { rendered: outcomeRendered, displayed: displayedOutcome, style: outcomeStyle } = usePresence(() => createdId.value ? "created" : needsConfirmation.value ? "uncertain" : "", { immediate: () => !user.token });
declare const wx: { enableAlertBeforeUnload(options: { message: string }): void; disableAlertBeforeUnload(): void };
function setDirty(value: boolean) { if (!createdId.value && !needsConfirmation.value) dirty.value = value; }
watch([dirty, busy, needsConfirmation, createdId], ([changed, working, uncertain, created]) => {
  // #ifdef MP-WEIXIN
  if (!created && (changed || working || uncertain)) wx.enableAlertBeforeUnload({ message: working || uncertain ? "创建结果尚未确认，离开后请先到球局列表确认结果。" : "球局尚未创建，离开会丢失已填写内容。" }); else wx.disableAlertBeforeUnload();
  // #endif
}, { flush: "sync" });
watch(() => user.token, () => {
  operation++; busy.value = false; createdId.value = ""; needsConfirmation.value = false;
  pendingInput = null; error.value = ""; dirty.value = false; leaving = false; formKey.value++;
}, { flush: "sync" });
onShow(() => { pageVisible = true; if (createdId.value && !busy.value && !error.value) void openCreated(); });
onHide(() => { pageVisible = false; });
onUnload(() => {
  alive = false; pageVisible = false; operation++;
  // #ifdef MP-WEIXIN
  wx.disableAlertBeforeUnload();
  // #endif
});
onBackPress(() => {
  // #ifdef H5
  if (busy.value && !leaving) { uni.showToast({ title: "正在确认创建结果，请稍候", icon: "none" }); return true; }
  if (dirty.value && !leaving) { uni.showModal({ title: "离开建赛？", content: needsConfirmation.value ? "创建结果尚未确认，离开后请先到球局列表确认结果。" : "已填写的内容尚未保存。", success: result => { if (result.confirm && !busy.value) { leaving = true; uni.navigateBack(); } } }); return true; }
  // #endif
  return false;
});
onLoad(() => { if (!user.token) toLogin(); });
function current(ticket: number, session: string) { return alive && ticket === operation && session === user.token; }
function showOutcome() { if (pageVisible) uni.pageScrollTo({ scrollTop: 0, duration: 0 }); }
function save(input: MatchInput & { players?: string[] }) {
  if (!alive || busy.value || createdId.value || pendingInput || needsConfirmation.value) return;
  if (!user.token) { toLogin(); return; }
  pendingInput = { ...input, players: [...(input.players || [])] };
  void submitPending();
}
function retryCreate() { if (needsConfirmation.value) void submitPending(); }
async function submitPending() {
  if (!alive || busy.value || createdId.value || !pendingInput || !user.token) return;
  const ticket = ++operation, session = user.token, input = pendingInput;
  busy.value = true; error.value = ""; uni.hideKeyboard();
  let result: Awaited<ReturnType<typeof api.create>>;
  try {
    result = await api.create(input);
    if (!result?.id) throw new Error("创建返回的信息不完整，请重试确认结果");
  } catch (cause: any) {
    if (!current(ticket, session)) return;
    const code = Number(cause?.code);
    // A timeout, server error or concurrent conflict may follow a committed write.
    needsConfirmation.value = !(code >= 400 && code < 500 && code !== 409);
    if (!needsConfirmation.value) pendingInput = null;
    error.value = cause?.message || "创建结果暂未确认，请重试";
    busy.value = false;
    if (needsConfirmation.value) showOutcome();
    return;
  }
  if (!current(ticket, session)) return;
  createdId.value = result.id; pendingInput = null; needsConfirmation.value = false; dirty.value = false;
  showOutcome();
  // Keep the request lock through navigation. A navigation failure must not create again.
  if (pageVisible) await redirectCreated(ticket, session);
  else busy.value = false;
}
async function openCreated() {
  if (!alive || !pageVisible || busy.value || !createdId.value || !user.token) return;
  const ticket = ++operation, session = user.token;
  busy.value = true; error.value = "";
  await redirectCreated(ticket, session);
}
async function redirectCreated(ticket: number, session: string) {
  leaving = true;
  try {
    await new Promise<void>((resolve, reject) => uni.redirectTo({ url: `/pages/matchDetails/index?id=${encodeURIComponent(createdId.value)}`, success: () => resolve(), fail: reject }));
    // Success leaves this page; do not reopen the submit button before it unloads.
  } catch {
    if (!current(ticket, session)) return;
    busy.value = false; leaving = false;
    error.value = "球局已创建，但页面未能打开。请点击“打开球局”重试。";
  }
}
</script>

