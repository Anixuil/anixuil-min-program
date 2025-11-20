<!--
 * @Author: Anixuil
 * @Date: 2025-09-26 16:52:01
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-10-19 22:42:03
 * @Description: 我的页面
-->
<template>
  <!-- <up-loading-page :loading="loading" loading-text="小羽狂飞中..." icon-size="30"></up-loading-page> -->
  <loadingStatus ref="loadingStatusRef"></loadingStatus>
  <view class="profile-wrapper">
    <text class="text-blue font-bold text-lg">我的</text>
    <!-- 判断是否已登录 -->
    <template v-if="isLoggedIn">
      <image :src="userInfo?.wxAvatarUrl" class="w100 h100 mb-5 rounded-full" />
      <text class="text-lg font-bold">{{ userInfo?.nickName }}</text>
      <up-button v-if="!isWeChatBound" @click="bindWeChat">绑定微信</up-button>
      <up-button @click="handleLogout" class="mt-5">退出登录</up-button>
    </template>

    <!-- 未登录时显示去登录按钮 -->
    <template v-else>
      <text>您还未登录，请先登录</text>
      <up-button @click="goToLoginPage" class="mt-5">去登录</up-button>
      <up-button @click="WeChatLogin">微信一键登录</up-button>
    </template>
  </view>
</template>

<script lang="ts" setup>
import AuthAPI from "@/api/auth";
import UserAPI from "@/api/user";
import { useUserStore } from "@/store/modules/user";

// 使用 pinia
const userStore = useUserStore();

const loadingStatusRef = ref() // 获取 toast 实例

// 显示 toast
const showToast = () => {
  loadingStatusRef.value.showToast({
    type: 'loading',
    message: '小羽狂飞中...',
    duration: -1,
  })
}

// 隐藏 toast
const hideToast = () => {
  loadingStatusRef.value.hideToast()
}

const isWeChatBound = computed(() => userStore.userInfo?.wxOpenId);

const isLoggedIn = computed(() => userStore.token);
const userInfo = computed(() => userStore.userInfo);

// 跳转到登录页面
const goToLoginPage = () => {
  uni.navigateTo({ url: "/pages/login/index" });
};

// 退出登录处理
const handleLogout = async () => {
  try {
    showToast()
    await userStore.logout();
    uni.showToast({ title: "已退出登录", icon: "success" });
  } catch (error) {
    console.error('退出登录错误:', error);
    uni.showToast({ title: "退出登录失败", icon: "error" });
  } finally {
    hideToast()
    uni.reLaunch({
      url: '/pages/login/index'
    })
  }
};

// 微信一键登录
const WeChatLogin = async () => {
  try {
    showToast()
    await userStore.WeChatLogin()
    await userStore.WeChatGetUserInfo()
  } catch (error) {
  } finally {
    hideToast()
  }
}

// 检测账号信息完整性
const checkAccountIntegrity = async () => {
  // 如果未登录，直接返回
  if (!userStore.token) {
    uni.reLaunch({
      url: '/pages/login/index'
    })
    return
  }

  // 检测token活性
  const tokenActive = await AuthAPI.checkTokenActive()
  if (!tokenActive?.data) {
    uni.reLaunch({
      url: '/pages/login/index'
    })
    return
  }

  // 检测判断是需要补充微信账户信息还是补充邮箱密码信息
  let info: any = userStore.userInfo || {}
  if (Object.keys(info).length === 0) {
    // 获取用户信息
    info = await userStore.getUserInfo()
  }
  // const needBindWeChat = !info.wxOpenId
  const needSetEmail = !info.userName || (!info?.userEmail || info?.userEmail.indexOf('@wx.com') != -1) // 因为微信登录后，如果没有设置邮箱，邮箱会自动添加@wx.com后缀
  if (needSetEmail) {
    uni.navigateTo({
      url: `/pages/profile/complete-info?needType=email`
    })
  }
};

// 绑定微信
const bindWeChat = async () => {
  loadingStatusRef.value.showToast({
    type: 'loading',
    message: '小羽绑定中...',
    duration: -1,
  })
  const code: string | number = await userStore.WeChatLogin() as string | number;
  console.log('code', code);
  UserAPI.bingWx({code}).then(res => {
    console.log('res', res);
    if (res) {
      uni.showToast({
        title: '绑定成功',
        icon: 'success',
        duration: 2000,
      })
      userStore.getUserInfo()
    }else{
      uni.showToast({
        title: '绑定失败',
        icon: 'none',
        duration: 2000,
      })
    }
  }).catch(err => {
    uni.showToast({
      title: '绑定失败',
      icon: 'none',
      duration: 2000,
    })
  }).finally(() => {
    loadingStatusRef.value.hideToast();
  })
}

// 页面展示检测如果没有绑定微信账号或着没有设置邮箱密码则跳到补充页面进行补充
onShow(() => {
  checkAccountIntegrity();
})
</script>

<style lang="scss" scoped>
.profile-wrapper {
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
  box-sizing: border-box;
  padding: 32rpx;
  overflow: auto;
  color: #000000;
  
  text {
    color: #000000;
  }
}
</style>