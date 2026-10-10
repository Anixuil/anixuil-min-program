<template><view class="bm-page bm-login-page" :class="{ 'is-reduced': reducedMotion }">
  <view :style="pageStyle">
  <view class="bm-auth-header" :style="sectionStyle(0)"><BmBrand compact /><text class="bm-title">准备好，再上场</text><view class="bm-muted">登录，继续你的球局与战绩。</view></view>
  <view class="bm-card bm-auth-form">
    <!-- #ifdef MP-WEIXIN -->
    <view :style="sectionStyle(1)">
    <text class="bm-heading">准备上场</text><view class="bm-muted" style="margin:12rpx 0 28rpx">微信登录即可参与，无需补充邮箱。</view><BmButton :loading="busy && method === 'wechat'" :disabled="busy" @click="wechat">{{ busy && method === 'wechat' ? '微信登录中…' : '微信登录' }}</BmButton><button class="bm-text-button" style="width:100%;margin-top:16rpx" :disabled="busy" :aria-expanded="emailOpen" @click="toggleEmail" :hover-class="busy ? 'none' : 'bm-touch'" :hover-stay-time="80">{{ emailOpen ? '收起邮箱登录 ↑' : '使用邮箱登录 ↓' }}</button>
    </view>
    <!-- #endif -->
    <view v-if="emailRendered" class="bm-reveal" :class="{ 'is-visible': emailVisible }" :style="emailStyle" :aria-hidden="!emailOpen"><view id="login-email-content" style="overflow:hidden"><view :style="sectionStyle(2)"><text class="bm-label">邮箱</text><BmField v-model="email" :invalid="attempted && !email.trim()" label="邮箱" maxlength="191" placeholder="你的邮箱" :disabled="busy || !emailOpen || !emailVisible" /><text class="bm-label">密码</text><BmField v-model="password" :invalid="attempted && password.length < 6" label="密码" password maxlength="72" placeholder="输入原账号密码" :disabled="busy || !emailOpen || !emailVisible" confirm-type="done" @confirm="login" /></view><view style="margin-top:28rpx"><view :style="sectionStyle(3)"><BmButton :loading="busy && method === 'email'" :disabled="busy || !emailOpen || !emailVisible" @click="login">{{ busy && method === 'email' ? '登录中…' : '登录，回到球场' }}</BmButton></view></view></view></view>
    <view v-if="errorRendered" class="bm-error" :style="errorStyle">{{ displayedError }}</view><view class="bm-divider" :style="sectionStyle(3)"><button class="bm-text-button" style="width:100%" :disabled="busy" @click="register" :hover-class="busy ? 'none' : 'bm-touch'" :hover-stay-time="80">还没有邮箱账号？创建一个 →</button></view>
  </view><view :style="sectionStyle(4, 'fade')"><view class="bm-muted" style="text-align:center">登录后会回到你刚才打开的球局</view></view>
  </view>
</view></template>
<script setup lang="ts">
import BmBrand from "@/components/badminton/BmBrand.vue";
import { useReveal } from "@/composables/useReveal";
import { usePageMotion, usePresence } from "@/composables/useMotionState";
import BmField from "@/components/badminton/BmField.vue";
import { ref } from "vue"; import { useUserStore } from "@/store/modules/user"; import { afterLogin } from "@/utils/navigation"; import { reducedMotion } from "@/composables/useMotion"; import BmButton from "@/components/badminton/BmButton.vue";
const attempted = ref(false);
const user = useUserStore(), email = ref(""), password = ref(""), busy = ref(false), error = ref(""), method = ref(""), emailOpen = ref(true);
// #ifdef MP-WEIXIN
emailOpen.value = false;
// #endif
const { pageStyle, sectionStyle } = usePageMotion();
const { rendered: emailRendered, visible: emailVisible, style: emailStyle } = useReveal(() => emailOpen.value, { selector: "#login-email-content" });
const { rendered: errorRendered, displayed: displayedError, style: errorStyle } = usePresence(() => !busy.value ? error.value : "");
function toggleEmail() { if (busy.value) return; if (emailOpen.value) uni.hideKeyboard(); emailOpen.value = !emailOpen.value; }
async function run(kind: string, action: () => Promise<void>) { if (busy.value) return; busy.value = true; method.value = kind; try { await action(); error.value = ""; afterLogin(); } catch (e: any) { error.value = e?.message || "登录失败，请重试"; } finally { busy.value = false; } }
function login() { if (busy.value || !emailOpen.value) return; attempted.value = true; if (!email.value.trim() || password.value.length < 6) { error.value = "请填写邮箱和至少 6 位密码"; return; } run("email", () => user.login({ email: email.value.trim(), password: password.value })); }
function wechat() { run("wechat", () => user.wechat()); }
function register() { if (!busy.value) uni.navigateTo({ url: "/pages/register/index" }); }
</script>

<style scoped lang="scss">
@import "@/styles/_tokens.scss";
.bm-login-page {
  box-sizing: border-box;
  min-height: 100vh;
  background: $bm-page;
}
</style>
