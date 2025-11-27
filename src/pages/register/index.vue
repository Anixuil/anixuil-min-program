<!--
 * @Author: Anixuil
 * @Date: 2025-11-27 19:00:00
 * @Description: 用户注册页面
-->
<template>
  <!-- 全局加载与通知组件 -->
  <loadingStatus ref="loadingStatusRef"></loadingStatus>
  <up-notify ref="notifyRef"></up-notify>

  <view class="register-container">
    <view class="register-card">
      <view class="card-top-bar"></view>

      <view class="card-content">
        <!-- 标题区 -->
        <view class="title-section">
          <text class="app-title">创建你的羽球对决账号</text>
          <text class="app-subtitle">填写基础信息，立即开始</text>
        </view>

        <!-- 注册表单 -->
        <view class="register-form">
          <!-- 使用 uview-plus 的表单与验证规则 -->
          <up-form
            :model="form"
            :rules="rules"
            ref="formRef"
            label-position="top"
            label-width="100rpx"
            :labelStyle="{ color: '#FF6B35' }">
            <up-form-item label="用户名" prop="userName">
              <up-input color="#000" placeholder="请输入用户名" v-model="form.userName" />
            </up-form-item>
            <up-form-item label="邮箱" prop="userEmail">
              <up-input color="#000" placeholder="请输入邮箱" v-model="form.userEmail" />
            </up-form-item>
            <up-form-item label="密码" prop="userPassword">
              <up-input type="password" color="#000" placeholder="请输入密码" v-model="form.userPassword" />
            </up-form-item>
          </up-form>

          <view class="register-btn-wrapper">
            <!-- 注册按钮：触发提交逻辑 -->
            <up-button class="register-btn" @click="handleSubmit" :customStyle="{ 'border-radius': '16rpx' }">
              <text class="btn-text">{{ isLoading ? "注册中..." : "注册" }}</text>
            </up-button>
            <!-- 返回登录入口 -->
            <up-button @click="goLogin" :customStyle="{ 'border-radius': '16rpx', border: '2rpx solid #e0e0e0' }">
              <text class="btn-text">返回登录</text>
            </up-button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import UserAPI from "@/api/user";

// 表单与状态
const form = ref({
  userName: "",
  userEmail: "",
  userPassword: "",
});

// 表单校验规则（关键节点：保证输入合法）
const rules = ref({
  userName: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  userEmail: [
    { required: true, message: "请输入邮箱", trigger: "blur" },
    {
      validator: (rule: any, value: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
      message: "邮箱格式不正确",
      trigger: "blur",
    },
  ],
  userPassword: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      validator: (rule: any, value: string) => value && value.length >= 6,
      message: "密码长度至少 6 位",
      trigger: "blur",
    },
  ],
});

const isLoading = ref(false);
const loadingStatusRef = ref();
const notifyRef = ref();
const formRef = ref();

// 提交注册（关键节点：调用后端注册接口）
const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate();
    if (!valid) {
      notifyRef.value.show({ message: "请检查并填写正确的注册信息", type: "warning" });
      return;
    }

    isLoading.value = true;
    loadingStatusRef.value.showToast({ type: "loading", message: "小羽打包中...", duration: -1 });

    const payload = {
      userName: form.value.userName,
      userPassword: form.value.userPassword,
      userEmail: form.value.userEmail,
    };
    await UserAPI.register(payload);

    // 关键节点：注册成功后的用户提示与导航
    uni.showToast({ title: "注册成功", icon: "success", duration: 1500 });
    setTimeout(() => {
      uni.redirectTo({ url: "/pages/login/index" });
    }, 1200);
  } catch (error: any) {
    console.error("注册错误:", error);
    notifyRef.value.show({ message: error?.message || "注册失败，请稍后重试", type: "error" });
  } finally {
    isLoading.value = false;
    loadingStatusRef.value.hideToast();
  }
};

// 返回登录页（关键节点：导航逻辑）
const goLogin = () => {
  uni.navigateBack({
    delta: 1,
    fail: () => {
      uni.redirectTo({ url: "/pages/login/index" });
    },
  });
};
</script>

<style scoped lang="scss">
$primary-color: #ff6b35;
$border-gray: #e0e0e0;

.register-container {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  padding: 32rpx;
  background-color: #ffffff;
}

.register-card {
  width: 100%;
  max-width: 600rpx;
  overflow: hidden;
  background: #ffffff;
  border: 2rpx solid $border-gray;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.card-top-bar {
  height: 4rpx;
  background: $primary-color;
}

.card-content {
  padding: 64rpx;
}

.title-section {
  margin-bottom: 30rpx;
  text-align: center;
}

.app-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 40rpx;
  font-weight: bold;
  color: #000000;
}

.app-subtitle {
  display: block;
  font-size: 26rpx;
  color: #999999;
}

.register-btn-wrapper {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
  align-items: center;
  justify-content: space-between;
  margin-top: 30rpx;
}

.register-btn {
  color: #ffffff;
  background: $primary-color;
}
</style>
