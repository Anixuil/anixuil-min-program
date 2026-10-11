<template><view class="bm-page" :class="{ 'is-reduced': reducedMotion }">
  <view id="messages-background" :style="backgroundStyle" :aria-hidden="backgroundBlocked" :inert="backgroundBlocked ? true : undefined">
  <view class="bm-page-header" :style="sectionStyle(0)"><text class="bm-eyebrow">来自一羽成局</text><text class="bm-title">消息中心</text><text class="bm-muted">球场资讯与重要通知，都在这里。</text></view>
  <BmState v-if="!user.token" title="登录后查看消息" message="登录即可查看公告和发送给你的站内通知。" action="去登录" @action="toLogin" />
  <template v-else>
    <view :style="sectionStyle(1)"><BmState v-if="error" kind="error" title="消息暂未读取" :message="error" action="重新加载" :busy="loading" @action="load(true)" /><BmState v-else-if="loading && !rows.length" kind="loading" /><BmState v-else-if="!loading && !rows.length" title="暂时没有新消息" message="有重要消息时会在这里告诉你。" /></view>
    <view v-for="(item, index) in rows" :key="item.id" :style="sectionStyle(Math.min(index + 2, 8), 'fade')"><button class="message-row" :hover-class="reducedMotion ? 'none' : 'message-pressed'" :disabled="reading" @click="open(item)"><view class="message-meta"><text>{{ item.kind === 'announcement' ? '公告' : '通知' }}{{ item.pinned ? ' · 置顶' : '' }}</text><text v-if="!item.read" class="unread">未读</text><text v-else>已读</text></view><text class="message-title">{{ item.title }}</text><text class="message-summary">{{ item.content }}</text><text class="message-date">{{ formatDate(item.publishedAt) }}</text></button></view>
    <view v-if="rows.length < total" class="bm-section"><BmButton variant="ghost" :loading="loading" :disabled="reading" @click="load(false)">加载更多</BmButton></view>
    <view v-if="info && (info.about || info.supportContact || info.serviceHours)" class="bm-card service-info" :style="sectionStyle(4, 'fade')"><text class="bm-heading">服务说明</text><text v-if="info.about">{{ info.about }}</text><text v-if="info.supportContact">联系渠道：{{ info.supportContact }}</text><text v-if="info.serviceHours">服务时间：{{ info.serviceHours }}</text></view>
    <view v-if="infoError" class="bm-muted service-info"><text>{{ infoError }}</text><BmButton small variant="ghost" @click="loadInfo">重试服务信息</BmButton></view>
  </template>
  </view>
  <BmSheet :model-value="!!selected" :title="selected?.title || '消息详情'" :busy="reading" @close="selected = null"><view v-if="selected" class="message-detail"><text class="bm-muted">{{ formatDate(selected.publishedAt) }}</text><text class="message-content">{{ selected.content }}</text><text v-if="readError" class="bm-error">{{ readError }}</text><BmButton v-if="readError" small variant="ghost" :loading="reading" @click="markRead">重新确认已读</BmButton></view></BmSheet>
</view></template>
<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import { onShow, onPullDownRefresh } from "@dcloudio/uni-app";
import { messagesApi, type InboxMessage, type ServiceInfo } from "@/api/messages";
import { useUserStore } from "@/store/modules/user";
import { usePageMotion } from "@/composables/useMotionState";
import { useSheetBackground } from "@/composables/useSheetBackground";
import { reducedMotion } from "@/composables/useMotion";
import { toLogin } from "@/utils/navigation";
import BmButton from "@/components/badminton/BmButton.vue";
import BmState from "@/components/badminton/BmState.vue";
import BmSheet from "@/components/badminton/BmSheet.vue";
const user = useUserStore(), { sectionStyle } = usePageMotion();
const rows = ref<InboxMessage[]>([]), total = ref(0), page = ref(0), loading = ref(false), reading = ref(false), error = ref(""), readError = ref(""), infoError = ref(""), selected = ref<InboxMessage | null>(null), info = ref<ServiceInfo | null>(null);
const { backgroundStyle, backgroundBlocked } = useSheetBackground(() => !!selected.value, { selector: "#messages-background" });
let revision = 0;
function errorMessage(value: unknown) { return (value as { message?: string })?.message || "请求失败，请重试"; }
function formatDate(value: string) { const date = new Date(value); return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`; }
async function load(reset: boolean) { if (loading.value || !user.token) return; const ticket = revision, session = user.token, next = reset ? 1 : page.value + 1; loading.value = true; error.value = ""; try { const result = await messagesApi.list(next); if (ticket !== revision || session !== user.token) return; rows.value = reset ? result.list : [...rows.value, ...result.list.filter(item => !rows.value.some(row => row.id === item.id))]; page.value = next; total.value = result.total; } catch (e) { if (ticket === revision) error.value = errorMessage(e); } finally { if (ticket === revision) loading.value = false; } }
async function loadInfo() { if (!user.token) return; const ticket = revision; infoError.value = ""; try { const result = await messagesApi.info(); if (ticket === revision) info.value = result; } catch (e) { if (ticket === revision) infoError.value = `服务信息读取失败：${errorMessage(e)}`; } }
async function open(item: InboxMessage) { selected.value = item; readError.value = ""; await markRead(); }
async function markRead() { if (!selected.value || reading.value) return; const id = selected.value.id, ticket = revision; reading.value = true; readError.value = ""; try { await messagesApi.read(id); if (ticket !== revision) return; const row = rows.value.find(item => item.id === id); if (row) row.read = true; if (selected.value?.id === id) selected.value.read = true; } catch (e) { if (ticket === revision) { if ((e as { code?: number })?.code === 404) { selected.value = null; rows.value = rows.value.filter(row => row.id !== id); total.value = Math.max(0, total.value - 1); error.value = errorMessage(e); } else readError.value = errorMessage(e); } } finally { if (ticket === revision) reading.value = false; } }
watch(() => user.token, () => { revision++; rows.value = []; selected.value = null; info.value = null; loading.value = false; reading.value = false; page.value = 0; total.value = 0; error.value = ""; readError.value = ""; infoError.value = ""; }, { flush: "sync" });
onShow(() => { void load(true); void loadInfo(); });
onPullDownRefresh(async () => { try { await Promise.all([load(true), loadInfo()]); } finally { uni.stopPullDownRefresh(); } });
onUnmounted(() => { revision++; });
</script>
<style scoped>
.message-row { width: 100%; text-align: left; background: #fff; padding: 30rpx; margin: 0 0 20rpx; border-radius: 24rpx; border: 1rpx solid #e8ebe2; line-height: 1.6; transition: transform 140ms ease, background 140ms ease; }
.message-row::after { border: none; }
.message-pressed { transform: scale(.985); background: #f8f9f4; }
.message-meta { display: flex; justify-content: space-between; color: #84917d; font-size: 22rpx; }
.message-title { display: block; margin: 16rpx 0; font-size: 32rpx; font-weight: 650; color: #29402f; word-break: break-all; }
.message-summary { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #7d8977; font-size: 26rpx; word-break: break-all; }
.message-date { display: block; margin-top: 20rpx; color: #9ba491; font-size: 22rpx; }
.unread { color: #dc6a34; }
.message-content { display: block; white-space: pre-wrap; word-break: break-all; font-size: 28rpx; line-height: 1.9; padding: 30rpx 0; }
.service-info { display: flex; flex-direction: column; gap: 15rpx; white-space: pre-wrap; word-break: break-all; font-size: 25rpx; color: #809176; margin-top: 32rpx; }
.is-reduced .message-row { transition: none; }
</style>
