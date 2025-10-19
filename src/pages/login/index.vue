<!--
 * @Author: moxunjinmu
 * @Date: 2025-03-24 17:39:53
 * @Description: 羽球对决登录页面
-->
<template>
  <loadingStatus ref="loadingStatusRef"></loadingStatus>
  <up-notify ref="notifyRef"></up-notify>
  <!-- 主容器 -->
  <view class="login-container">
    <!-- 装饰元素 -->
    <view class="decoration-bg">
      <view class="decoration-circle decoration-circle-1"></view>
      <view class="decoration-circle decoration-circle-2"></view>
    </view>

    <!-- 登录卡片 -->
    <view class="login-card">
      <!-- 卡片顶部装饰条 -->
      <view class="card-top-bar"></view>

      <view class="card-content">
        <!-- 标题区域 -->
        <view class="title-section">
          <view class="logo-container">
            <view class="logo-circle">
              <view class="shuttlecock-icon">
                <view class="shuttlecock-icon-head"></view>
                <view class="shuttlecock-icon-feather"></view>
              </view>
            </view>
          </view>
          <text class="app-title">羽球对决</text>
          <text class="app-subtitle">登录你的账号，开始精彩对决</text>
        </view>

        <!-- 登录表单 -->
        <view class="login-form">
          <up-form :model="form" :rules="rules" ref="formRef" label-position="top" label-width="100rpx"
            :labelStyle="{ color: '#00FF94' }">
            <up-form-item label="邮箱" prop="userEmail">
              <up-input color="#fff" placeholder="请输入邮箱" v-model="form.userEmail" />
            </up-form-item>
            <up-form-item label="密码" prop="userPassword">
              <up-input type="password" color="#fff" placeholder="请输入密码" v-model="form.userPassword" />
            </up-form-item>
          </up-form>

          <view class="login-btn-wrapper">
            <!-- 登录按钮 -->
            <up-button class="login-btn" @click="handleLogin" :customStyle="{ 'border-radius': '16rpx' }">
              <text class="btn-text">{{ isLoading ? '登录中...' : '登录' }}</text>
            </up-button>

            <!-- 微信快捷登录 -->
            <up-button color="#07C160" @click="WeChatLogin" text="💬微信快捷登录" :customStyle="{ 'border-radius': '16rpx' }">
            </up-button>
          </view>

          <!-- 注册入口 -->
          <view class="register-section">
            <text class="register-text">还没有账号? </text>
            <text class="register-link" @click="handleRegister">立即注册</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user";

// 响应式数据
const form = ref({
  userEmail: "",
  userPassword: "",
});

const showPassword = ref(false);
const isLoading = ref(false);
const loadingStatusRef = ref();

const formRef = ref();
const rules = ref({
  userEmail: [{ required: true, message: "请输入邮箱", trigger: "blur" }],
  userPassword: [{ required: true, message: "请输入密码", trigger: "blur" }],
});

// 使用 pinia
const userStore = useUserStore();

// 密码显示/隐藏切换
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};


// 忘记密码
const handleForgotPassword = () => {
  uni.showToast({
    title: "功能开发中...",
    icon: "none"
  });
};

// 注册
const handleRegister = () => {
  uni.showToast({
    title: "功能开发中...",
    icon: "none"
  });
};

const notifyRef = ref()

// 登录处理
const handleLogin = async () => {

  try {
    const valid = await formRef.value.validate()
    if (!valid) {
      notifyRef.value.show({
        message: '请输入正确的账号信息',
        type: 'warning',
        // safeAreaInsetTop: true,
      })
      return
    }

    isLoading.value = true;
    const params = {
      userEmail: form.value.userEmail,
      userPassword: form.value.userPassword,
    }
    await userStore.login(params);

    if (userStore.token) {
      uni.showToast({
        title: "登录成功",
        icon: "success",
        duration: 1500
      });

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        // uni.navigateBack(); // 登录成功后返回上一页
        uni.reLaunch({
          url: '/pages/profile/index', // 登录成功后跳转到我的页面
        })
      }, 1500);
    } else {
      uni.showToast({
        title: "登录失败，请检查账号密码",
        icon: "none"
      });
    }
  } catch (error) {
    console.error('登录错误:', error);
    notifyRef.value.show({
      message: '登录失败，请稍后重试',
      type: 'warning',
      // safeAreaInsetTop: true,
    })
  } finally {
    isLoading.value = false;
  }
};


// 微信一键登录
const WeChatLogin = async () => {
  try {
    loadingStatusRef.value.showToast({
      type: 'loading',
      message: '小羽狂飞中...',
      duration: -1,
    });

    await userStore.WeChatLogin();
    await userStore.WeChatGetUserInfo();

    uni.showToast({
      title: "微信登录成功",
      icon: "success",
      duration: 1500
    });

    setTimeout(() => {
      // uni.navigateBack();
      uni.reLaunch({
        url: '/pages/profile/index', // 登录成功后跳转到我的页面
      })
    }, 1500);
  } catch (error) {
    console.error('微信登录错误:', error);
    uni.showToast({
      title: "微信登录失败",
      icon: "none"
    });
  } finally {
    loadingStatusRef.value.hideToast();
  }
};
</script>

<style scoped lang="scss">
// 颜色变量
$primary-color: #00FF94; // 霓虹绿 - 主色调
$secondary-color: #00A3FF; // 亮蓝 - 强调色
$dark-bg: #121826; // 深色背景
$darker-bg: #0A0F1A; // 更深色背景
$dark-card: #1E293B; // 卡片深色背景
$text-white: #ffffff;
$text-gray: #9CA3AF;
$text-gray-light: #D1D5DB;
$border-gray: #374151;
$wechat-green: #07C160;

// 动画关键帧
@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-15px);
  }
}

@keyframes glow {
  0% {
    box-shadow: 0 0 5px rgba(0, 255, 148, 0.5);
  }

  100% {
    box-shadow: 0 0 20px rgba(0, 255, 148, 0.8);
  }
}

@keyframes pulse-slow {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.6;
  }
}

// 主容器
.login-container {
  height: 100vh;
  box-sizing: border-box;
  background: $dark-bg;
  background-image:
    linear-gradient(rgba(0, 255, 148, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 148, 0.05) 1px, transparent 1px);
  background-size: 30px 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  position: relative;
  overflow: hidden;
}

// 装饰背景
.decoration-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  .decoration-circle-1 {
    position: absolute;
    top: 80rpx;
    left: 80rpx;
    width: 320rpx;
    height: 320rpx;
    background: rgba(0, 255, 148, 0.05);
    border-radius: 50%;
    filter: blur(64rpx);
    animation: pulse-slow 3s ease-in-out infinite;
  }

  .decoration-circle-2 {
    position: absolute;
    bottom: 80rpx;
    right: 80rpx;
    width: 480rpx;
    height: 480rpx;
    background: rgba(0, 163, 255, 0.05);
    border-radius: 50%;
    filter: blur(96rpx);
    animation: pulse-slow 3s ease-in-out infinite 1.5s;
  }
}


.shuttlecock-svg {
  position: relative;
  width: 100%;
  height: 100%;

  .shuttlecock-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border: 2rpx solid rgba(0, 255, 148, 0.3);
    border-radius: 50%;

    &.shuttlecock-circle-1 {
      width: 90%;
      height: 90%;
    }

    &.shuttlecock-circle-2 {
      width: 80%;
      height: 80%;
    }

    &.shuttlecock-circle-3 {
      width: 70%;
      height: 70%;
    }
  }

  .shuttlecock-cross {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 80%;

    &::before,
    &::after {
      content: '';
      position: absolute;
      background: rgba(0, 255, 148, 0.5);
    }

    &::before {
      top: 50%;
      left: 0;
      right: 0;
      height: 2rpx;
      transform: translateY(-50%);
    }

    &::after {
      left: 50%;
      top: 0;
      bottom: 0;
      width: 2rpx;
      transform: translateX(-50%);
    }
  }

  .shuttlecock-head {
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 30%;
    height: 30%;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 10rpx rgba(0, 255, 148, 0.5);
  }

  .shuttlecock-feather {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    border-left: 12rpx solid transparent;
    border-right: 12rpx solid transparent;
    border-top: 24rpx solid $primary-color;
    filter: drop-shadow(0 0 6rpx rgba(0, 255, 148, 0.8));
  }
}

// 登录卡片
.login-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 600rpx;
  background: $dark-card;
  border-radius: 32rpx;
  border: 2rpx solid rgba(0, 255, 148, 0.2);
  box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.card-top-bar {
  height: 4rpx;
  background: linear-gradient(90deg, $primary-color, $secondary-color);
}

.card-content {
  padding: 64rpx;
}

// 标题区域
.title-section {
  text-align: center;
  margin-bottom: 30rpx;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 32rpx;
}

.logo-circle {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
  background: $darker-bg;
  border: 2rpx solid rgba(0, 255, 148, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.shuttlecock-icon {
  position: relative;
  width: 80rpx;
  height: 80rpx;

  .shuttlecock-icon-head {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 24rpx;
    height: 24rpx;
    background: white;
    border-radius: 50%;
    box-shadow: 0 0 0 4rpx rgba(0, 255, 148, 0.3), 0 0 16rpx rgba(0, 255, 148, 0.5);
  }

  .shuttlecock-icon-feather {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 12rpx solid transparent;
    border-right: 12rpx solid transparent;
    border-top: 24rpx solid $primary-color;
    filter: drop-shadow(0 0 6rpx rgba(0, 255, 148, 0.8));
  }
}

.app-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: $text-white;
  margin-bottom: 16rpx;
  text-shadow: 0 0 16rpx rgba(0, 255, 148, 0.6);
}

.app-subtitle {
  display: block;
  font-size: 28rpx;
  color: $text-gray;
}

// 表单样式
.login-form {
  .form-group {
    margin-bottom: 40rpx;
  }

  .form-label {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
    color: $text-gray-light;
    margin-bottom: 8rpx;
  }

  .form-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
  }

  .forgot-password {
    font-size: 24rpx;
    color: $primary-color;
    text-decoration: none;
  }
}

// 输入框样式
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: $darker-bg;
  border: 2rpx solid $border-gray;
  border-radius: 16rpx;
  transition: all 0.3s ease;

  &.input-focused {
    border-color: rgba(0, 255, 148, 0.8);
    box-shadow: 0 0 16rpx rgba(0, 255, 148, 0.3);
    transform: scale(1.01);
  }
}

.input-icon {
  position: absolute;
  left: 24rpx;
  z-index: 2;
  font-size: 32rpx;
}

.form-input {
  flex: 1;
  padding: 24rpx 24rpx 24rpx 80rpx;
  background: transparent;
  border: none;
  color: $text-white;
  font-size: 28rpx;

  &::placeholder {
    color: $text-gray;
  }

  &:focus {
    outline: none;
  }
}

.password-toggle {
  position: absolute;
  right: 24rpx;
  z-index: 2;
  font-size: 32rpx;
  cursor: pointer;
}

// 按钮样式
.login-btn,
.wechat-btn {
  width: 100%;
  padding: 14rpx;
  border-radius: 16rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  .btn-icon {
    margin-right: 16rpx;
    font-size: 32rpx;
  }

  .btn-text {
    font-size: 32rpx;
  }
}

.login-btn {
  background: $primary-color;
  color: $darker-bg;
  animation: glow 2s ease-in-out infinite alternate;

  &:hover {
    background: rgba(0, 255, 148, 0.9);
  }

  &.btn-loading {
    opacity: 0.8;
    animation: none;
  }
}

.wechat-btn {
  background: rgba(7, 193, 96, 0.1);
  color: $wechat-green;
  border: 2rpx solid rgba(7, 193, 96, 0.3);

  &:hover {
    background: rgba(7, 193, 96, 0.2);
  }
}

// 注册区域
.register-section {
  text-align: center;
  margin-top: 32rpx;

  .register-text {
    font-size: 28rpx;
    color: $text-gray;
  }

  .register-link {
    font-size: 28rpx;
    color: $primary-color;
    font-weight: 500;
    text-decoration: none;
  }
}

// 移动端适配
@media screen and (max-width: 750rpx) {
  .login-container {
    padding: 24rpx;
  }

  .card-content {
    padding: 48rpx 32rpx;
  }

  .shuttlecock-decoration {
    display: none; // 在小屏幕上隐藏装饰元素
  }

  .decoration-bg {

    .decoration-circle-1,
    .decoration-circle-2 {
      width: 200rpx;
      height: 200rpx;
    }
  }

  .app-title {
    font-size: 40rpx;
  }

  .app-subtitle {
    font-size: 24rpx;
  }

  .form-input {
    font-size: 26rpx;
  }

  .login-btn,
  .wechat-btn {
    font-size: 28rpx;
    padding: 20rpx;
  }
}

// 超小屏幕适配
@media screen and (max-width: 480rpx) {
  .card-content {
    padding: 32rpx 24rpx;
  }

  .logo-circle {
    width: 96rpx;
    height: 96rpx;
  }

  .shuttlecock-icon {
    width: 60rpx;
    height: 60rpx;
  }

  .app-title {
    font-size: 36rpx;
  }

  .form-group {
    margin-bottom: 32rpx;
  }
}

.login-btn-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
  gap: 25rpx;
  margin-top: 30rpx;
}
</style>
