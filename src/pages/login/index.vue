<template>
  <loadingStatus ref="loadingStatusRef"></loadingStatus>
  <up-notify ref="notifyRef"></up-notify>

  <!-- 主容器 -->
  <view class="login-container">
    <!-- 背景装饰：抽象球场与速度线 -->
    <view class="bg-decoration">
      <view class="court-lines"></view>
      <view class="speed-shape shape-1"></view>
      <view class="speed-shape shape-2"></view>
      <view class="floating-shuttlecock"></view>
    </view>

    <view class="content-wrapper">
      <!-- 头部区域：Logo与标语 -->
      <view class="header-section slide-up-1">
        <view class="logo-container">
          <view class="logo-circle">
            <view class="shuttlecock-icon">
              <view class="head"></view>
              <view class="skirt">
                <view class="feather f1"></view>
                <view class="feather f2"></view>
                <view class="feather f3"></view>
              </view>
            </view>
          </view>
          <view class="motion-ring"></view>
        </view>
        <view class="text-container">
          <text class="app-title">羽球对决</text>
          <text class="app-subtitle">COMPETITIVE BADMINTON</text>
          <text class="app-slogan">挥洒汗水 · 决战巅峰</text>
        </view>
      </view>

      <!-- 登录表单卡片 -->
      <view class="login-card slide-up-2">
        <view class="login-form">
          <up-form :model="form" :rules="rules" ref="formRef" label-width="0">
            <!-- 邮箱输入 -->
            <up-form-item prop="userEmail" class="form-item">
              <view class="input-group" :class="{ 'is-focus': focusedField === 'email' }">
                <view class="icon-box">
                  <up-icon name="email" size="24" :color="getFieldColor('email')"></up-icon>
                </view>
                <input 
                  class="custom-input-field" 
                  v-model="form.userEmail" 
                  placeholder="请输入邮箱"
                  placeholder-class="input-placeholder" 
                  @focus="focusedField = 'email'" 
                  @blur="focusedField = ''" 
                />
              </view>
            </up-form-item>

            <!-- 密码输入 -->
            <up-form-item prop="userPassword" class="form-item">
              <view class="input-group" :class="{ 'is-focus': focusedField === 'password' }">
                <view class="icon-box">
                  <up-icon name="lock" size="24" :color="getFieldColor('password')"></up-icon>
                </view>
                <input 
                  class="custom-input-field" 
                  v-model="form.userPassword" 
                  type="password" 
                  placeholder="请输入密码"
                  placeholder-class="input-placeholder" 
                  @focus="focusedField = 'password'" 
                  @blur="focusedField = ''" 
                />
              </view>
            </up-form-item>
          </up-form>

          <!-- 操作按钮区域 -->
          <view class="action-buttons slide-up-3">
            <button class="login-btn" :class="{ 'btn-loading': isLoading }" @click="handleLogin" hover-class="btn-hover" :disabled="isLoading">
              <text class="btn-text" v-if="!isLoading">登 录</text>
              <up-loading-icon v-else color="#ffffff" mode="circle"></up-loading-icon>
            </button>

            <view class="divider">
              <text class="divider-text">OR</text>
            </view>

            <button class="wechat-btn" @click="handleWeChatLogin" hover-class="btn-hover">
              <up-icon name="weixin-fill" color="#07C160" size="22"></up-icon>
              <text class="wechat-text">微信一键登录</text>
            </button>
          </view>

          <!-- 底部链接 -->
          <view class="footer-links slide-up-4">
            <text class="register-hint">还没有账号？</text>
            <text class="register-link" @click="handleRegister">立即注册</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue';
import { useUserStore } from "@/store/modules/user";

/**
 * 状态定义
 */
const userStore = useUserStore();
const loadingStatusRef = ref();
const notifyRef = ref();
const formRef = ref();

// 表单数据
const form = reactive({
  userEmail: "",
  userPassword: "",
});

// UI状态
const focusedField = ref('');
const isLoading = ref(false);

// 表单验证规则
const rules = {
  userEmail: [
    { required: true, message: "请输入邮箱", trigger: ["blur", "change"] },
    { type: 'email', message: "请输入正确的邮箱格式", trigger: ["blur", "change"] }
  ],
  userPassword: [
    { required: true, message: "请输入密码", trigger: ["blur", "change"] },
    { min: 6, message: "密码长度不能少于6位", trigger: ["blur", "change"] }
  ],
};

/**
 * 辅助函数：获取输入框图标颜色
 */
const getFieldColor = (field: string) => {
  return focusedField.value === field ? '#ff6b35' : '#c0c4cc';
};

/**
 * 页面跳转：注册
 */
const handleRegister = () => {
  uni.navigateTo({ url: "/pages/register/index" });
};

/**
 * 页面跳转：登录成功后跳转首页
 */
const navigateToHome = () => {
  uni.showToast({
    title: "登录成功",
    icon: "success",
    duration: 1500,
  });

  setTimeout(() => {
    uni.reLaunch({ url: "/pages/profile/index" });
  }, 1500);
};

/**
 * 业务逻辑：邮箱登录
 */
const handleLogin = async () => {
  uni.vibrateShort({});

  // 1. 表单验证
  try {
    const valid = await formRef.value.validate();
    if (!valid) throw new Error('验证失败');
  } catch (e) {
    uni.vibrateLong({});
    return;
  }

  // 2. 执行登录
  isLoading.value = true;
  try {
    await userStore.login({ 
      userEmail: form.userEmail, 
      userPassword: form.userPassword 
    });

    if (userStore.token && userStore.token.length > 0) {
      navigateToHome();
    } else {
      throw new Error("Token无效");
    }
  } catch (error) {
    console.error("登录错误:", error);
    notifyRef.value.show({
      message: "登录失败，请检查账号密码",
      type: "error",
    });
    uni.vibrateLong({});
  } finally {
    isLoading.value = false;
  }
};

/**
 * 业务逻辑：微信登录
 */
const handleWeChatLogin = async () => {
  uni.vibrateShort({});
  
  try {
    loadingStatusRef.value.showToast({
      type: "loading",
      message: "正在唤起微信...",
      duration: -1,
    });

    await userStore.WeChatLogin();
    await userStore.WeChatGetUserInfo();

    navigateToHome();
  } catch (error) {
    console.error("微信登录错误:", error);
    notifyRef.value.show({
      message: "微信登录失败",
      type: "error",
    });
  } finally {
    loadingStatusRef.value.hideToast();
  }
};
</script>

<style scoped lang="scss">
// 颜色变量
$primary-color: #ff6b35;
$primary-dark: #e85a2a;
$text-main: #1a1a1a;
$text-sub: #909399;
$bg-color: #f8f9fc;

/* 布局容器 */
.login-container {
  position: relative;
  min-height: 100vh;
  background-color: $bg-color;
  padding-top: var(--status-bar-height);
  box-sizing: border-box;
}

.content-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--status-bar-height));
  padding: 40rpx 60rpx;
  box-sizing: border-box;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  .court-lines {
    position: absolute;
    top: -20%;
    right: -30%;
    width: 150%;
    height: 150%;
    background-image:
      linear-gradient(rgba(255, 107, 53, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 107, 53, 0.03) 1px, transparent 1px);
    background-size: 40rpx 40rpx;
    transform: rotate(-15deg);
  }

  .speed-shape {
    position: absolute;
    border-radius: 50rpx;
    transform: skewX(-20deg);
  }

  .shape-1 {
    top: -100rpx;
    right: -50rpx;
    width: 400rpx;
    height: 600rpx;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0) 100%);
    filter: blur(40px);
  }

  .shape-2 {
    bottom: -100rpx;
    left: -100rpx;
    width: 300rpx;
    height: 500rpx;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 107, 53, 0) 100%);
    filter: blur(30px);
  }

  .floating-shuttlecock {
    position: absolute;
    top: 15%;
    left: 10%;
    width: 40rpx;
    height: 40rpx;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 50%;
    box-shadow: 200rpx 100rpx 0 rgba(255, 107, 53, 0.05),
      -50rpx 400rpx 0 rgba(255, 107, 53, 0.08);
    filter: blur(2px);
  }
}

/* 头部区域 */
.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 80rpx;

  .logo-container {
    position: relative;
    width: 180rpx;
    height: 180rpx;
    margin-bottom: 40rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .motion-ring {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    border: 2rpx dashed rgba(255, 107, 53, 0.3);
    border-radius: 50%;
    animation: spin 10s linear infinite;
  }

  .logo-circle {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 140rpx;
    height: 140rpx;
    background: #ffffff;
    border-radius: 50%;
    box-shadow: 0 10rpx 30rpx rgba(255, 107, 53, 0.2);
    animation: float 3s ease-in-out infinite;
  }

  // 羽毛球图标绘制
  .shuttlecock-icon {
    position: relative;
    width: 80rpx;
    height: 80rpx;
    transform: rotate(45deg);

    .head {
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 28rpx;
      height: 28rpx;
      background: $primary-color;
      border-radius: 50% 50% 10rpx 10rpx;
      transform: translateX(-50%);
      z-index: 2;
    }

    .skirt {
      position: absolute;
      bottom: 20rpx;
      left: 50%;
      transform: translateX(-50%);
      
      .feather {
        position: absolute;
        bottom: 0;
        width: 10rpx;
        height: 45rpx;
        background: $text-main;
        border-radius: 10rpx 10rpx 0 0;
        transform-origin: bottom center;

        &.f1 { transform: translateX(-50%) rotate(-15deg); left: -8rpx; background: #333; height: 40rpx; }
        &.f2 { transform: translateX(-50%) rotate(0deg); background: $primary-color; z-index: 1; width: 12rpx; }
        &.f3 { transform: translateX(-50%) rotate(15deg); left: 8rpx; background: #333; height: 40rpx; }
      }
    }
  }

  .text-container {
    text-align: center;
    
    .app-title {
      display: block;
      font-size: 56rpx;
      font-weight: 900;
      color: $text-main;
      letter-spacing: 2rpx;
      margin-bottom: 8rpx;
      font-style: italic;
    }

    .app-subtitle {
      display: block;
      font-size: 20rpx;
      color: $primary-color;
      letter-spacing: 8rpx;
      font-weight: bold;
      margin-bottom: 16rpx;
      opacity: 0.8;
    }

    .app-slogan {
      font-size: 26rpx;
      color: $text-sub;
      letter-spacing: 2rpx;
    }
  }
}

/* 登录表单 */
.login-card {
  width: 100%;

  .login-form {
    .form-item {
      margin-bottom: 40rpx;
    }

    .input-group {
      display: flex;
      align-items: center;
      background: #ffffff;
      border-radius: 24rpx;
      padding: 6rpx 24rpx;
      border: 2rpx solid transparent;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
      transition: all 0.3s ease;
      width: 100%;

      &.is-focus {
        border-color: rgba(255, 107, 53, 0.5);
        box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.15);
        transform: translateY(-2rpx);
      }

      .icon-box {
        margin-right: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }

      .custom-input-field {
        flex: 1;
        height: 88rpx;
        line-height: 88rpx;
        font-size: 30rpx;
        color: $text-main;
        padding: 0;
      }

      .input-placeholder {
        color: #c0c4cc;
        font-size: 28rpx;
        line-height: 88rpx;
      }
    }
  }
}

/* 按钮区域 */
.action-buttons {
  margin-top: 60rpx;

  .login-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, $primary-color 0%, $primary-dark 100%);
    border-radius: 48rpx;
    border: none;
    box-shadow: 0 10rpx 20rpx rgba(255, 107, 53, 0.3);
    transition: all 0.3s;

    .btn-text {
      font-size: 34rpx;
      font-weight: bold;
      color: #ffffff;
      letter-spacing: 4rpx;
    }

    &.btn-loading {
      opacity: 0.8;
    }
  }

  .btn-hover {
    transform: scale(0.98);
    box-shadow: 0 6rpx 12rpx rgba(255, 107, 53, 0.2);
  }

  .divider {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 40rpx 0;

    .divider-text {
      font-size: 22rpx;
      color: #dcdfe6;
      font-weight: bold;
      letter-spacing: 2rpx;
      padding: 0 20rpx;
      position: relative;

      &::before, &::after {
        content: '';
        position: absolute;
        top: 50%;
        width: 60rpx;
        height: 2rpx;
        background: #eee;
      }
      &::before { right: 100%; }
      &::after { left: 100%; }
    }
  }

  .wechat-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 96rpx;
    background: #ffffff;
    border: 2rpx solid #eee;
    border-radius: 48rpx;
    margin-top: 20rpx;

    .wechat-text {
      font-size: 30rpx;
      color: #333;
      margin-left: 16rpx;
      font-weight: 500;
    }

    &::after { border: none; }
  }
}

/* 底部链接 */
.footer-links {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 60rpx;

  .register-hint {
    font-size: 26rpx;
    color: $text-sub;
  }

  .register-link {
    margin-left: 12rpx;
    font-size: 28rpx;
    font-weight: bold;
    color: $primary-color;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -4rpx;
      left: 0;
      width: 100%;
      height: 4rpx;
      background: rgba(255, 107, 53, 0.3);
      border-radius: 2rpx;
    }
  }
}

/* 动画定义 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideUp {
  to { opacity: 1; transform: translateY(0); }
}

// 循环生成入场动画类
@for $i from 1 through 4 {
  .slide-up-#{$i} {
    animation: slideUp 0.6s ease-out #{$i * 0.2 - 0.2}s forwards;
    opacity: 0;
    transform: translateY(40rpx);
  }
}
</style>