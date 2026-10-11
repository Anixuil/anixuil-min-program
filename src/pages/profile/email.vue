<template>
  <view class="bm-page" :class="{ 'is-reduced': reducedMotion }">
    <view :style="pageStyle">
      <view class="bm-page-header" :style="sectionStyle(0)"><BmBrand compact /><text class="bm-title">邮箱与密码</text><view class="bm-muted">绑定邮箱，管理当前账号的登录密码。</view></view>
      <BmState v-if="loading" kind="loading" />
      <BmState v-else-if="loadError" kind="error" title="暂时无法读取账号" :message="loadError" action="重新加载" @action="load" />
      <BmState v-else-if="!user.token" title="请先登录微信账号" message="绑定会保留当前账号的比赛、积分和角色。" action="前往登录" @action="toLogin" />
      <template v-else-if="account">
        <view v-if="enabled" class="bm-card" :style="sectionStyle(1)">
          <text class="bm-heading">登录邮箱</text><view class="email-address">{{ account.email }}</view>
          <view class="bm-muted">该邮箱可用于登录。{{ account.wechatBound ? '微信登录继续可用。' : '' }}</view>
          <view class="password-section"><text class="bm-heading">修改登录密码</text>
            <text class="bm-label">当前密码</text><BmField v-model="currentPassword" label="当前密码" password maxlength="72" placeholder="输入当前登录密码" :disabled="busy" />
            <text class="bm-label">新密码</text><BmField v-model="password" label="新密码" password maxlength="72" placeholder="8–72 位，建议包含字母和数字" :disabled="busy" />
            <text class="bm-label">确认新密码</text><BmField v-model="confirmation" label="确认新密码" password maxlength="72" placeholder="再次输入新密码" :disabled="busy" @confirm="changePassword" />
            <view v-if="errorRendered" class="bm-error" :style="errorStyle">{{ displayedError }}</view>
            <view v-if="notice" class="email-notice" role="status">{{ notice }}</view>
            <view class="bm-section"><BmButton :loading="busy" :disabled="busy" @click="changePassword">保存新密码</BmButton></view>
          </view>
          <BmButton variant="ghost" :disabled="busy" @click="back">返回我的</BmButton>
        </view>
        <view v-else-if="account.wechatBound" class="bm-card" :style="sectionStyle(1)">
          <text class="bm-heading">绑定邮箱，设置密码</text><view class="bm-muted">请使用你能收取邮件的邮箱。已属于其他账号的邮箱不能直接绑定。</view>
          <text class="bm-label">邮箱</text><BmField v-model="email" label="邮箱" maxlength="191" placeholder="例如 name@example.com" :disabled="busy || sending" />
          <view class="bm-section"><BmButton variant="ghost" :loading="sending" :disabled="busy || sending || remaining > 0 || !validEmail" @click="sendCode">{{ remaining > 0 ? `${remaining} 秒后重新发送` : '获取邮箱验证码' }}</BmButton></view>
          <view v-if="notice" class="email-notice" role="status">{{ notice }}</view>
          <text class="bm-label">邮箱验证码</text><BmField v-model="code" label="邮箱验证码" type="number" maxlength="6" placeholder="6 位验证码，10 分钟内有效" :disabled="busy" />
          <text class="bm-label">登录密码</text><BmField v-model="password" label="登录密码" password maxlength="72" placeholder="8–72 位，建议包含字母和数字" :disabled="busy" />
          <text class="bm-label">再次输入密码</text><BmField v-model="confirmation" label="确认密码" password maxlength="72" placeholder="再次输入登录密码" :disabled="busy" @confirm="save" />
          <view v-if="errorRendered" class="bm-error" :style="errorStyle">{{ displayedError }}</view>
          <view class="bm-section"><BmButton :loading="busy" :disabled="busy || sending" @click="save">验证并开通邮箱登录</BmButton></view>
          <view class="bm-muted">绑定后用户 ID 不变，不会创建新账号或自动获得管理员权限。</view>
        </view>
        <BmState v-else title="暂不支持此账号开通" message="此入口用于给微信账号绑定邮箱，请使用原登录方式或联系管理员。" />
        <view class="bm-card email-account" :style="sectionStyle(2)"><text class="bm-label">当前用户 ID</text><text class="email-id" selectable>{{ account.id }}</text><BmButton variant="ghost" :disabled="busy" @click="copyId">复制用户 ID</BmButton></view>
      </template>
    </view>
  </view>
</template>
<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import { emailAccount } from "@/api/account";
import { useUserStore } from "@/store/modules/user";
import type { Account } from "@/types/competition";
import { toLogin } from "@/utils/navigation";
import { reducedMotion } from "@/composables/useMotion";
import { usePageMotion, usePresence } from "@/composables/useMotionState";
import BmBrand from "@/components/badminton/BmBrand.vue";
import BmField from "@/components/badminton/BmField.vue";
import BmButton from "@/components/badminton/BmButton.vue";
import BmState from "@/components/badminton/BmState.vue";
const user = useUserStore(), account = ref<Account | null>(null), email = ref(""), code = ref(""), password = ref(""), confirmation = ref("");
const currentPassword = ref("");
const busy = ref(false), sending = ref(false), loading = ref(false), error = ref(""), loadError = ref(""), notice = ref(""), remaining = ref(0);
const enabled = computed(() => account.value?.emailLoginEnabled ?? !!account.value?.email);
const validEmail = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
const { pageStyle, sectionStyle } = usePageMotion();
const { rendered: errorRendered, displayed: displayedError, style: errorStyle } = usePresence(() => error.value);
let revision = 0, deadline = 0, visible = false, timer: ReturnType<typeof setInterval> | undefined;
function message(value: unknown) { return value && typeof value === "object" && "message" in value ? String(value.message) : "请求失败，请重试"; }
function resetCredentials() { currentPassword.value = ""; password.value = ""; confirmation.value = ""; code.value = ""; }
function tick() { remaining.value = Math.max(0, Math.ceil((deadline - Date.now()) / 1000)); if (!remaining.value) { clearInterval(timer); timer = undefined; } }
function startTimer() { clearInterval(timer); tick(); if (visible && remaining.value) timer = setInterval(tick, 1000); }
watch(() => user.token, () => { revision++; account.value = null; resetCredentials(); email.value = ""; error.value = ""; notice.value = ""; loading.value = false; busy.value = false; sending.value = false; deadline = 0; clearInterval(timer); remaining.value = 0; });
watch(email, () => { code.value = ""; notice.value = ""; });
async function load() {
  if (busy.value || sending.value || loading.value || !user.token) return;
  const ticket = ++revision, session = user.token; loading.value = true; loadError.value = "";
  try { const result = await user.restore(); if (ticket === revision && session === user.token) account.value = result; }
  catch (e) { if (ticket === revision) loadError.value = message(e); }
  finally { if (ticket === revision) loading.value = false; }
}
async function sendCode() {
  if (busy.value || sending.value || remaining.value || !validEmail.value) return;
  const ticket = revision, session = user.token; sending.value = true; error.value = ""; notice.value = "";
  // Start the local cooldown even if delivery is uncertain; the server owns the real limit.
  deadline = Date.now() + 60000; startTimer();
  try { const result = await emailAccount.sendCode(email.value.trim().toLowerCase()); if (ticket !== revision || session !== user.token) return; deadline = Date.now() + result.retryAfter * 1000; startTimer(); notice.value = "验证码已发送，请检查收件箱或垃圾邮件。"; }
  catch (e) { if (ticket === revision && session === user.token) error.value = message(e); }
  finally { if (ticket === revision) sending.value = false; }
}
async function save() {
  if (busy.value || sending.value || !user.token || enabled.value) return;
  error.value = "";
  if (!validEmail.value || !/^\d{6}$/.test(code.value) || password.value.length < 8 || password.value.length > 72) { error.value = "请填写有效邮箱、6 位验证码及 8–72 位密码"; return; }
  if (password.value !== confirmation.value) { error.value = "两次输入的密码不一致"; return; }
  const ticket = revision, session = user.token; busy.value = true; uni.hideKeyboard();
  try {
    const result = await emailAccount.bind({ email: email.value.trim().toLowerCase(), code: code.value, password: password.value });
    if (ticket !== revision || session !== user.token) return;
    account.value = result; user.userInfo = result; resetCredentials(); notice.value = "邮箱已绑定，登录密码已设置。"; clearInterval(timer);
  } catch (e) { if (ticket === revision && session === user.token) error.value = message(e); }
  finally { if (ticket === revision) busy.value = false; }
}
async function changePassword() {
  if (busy.value || !user.token || !enabled.value) return;
  error.value = ""; notice.value = "";
  if (!currentPassword.value || password.value.length < 8 || password.value.length > 72) { error.value = "请填写当前密码及 8–72 位新密码"; return; }
  if (password.value !== confirmation.value) { error.value = "两次输入的新密码不一致"; return; }
  if (password.value === currentPassword.value) { error.value = "新密码不能与当前密码相同"; return; }
  const ticket = revision, session = user.token; busy.value = true; uni.hideKeyboard();
  try {
    const result = await emailAccount.changePassword({ currentPassword: currentPassword.value, password: password.value });
    if (ticket !== revision || session !== user.token) return;
    account.value = result; user.userInfo = result; resetCredentials(); notice.value = "密码已修改，下次登录请使用新密码。";
  } catch (e) { if (ticket === revision && session === user.token) error.value = message(e); }
  finally { if (ticket === revision) busy.value = false; }
}
function back() { uni.switchTab({ url: "/pages/profile/index" }); }
function copyId() { if (account.value) uni.setClipboardData({ data: account.value.id }); }
onShow(() => { visible = true; startTimer(); void load(); });
onHide(() => { visible = false; clearInterval(timer); currentPassword.value = ""; password.value = ""; confirmation.value = ""; });
onUnmounted(() => { visible = false; revision++; clearInterval(timer); resetCredentials(); });
</script>
<style scoped lang="scss">
.email-address { margin: 24rpx 0; font-size: 34rpx; font-weight: 600; word-break: break-all; }
.password-section { margin: 32rpx 0; padding-top: 32rpx; border-top: 1rpx solid #dce3dd; }
.email-notice { margin: 20rpx 0; color: #326947; font-size: 26rpx; line-height: 1.6; }
.email-account { margin-top: 24rpx; }
.email-id { display: block; margin-bottom: 24rpx; color: #65716a; font-size: 24rpx; word-break: break-all; }
</style>
