<template>
  <div class="login-screen">
    <section class="login-story" aria-label="一羽成局">
      <Brand />
      <div class="login-story-copy">
        <span class="eyebrow">A GOOD GAME STARTS HERE</span>
        <h1>聚好球友，<br /><span>打好每一场。</span></h1>
        <p>从一片羽毛，到一场好球。<br />让每一次相聚，都有序发生。</p>
      </div>
      <ShuttlecockScene />
      <div class="login-story-footer"><span class="status-dot" /> 为热爱而聚 · 一羽成局</div>
    </section>
    <main class="login-main">
      <div class="login-form">
        <span class="login-kicker"><span /> YOUR COURT, IN ORDER</span>
        <h2>{{ restoring ? '正在回到工作台' : '欢迎回到球场' }}</h2>
        <p class="muted">{{ restoring ? '正在恢复会话并确认管理权限。' : '登录一羽成局，开启今天的运营工作。' }}</p>
        <div v-if="restoring" class="login-restoring" role="status" aria-label="正在恢复会话" aria-busy="true"><ElSkeleton :rows="4" animated /></div>
        <ElForm v-else ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @submit.prevent="submit">
          <ElFormItem label="邮箱账号" prop="email">
            <ElInput v-model="form.email" type="email" name="email" autocomplete="username" placeholder="请输入已授权的邮箱" :prefix-icon="Message" :disabled="busy" @blur="form.email = form.email.trim()" />
          </ElFormItem>
          <ElFormItem label="登录密码" prop="password">
            <ElInput v-model="form.password" type="password" name="password" autocomplete="current-password" placeholder="请输入密码" show-password :prefix-icon="Lock" :disabled="busy" />
          </ElFormItem>
          <ElAlert v-if="error" :title="error" type="error" show-icon :closable="false" class="login-error" />
          <ElButton class="login-submit" native-type="submit" type="primary" size="large" :loading="busy" :disabled="busy">
            {{ busy ? '正在验证权限' : '进入工作台' }}<ElIcon v-if="!busy"><Right /></ElIcon>
          </ElButton>
        </ElForm>
        <div class="login-note"><ElIcon><Key /></ElIcon><span>使用已获管理授权的账号。<br />需要开通权限，请联系超级管理员。</span></div>
      </div>
      <footer class="login-footer">一羽成局 · 运营管理 <span>专注每一场好球</span></footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElAlert, ElButton, ElForm, ElFormItem, ElIcon, ElInput, ElSkeleton, type FormInstance, type FormRules } from "element-plus";
import { Key, Lock, Message, Right } from "@element-plus/icons-vue";
import Brand from "./Brand.vue";
import ShuttlecockScene from "./ShuttlecockScene.vue";

const props = defineProps<{ busy: boolean; restoring: boolean; error: string }>();
const emit = defineEmits<{ (event: "login", credentials: { email: string; password: string }): void }>();
const formRef = ref<FormInstance>();
const form = reactive({ email: "", password: "" });
const rules: FormRules = {
  email: [{ required: true, message: "请输入邮箱账号", trigger: "blur" }, { type: "email", message: "请输入有效的邮箱地址", trigger: "blur" }],
  password: [{ required: true, message: "请输入登录密码", trigger: "blur" }],
};
let validating = false;
async function submit() {
  if (props.busy || validating) return;
  validating = true;
  try {
    form.email = form.email.trim();
    if (!await formRef.value?.validate().catch(() => false) || props.busy) return;
    emit("login", { ...form });
    form.password = "";
  } finally { validating = false; }
}
</script>

