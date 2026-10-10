<template><view class="bm-page" :class="{ 'is-reduced': reducedMotion }">
  <view v-if="noticeRendered" class="bm-working" :style="noticeStyle">{{ displayedNotice }}</view>
  <view id="profile-background" :style="backgroundStyle" :aria-hidden="backgroundBlocked" :inert="backgroundBlocked ? true : undefined">
  <view class="bm-page-header" :style="sectionStyle(0)"><BmBrand compact /><text class="bm-title">我的羽球</text></view>
  <view v-if="!user.token" :style="sectionStyle(1)"><BmState title="记住每一场好球" message="登录后查看真实的比赛战绩。" action="登录 / 注册" @action="toLogin" /></view>
  <template v-else>
    <view class="bm-card bm-profile-identity" :style="sectionStyle(1)"><view class="bm-row"><view class="bm-avatar large">{{ user.userInfo?.nickname?.slice(0, 1) || '羽' }}</view><view class="bm-grow"><text class="bm-heading">{{ user.userInfo?.nickname || '球友' }}</text><view class="bm-muted">{{ user.userInfo?.email || '微信球友' }}</view></view><button class="bm-text-button" :disabled="busy || loading" @click="edit" :hover-class="busy || loading ? 'none' : 'bm-touch'" :hover-stay-time="80">编辑</button></view></view>
    <view v-if="errorRendered" :style="errorStyle"><view :style="sectionStyle(2, 'fade')"><BmState kind="error" title="暂时无法读取" :message="displayedError" action="重新加载" :disabled="!error || editing" :busy="loading" @action="error && !editing && load()" /></view></view>
    <view id="profile-loading-region" :style="containerStyle">
      <view v-if="loadingRendered" :style="loadingStyle"><view :style="sectionStyle(2, 'fade')"><BmState kind="loading" /></view></view>
      <view v-if="stats" :style="contentStyle"><view class="bm-hero dark bm-profile-stats" :style="sectionStyle(2)"><view class="bm-hero-content"><text class="bm-eyebrow">每一分，都算数</text><text class="bm-hero-title">{{ (stats.winRate * 100).toFixed(1) }}<text style="font-size:32rpx"> %</text></text><view class="bm-muted">已完成对局胜率 · {{ stats.wins }} 胜 {{ stats.losses }} 负</view></view></view><view :style="sectionStyle(3)"><view class="bm-grid"><view v-for="item in numbers" :key="item.label" class="bm-metric"><text class="bm-number">{{ item.value }}</text><text class="bm-muted">{{ item.label }}</text></view></view><view class="bm-muted" style="margin:24rpx 0">只统计已完成的对局，比分纠正后战绩同步更新。</view></view></view>
    </view>
    <view :style="sectionStyle(4)"><PointsCard compact /></view>
  </template>
  <view class="bm-card bm-settings" :style="sectionStyle(user.token ? 5 : 2)"><view class="bm-row bm-between"><view class="bm-grow"><text class="bm-heading">减少动态效果</text><view class="bm-muted">保留反馈，减少位移和弹性</view></view><switch :checked="preference" color="#e96b35" @change="setReducedMotion($event.detail.value)" /></view><view v-if="reducedMotion && !preference" class="bm-muted">当前跟随系统减少动态效果设置。</view></view>
  <view v-if="user.token" :style="sectionStyle(6, 'fade')"><BmButton variant="ghost" :loading="busy && !editing" :disabled="busy || loading" @click="logout">退出登录</BmButton></view>
  </view>
  <BmSheet :model-value="editing" title="球场上的名字" :busy="busy" :covered="!!confirmation" @close="closeEdit"><text class="bm-label">昵称</text><BmField v-model="nickname" label="昵称" maxlength="80" :disabled="busy || savedNickname || !editing" /><view v-if="editErrorRendered" class="bm-error" :style="editErrorStyle">{{ displayedEditError }}</view><view class="bm-section"><BmButton :loading="busy" :disabled="!nickname.trim() || !editing" @click="save">{{ savedNickname ? '重新刷新资料' : '保存昵称' }}</BmButton></view></BmSheet>
  <BmConfirm :message="confirmation" @answer="answer" />
  <BmTabBar active="profile" :hidden="backgroundBlocked" />
</view></template>
<script setup lang="ts">
import BmTabBar from "@/components/badminton/BmTabBar.vue";
import BmBrand from "@/components/badminton/BmBrand.vue";
import BmField from "@/components/badminton/BmField.vue";
import PointsCard from "@/components/badminton/PointsCard.vue";
import { usePointsStore } from "@/store/modules/points";
const points = usePointsStore();
import { computed, onUnmounted, ref, watch } from "vue"; import { onHide, onShow } from "@dcloudio/uni-app";
import { useLoadingMotion, usePageMotion, usePresence } from "@/composables/useMotionState";
import { useSheetBackground } from "@/composables/useSheetBackground";
import { api } from "@/api/competition"; import { useUserStore } from "@/store/modules/user"; import { toLogin } from "@/utils/navigation"; import { useMotion } from "@/composables/useMotion"; import { useConfirm } from "@/composables/useConfirm"; import type { PersonalStats } from "@/types/competition";
import BmButton from "@/components/badminton/BmButton.vue"; import BmSheet from "@/components/badminton/BmSheet.vue"; import BmState from "@/components/badminton/BmState.vue"; import BmConfirm from "@/components/badminton/BmConfirm.vue";
const user = useUserStore(), { reducedMotion, preference, setReducedMotion } = useMotion(), { confirmation, ask, answer } = useConfirm();
const nickname = ref(""), busy = ref(false), loading = ref(false), error = ref(""), editing = ref(false), notice = ref(""), stats = ref<PersonalStats | null>(null), savedNickname = ref(false); let timer: ReturnType<typeof setTimeout> | undefined, revision = 0, lastSession = "";
const { sectionStyle } = usePageMotion();
const { backgroundStyle, backgroundBlocked } = useSheetBackground(() => editing.value || !!confirmation.value, { selector: "#profile-background" });
const { loadingRendered, loadingStyle, contentStyle, containerStyle } = useLoadingMotion(() => loading.value && !stats.value, () => Boolean(stats.value), { get selector() { return backgroundBlocked.value ? undefined : "#profile-loading-region"; } });
const { rendered: noticeRendered, displayed: displayedNotice, style: noticeStyle } = usePresence(() => user.token ? notice.value : "", { immediate: () => !user.token });
const { rendered: errorRendered, displayed: displayedError, style: errorStyle } = usePresence(() => user.token && !editing.value ? error.value : "", { immediate: () => !user.token || editing.value });
const { rendered: editErrorRendered, displayed: displayedEditError, style: editErrorStyle } = usePresence(() => editing.value ? error.value : "", { immediate: () => !user.token || !editing.value });
watch(() => user.token, () => { revision++; stats.value = null; error.value = ""; notice.value = ""; editing.value = false; loading.value = false; clearTimeout(timer); }, { flush: "sync" });
const numbers = computed(() => stats.value ? [{ label: "参与球局", value: stats.value.matchCount }, { label: "完成对局", value: stats.value.gameCount }, { label: "总得分", value: stats.value.pointsFor }, { label: "净胜分", value: stats.value.pointsFor - stats.value.pointsAgainst }] : []);
async function load() { if (busy.value || editing.value) return; const current = ++revision, session = user.token; if (session !== lastSession) { stats.value = null; lastSession = session; } if (!session) { stats.value = null; return; } loading.value = true; error.value = ""; try { await user.restore(); const result = await api.personal(); if (current === revision && session === user.token) stats.value = result; } catch (e: any) { if (current === revision) error.value = e.message; } finally { if (current === revision) loading.value = false; } }
function edit() { if (busy.value || loading.value) return; nickname.value = user.userInfo?.nickname || ""; savedNickname.value = false; error.value = ""; editing.value = true; }
async function closeEdit() { if (busy.value) return; if (!savedNickname.value && nickname.value !== user.userInfo?.nickname && !await ask("放弃尚未保存的昵称？")) return; uni.hideKeyboard(); editing.value = false; }
async function save() { if (busy.value || !nickname.value.trim()) return; busy.value = true; error.value = ""; try { if (!savedNickname.value) { await api.profile(nickname.value.trim()); savedNickname.value = true; } await user.restore(); editing.value = false; notice.value = "昵称已更新"; clearTimeout(timer); timer = setTimeout(() => { notice.value = ""; }, 1800); } catch (e: any) { error.value = savedNickname.value ? "昵称已保存，但刷新失败，请重试刷新" : e.message; } finally { busy.value = false; } }
async function logout() { if (busy.value || !await ask("确定退出登录？下次仍可查看你的历史球局。")) return; busy.value = true; try { await user.logout(); stats.value = null; } catch (e: any) { error.value = e.message; } finally { busy.value = false; } }
onShow(() => { void load(); void points.load().catch(() => {}); }); onHide(() => { clearTimeout(timer); notice.value = ""; }); onUnmounted(() => { revision++; clearTimeout(timer); });
</script>


