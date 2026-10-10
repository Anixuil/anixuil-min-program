<template><view class="bm-page" :class="{ 'is-reduced': reducedMotion }"><view :style="pageStyle"><view class="bm-auth-header" :style="sectionStyle(0)"><text class="bm-eyebrow">羽你同场 / JOIN THE COURT</text><text class="bm-title">从这里，开始上场</text><view class="bm-muted">用一个昵称，开始你的羽球记录。</view></view><view class="bm-card bm-auth-form">
  <view :style="sectionStyle(1)"><text class="bm-label">球友怎么称呼你</text><BmField v-model="nickname" :invalid="attempted && !nickname.trim()" label="昵称" maxlength="80" placeholder="昵称" :disabled="busy" /></view>
  <view :style="sectionStyle(2)">
  <text class="bm-label">邮箱</text><BmField v-model="email" :invalid="attempted && !email.trim()" label="邮箱" maxlength="191" placeholder="你的邮箱" :disabled="busy" />
  <text class="bm-label">密码</text><BmField v-model="password" :invalid="attempted && password.length < 8" label="密码" password maxlength="72" placeholder="8–72 位密码" :disabled="busy" confirm-type="done" @confirm="save" />
  </view>
  <view v-if="errorRendered" class="bm-error" :style="errorStyle">{{ displayedError }}</view><view class="bm-section" :style="sectionStyle(3)"><BmButton :loading="busy" @click="save">创建账号，开始上场</BmButton></view>
</view></view></view></template>
<script setup lang="ts">
import BmField from "@/components/badminton/BmField.vue";
import { usePageMotion, usePresence } from "@/composables/useMotionState";
import { ref } from "vue"; import { useUserStore } from "@/store/modules/user"; import { afterLogin } from "@/utils/navigation"; import { reducedMotion } from "@/composables/useMotion"; import BmButton from "@/components/badminton/BmButton.vue";
const attempted = ref(false);
const user = useUserStore(), nickname = ref(""), email = ref(""), password = ref(""), error = ref(""), busy = ref(false);
const { pageStyle, sectionStyle } = usePageMotion();
const { rendered: errorRendered, displayed: displayedError, style: errorStyle } = usePresence(() => error.value);
async function save() { if (busy.value) return; attempted.value = true; if (!nickname.value.trim() || !email.value.trim() || password.value.length < 8) { error.value = "请填写昵称、邮箱及至少 8 位密码"; return; } busy.value = true; error.value = ""; try { await user.register({ nickname: nickname.value.trim(), email: email.value.trim(), password: password.value }); afterLogin(); } catch (e: any) { error.value = e.message; } finally { busy.value = false; } }
</script>
