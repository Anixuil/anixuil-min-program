<!--
 * @Author: Anixuil
 * @Date: 2025-09-26 16:52:01
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-10-11 16:45:49
 * @Description: 我的页面
-->
<template>
  <snapshot id="target">
    <!-- <up-loading-page :loading="loading" loading-text="小羽狂飞中..." icon-size="30"></up-loading-page> -->
    <loadingStatus ref="loadingStatusRef"></loadingStatus>
    <view class="profile-wrapper">
      <text class="text-blue font-bold text-lg">我的</text>
      <!-- 判断是否已登录 -->
      <template v-if="isLoggedIn">
        <image :src="userInfo?.wxAvatarUrl" class="w100 h100 mb-5 rounded-full" />
        <text class="text-lg font-bold">{{ userInfo?.nickName }}</text>
        <up-button @click="handleLogout" class="mt-5">退出登录</up-button>
      </template>

      <!-- 未登录时显示去登录按钮 -->
      <template v-else>
        <text>您还未登录，请先登录</text>
        <up-button @click="goToLoginPage" class="mt-5">去登录</up-button>
      </template>
      <up-button @click="WeChatLogin">微信一键登录</up-button>
      <up-button v-show="canSnapshot" @click="takePhoto">截图</up-button>
      <view class="camera-container">
        <camera device-position="front" flash="off" @error="handleCameraError" ref="cameraRef" :audio="true"
         style="width: 100vw;height: 200px;" @init="handleCameraInit"></camera>
        <image v-if="!cameraShow" class="photo-overlay" :src="photoSrc" mode="aspectFill"></image>
      </view>
      <up-image :show-loading="true" :src="imageSrc" width="200px" height="400px"></up-image>
    </view>
  </snapshot>
</template>

<script lang="ts" setup>
import AuthAPI from "@/api/auth";
import { useUserStore } from "@/store/modules/user";

const createSelectQuery = uni.createSelectorQuery()
const imageSrc = ref('')
const cameraRef = ref()
const cameraShow = ref(true) // 是否显示摄像头
const photoSrc = ref('') // 拍照图片

// 拍照
const takePhoto = () => {
  const camera = uni.createCameraContext()
  camera.takePhoto({
    quality: 'high',
    success: (res: any) => {
      console.log('拍照成功', res);
      photoSrc.value = res.tempImagePath
      cameraShow.value = false
      setTimeout(() => {
        takeSnapshot()
      }, 500)
    },
    fail: (res: any) => {
      console.log('拍照失败', res);
    }
  })
}

// 截图
const takeSnapshot = () => { 
  // 调用截图前，先对摄像头画面进行截图，将图片转换为合适的格式进行展示，替换到摄像头画面
  nextTick(() => {
    createSelectQuery.select('#target').node(() => { }).exec(res => {
      const node = res[0].node
      node.takeSnapshot({
        type: 'arraybuffer',
        format: 'png',
        success: (res: any) => {
          console.log('截图成功', res);
          // 将图片转为合适的格式进行展示 res.data是ArrayBuffer格式的
          const base64 = uni.arrayBufferToBase64(res.data)
          imageSrc.value = `data:image/png;base64,${base64}`
          setTimeout(() => {
            cameraShow.value = true
          }, 1000)
        },
        fail(res: any) {
          console.log('res', res);
        }
      })
    })
  })
}

const canSnapshot = ref(false) // 是否可以截图
const handleCameraError = (err: any) => {
  console.log('handleCameraError', err);
}
const handleCameraInit = (res: any) => {
  console.log('handleCameraInit', res);
  canSnapshot.value = true
}
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
  return
  // 如果未登录，直接返回
  if (!userStore.token) {
    uni.reLaunch({
      url: '/pages/login/index'
    })
    return
  }

  // 检测token活性
  const tokenActive = await AuthAPI.checkTokenActive()
  console.log('tokenActive', tokenActive);
  if (!tokenActive?.data) {
    uni.reLaunch({
      url: '/pages/login/index'
    })
    return
  }
  
  // 检测判断是需要补充微信账户信息还是补充邮箱密码信息
  let info = userStore.userInfo || {}
  if (Object.keys(info).length === 0) { 
    // 获取用户信息
    info = await userStore.getUserInfo()
  }
  const needBindWeChat = !info.wxOpenId
  const needSetEmail = !info.userName && !info.userEmail
  if (needBindWeChat || needSetEmail) {
    console.log('needBindWeChat', needBindWeChat);
    console.log('needSetEmail', needSetEmail);
    uni.navigateTo({
      url: `/pages/profile/complete-info?needType=${needBindWeChat ? 'wechat' : 'email'}`
    })
  }
};

// 页面展示检测如果没有绑定微信账号或着没有设置邮箱密码则跳到补充页面进行补充
onShow(() => {
  checkAccountIntegrity();
})
</script>

<style lang="scss" scoped>
.profile-wrapper {
  width: 100vw;
  height: 100vh;
  background-color: #121826;
  box-sizing: border-box;
  padding: 32rpx;
  overflow: auto;
}

.camera-container {
  position: relative;
  width: 100vw;
  height: 200px;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>