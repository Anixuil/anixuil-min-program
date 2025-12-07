<!--
 * @Author: Anixuil
 * @Date: 2025-10-03 10:53:41
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-12-07 18:24:04
 * @Description: 补充信息页面
-->
<template>
  <loadingStatus ref="loadingStatusRef"></loadingStatus>
  
  <view class="page-wrapper">
    <view class="complete-info-container">
      <!-- 导航栏 -->
      <up-navbar
        title="补充信息"
        bgColor="transparent"
        autoBack
        placeholder
        :border="false"
      />

      <!-- 背景装饰 -->
      <view class="bg-decoration">
        <view class="court-lines" />
        <view class="speed-shape shape-1" />
        <view class="speed-shape shape-2" />
        <view class="floating-shuttlecock" />
      </view>

      <view class="content-wrapper">
        <!-- 头部标题 -->
        <view class="header-section slide-up-1">
          <text class="page-title">完善信息</text>
          <text class="page-subtitle">COMPLETE YOUR PROFILE</text>
        </view>

        <!-- 表单卡片 -->
        <view class="info-card slide-up-2">
          <up-form
            :model="form"
            :rules="rules"
            ref="formRef"
            label-width="0"
          >
            <!-- 邮箱输入 -->
            <up-form-item prop="userEmail" class="form-item">
              <view class="input-group" :class="{ 'is-focus': focusedField === 'email' }">
                <view class="icon-box">
                  <up-icon name="email" size="24" :color="getFieldColor('email')" />
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
                  <up-icon name="lock" size="24" :color="getFieldColor('password')" />
                </view>
                <input 
                  class="custom-input-field" 
                  v-model="form.userPassword" 
                  :password="!showPassword" 
                  placeholder="请输入密码"
                  placeholder-class="input-placeholder" 
                  @focus="focusedField = 'password'" 
                  @blur="focusedField = ''" 
                />
                <view class="icon-box suffix-icon" @click="showPassword = !showPassword">
                  <up-icon :name="showPassword ? 'eye-fill' : 'eye-off'" size="20" color="#c0c4cc" />
                </view>
              </view>
            </up-form-item>

            <!-- 验证码输入 -->
            <up-form-item prop="userEmailCode" class="form-item">
              <view class="input-group" :class="{ 'is-focus': focusedField === 'code' }">
                <view class="icon-box">
                  <up-icon name="grid" size="24" :color="getFieldColor('code')" />
                </view>
                <input 
                  class="custom-input-field" 
                  v-model="form.userEmailCode" 
                  placeholder="请输入邮箱验证码"
                  placeholder-class="input-placeholder" 
                  @focus="focusedField = 'code'" 
                  @blur="focusedField = ''" 
                />
                <view class="code-btn-wrapper">
                  <button 
                    class="send-code-btn" 
                    :class="{ 'is-disabled': isSendingEmailCode || countdown > 0 }"
                    @click="sendEmailCode"
                    :disabled="isSendingEmailCode || countdown > 0"
                  >
                    <text class="btn-text">{{ countdown > 0 ? `${countdown}s` : "获取验证码" }}</text>
                  </button>
                </view>
              </view>
            </up-form-item>

            <!-- 提交按钮 -->
            <view class="action-section">
              <button class="submit-btn" @click="handleSubmit" hover-class="btn-hover">
                <text class="btn-text">提交信息</text>
              </button>
            </view>
          </up-form>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import UserAPI from "@/api/user";
import { useUserStore } from "@/store/modules/user";
import { ref, watch, onUnmounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const userStore = useUserStore();
const loadingStatusRef = ref(); // 获取 toast 实例
const focusedField = ref(''); // 当前聚焦的输入框
const showPassword = ref(false); // 是否显示密码

// 获取参数
const needType = ref<string>("");
onLoad((query: Record<string, any> | undefined) => {
  needType.value = query?.needType || "";
  console.log("needType", needType.value);
});

const form = ref({
  userEmail: "",
  userEmailCode: "",
  userPassword: "",
});

const rules = ref({
  userEmail: [{ required: true, message: "请补充邮箱信息", trigger: "blur" }],
  userEmailCode: [{ required: true, message: "请输入邮箱验证码", trigger: "blur" }],
  userPassword: [{ required: true, message: "请输入密码", trigger: "blur" }],
});

const formRef = ref();

// 获取输入框图标颜色
const getFieldColor = (field: string) => {
  return focusedField.value === field ? '#ff6b35' : '#c0c4cc';
};

// 提交补充信息表单
const handleSubmit = () => {
  formRef.value.validate().then(() => {
    loadingStatusRef.value.showToast({
      type: "loading",
      message: "小羽验证中...",
      duration: -1,
    });
    // 验证邮箱验证码
    UserAPI.verifyEmailCode({
      userEmail: form.value.userEmail,
      code: form.value.userEmailCode,
    })
      .then(() => {
        loadingStatusRef.value.hideToast();
        loadingStatusRef.value.showToast({
          type: "loading",
          message: "小羽更新中...",
          duration: -1,
        });
        const userInfo: {
          userId: string;
          userName: string;
          userEmail: string;
          userAge?: string;
          userAlias?: string;
          userPassword?: string;
        } = Object.assign({}, userStore.userInfo, {
          userEmail: form.value.userEmail,
          userPassword: form.value.userPassword,
        });
        console.log("userInfo", userInfo);

        UserAPI.updateUserInfo(userInfo)
          .then(() => {
            uni.showToast({
              title: "更新成功",
              icon: "success",
              duration: 2000,
            });
            userStore.getUserInfo();
            setTimeout(() => {
              uni.reLaunch({
                url: "/pages/profile/index",
              });
            }, 1500);
          })
          .catch((err: any) => {
            console.log("err", err);
            uni.showToast({
              title: "更新失败",
              icon: "none",
              duration: 2000,
            });
          })
          .finally(() => {
            loadingStatusRef.value.hideToast();
          });
      })
      .catch((err: any) => {
        uni.showToast({
          title: err.message || "验证失败",
          icon: "none",
          duration: 2000,
        });
      })
      .finally(() => {
        loadingStatusRef.value.hideToast();
      });
  });
};

const isSendingEmailCode = ref(true); // 是否发送邮箱验证码
const sendEmailCodeLoading = ref(false); // 发送邮箱验证码加载状态
const countdown = ref(0); // 倒计时秒数
const countdownTimer = ref<any>(null); // 倒计时定时器

// 发送邮箱验证码
const sendEmailCode = () => {
  // 校验邮箱格式
  if (
    form.value.userEmail.trim() !== "" &&
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.value.userEmail)
  ) {
    sendEmailCodeLoading.value = true;
    loadingStatusRef.value.showToast({
      type: "loading",
      message: "小羽打包中...",
      duration: -1,
    });
    UserAPI.sendEmailCode({
      userEmail: form.value.userEmail,
      emailTitle: "羽球对决验证码",
    })
      .then(() => {
        // 发送成功后启动60秒倒计时
        startCountdown();
        uni.showToast({
          title: "验证码已发送",
          icon: "success",
          duration: 2000,
        });
      })
      .catch((err) => {
        console.log("err", err);
        uni.showToast({
          title: err.message || "验证码发送失败",
          icon: "none",
          duration: 2000,
        });
      })
      .finally(() => {
        sendEmailCodeLoading.value = false;
        loadingStatusRef.value.hideToast();
      });
  } else {
    uni.showToast({
      title: "请输入正确的邮箱格式",
      icon: "none",
      duration: 2000,
    });
  }
};

// 启动倒计时
const startCountdown = () => {
  countdown.value = 60;
  isSendingEmailCode.value = true; // 禁用按钮

  countdownTimer.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value);
      }
      countdownTimer.value = null;
      isSendingEmailCode.value = false; // 重新启用按钮
    }
  }, 1000);
};

// 组件卸载时清理定时器
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value);
    countdownTimer.value = null;
  }
});
// 监听邮箱输入框是否输入了邮箱
watch(
  () => form.value.userEmail,
  (newVal) => {
    // 如果正在倒计时，不改变按钮状态
    if (countdown.value > 0) {
      return;
    }

    if (newVal && newVal.trim() !== "") {
      isSendingEmailCode.value = false;
    } else {
      isSendingEmailCode.value = true;
    }
  },
);
</script>

<style scoped lang="scss">
// 颜色变量
$primary-color: #ff6b35;
$primary-dark: #e85a2a;
$text-main: #1a1a1a;
$text-sub: #909399;
$bg-color: #f8f9fc;
$card-bg: #ffffff;

.page-wrapper {
  position: relative;
  min-height: 100vh;
  background-color: #000000;
}

.complete-info-container {
  position: relative;
  min-height: 100vh;
  background-color: $bg-color;
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
    top: -20%; right: -30%; width: 150%; height: 150%;
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
    top: -100rpx; right: -50rpx; width: 400rpx; height: 600rpx;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0) 100%);
    filter: blur(40px);
  }
  
  .shape-2 {
    bottom: -100rpx; left: -100rpx; width: 300rpx; height: 500rpx;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 107, 53, 0) 100%);
    filter: blur(30px);
  }

  .floating-shuttlecock {
    position: absolute;
    top: 15%; left: 10%; width: 40rpx; height: 40rpx;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 50%;
    box-shadow: 200rpx 100rpx 0 rgba(255, 107, 53, 0.05);
    filter: blur(2px);
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 40rpx 60rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - 88rpx - var(--status-bar-height));
}

/* 头部标题 */
.header-section {
  margin-bottom: 60rpx;
  text-align: left;
  padding-left: 10rpx;

  .page-title {
    display: block;
    font-size: 48rpx;
    font-weight: 900;
    color: $text-main;
    margin-bottom: 12rpx;
    letter-spacing: 2rpx;
  }

  .page-subtitle {
    display: block;
    font-size: 20rpx;
    color: $primary-color;
    font-weight: bold;
    letter-spacing: 6rpx;
    opacity: 0.8;
  }
}

/* 表单卡片 */
.info-card {
  width: 100%;

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
    box-sizing: border-box;

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
    }
  }
}

/* 验证码按钮 */
.code-btn-wrapper {
  margin-left: 16rpx;
  padding-left: 16rpx;
  border-left: 2rpx solid #f0f0f0;

  .send-code-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60rpx;
    padding: 0 20rpx;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 12rpx;
    border: none;
    
    .btn-text {
      font-size: 24rpx;
      color: $primary-color;
      font-weight: bold;
    }

    &.is-disabled {
      background: #f5f7fa;
      .btn-text { color: #c0c4cc; }
    }

    &::after { border: none; }
  }
}

/* 提交按钮 */
.action-section {
  margin-top: 60rpx;

  .submit-btn {
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
  }

  .btn-hover {
    transform: scale(0.98);
    box-shadow: 0 6rpx 12rpx rgba(255, 107, 53, 0.2);
  }
}

/* 动画定义 */
@keyframes slideUp {
  to { opacity: 1; transform: translateY(0); }
}

@for $i from 1 through 3 {
  .slide-up-#{$i} {
    animation: slideUp 0.6s ease-out #{$i * 0.2}s forwards;
    opacity: 0;
    transform: translateY(40rpx);
  }
}
</style>
