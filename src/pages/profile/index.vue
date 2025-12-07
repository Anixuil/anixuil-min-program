<template>
  <loadingStatus ref="loadingStatusRef" />
  
  <view class="page-wrapper">
    <view class="profile-container" :class="{ 'is-scaled': showEditDrawer }">
      <!-- 自定义导航栏 -->
      <up-navbar
        :title="null"
        bgColor="transparent"
        leftIcon=""
        :placeholder="true"
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
        <!-- 已登录状态 -->
        <template v-if="isLoggedIn && userInfo">
          <!-- 头部用户信息 -->
          <view class="user-header slide-up-1">
            <view class="avatar-container">
              <view class="avatar-ring" />
              <image :src="userInfo.wxAvatarUrl || DEFAULT_AVATAR" class="avatar-img" mode="aspectFill" />
              <view class="level-badge" v-if="userBadmintonInfo">
                <text class="level-text">Lv.{{ calculateLevel(userBadmintonInfo.experience) }}</text>
              </view>
            </view>
            <view class="user-info">
              <view class="name-row">
                <text class="user-name">{{ displayName }}</text>
                <view class="edit-btn" @click="openEditDrawer">
                  <up-icon name="edit-pen" color="#909399" size="18" />
                </view>
              </view>
              <text class="user-email" v-if="userInfo.userEmail">{{ maskEmail(userInfo.userEmail) }}</text>
            </view>
          </view>

          <!-- 战绩数据卡片 -->
          <view class="stats-card slide-up-2">
            <view class="card-header">
              <text class="card-title">生涯战绩</text>
              <text class="card-subtitle">CAREER STATS</text>
            </view>
            
            <view class="stats-grid">
              <!-- 核心数据 -->
              <view 
                v-for="(stat, index) in coreStats" 
                :key="index"
                class="stat-item"
                :class="stat.class"
              >
                <text class="stat-value">{{ stat.value }}</text>
                <text class="stat-label">{{ stat.label }}</text>
              </view>
              
              <!-- 详细数据行 -->
              <view class="stat-row">
                <view class="mini-stat" v-for="(stat, index) in detailStats" :key="index">
                  <text class="val">{{ stat.value }}</text>
                  <text class="lbl">{{ stat.label }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 操作菜单 -->
          <view class="action-section slide-up-3">
            <view class="menu-list">
              <view 
                class="menu-item" 
                v-for="(menu, index) in menuItems" 
                :key="index"
                @click="menu.action"
              >
                <view class="left">
                  <up-icon :name="menu.icon" :color="menu.iconColor" size="24" />
                  <text class="menu-text" :class="{ 'logout-text': menu.isLogout }">{{ menu.text }}</text>
                </view>
                <up-icon name="arrow-right" color="#c0c4cc" size="16" />
              </view>
            </view>
          </view>
        </template>

        <!-- 未登录状态 -->
        <template v-else>
          <view class="guest-card slide-up-1">
            <view class="guest-icon">
              <up-icon name="account-fill" size="60" color="#e0e0e0" />
            </view>
            <text class="guest-title">欢迎来到羽球对决</text>
            <text class="guest-desc">登录查看您的比赛战绩与积分</text>
            
            <view class="guest-actions">
              <button class="login-btn" @click="goToLoginPage" hover-class="btn-hover">
                <text>立即登录</text>
              </button>
              <button class="wechat-btn" @click="handleWeChatLogin" hover-class="btn-hover">
                <up-icon name="weixin-fill" color="#07C160" size="22" />
                <text class="wechat-text">微信一键登录</text>
              </button>
            </view>
          </view>
        </template>
      </view>
    </view>

    <!-- 编辑抽屉 -->
    <view class="drawer-mask" :class="{ 'show': showEditDrawer }" @click="closeEditDrawer" />
    <view class="drawer-content" :class="{ 'show': showEditDrawer }">
      <view class="drawer-header">
        <text class="drawer-title">修改个人信息</text>
        <view class="close-btn" @click="closeEditDrawer">
          <up-icon name="close" color="#909399" size="20" />
        </view>
      </view>
      
      <view class="drawer-body">
        <up-form 
          :model="formData" 
          ref="uFormRef" 
          labelPosition="top" 
          :labelStyle="FORM_LABEL_STYLE"
        >
          <up-form-item label="用户名" prop="userName" :borderBottom="false" labelWidth="auto">
            <up-input v-model="formData.userName" placeholder="请输入用户名" border="none" :customStyle="INPUT_STYLE" />
          </up-form-item>
          <up-form-item label="昵称" prop="nickName" :borderBottom="false" labelWidth="auto">
            <up-input v-model="formData.nickName" placeholder="请输入昵称" border="none" :customStyle="INPUT_STYLE" />
          </up-form-item>
          <up-form-item label="邮箱" prop="userEmail" :borderBottom="false" labelWidth="auto">
            <up-input v-model="formData.userEmail" placeholder="请输入邮箱" border="none" :customStyle="INPUT_STYLE" />
          </up-form-item>
          <up-form-item label="年龄" prop="userAge" :borderBottom="false" labelWidth="auto">
            <up-input v-model="formData.userAge" type="number" placeholder="请输入年龄" border="none" :customStyle="INPUT_STYLE" />
          </up-form-item>
        </up-form>

        <view class="form-actions">
          <button class="save-btn" @click="handleUpdateInfo" hover-class="btn-hover">保存修改</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AuthAPI from "@/api/auth";
import UserAPI from "@/api/user";
import { useUserStore } from "@/store/modules/user";

// --- Constants & Config ---
const DEFAULT_AVATAR = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwBHJrRn51rJxtXDjAOBVDg80715aa0d561330ac6179636976981269186960195355175276369601';
const INPUT_STYLE = {
  backgroundColor: '#f5f7fa',
  borderRadius: '16rpx',
  padding: '0 20rpx',
  height: '90rpx'
};
const FORM_LABEL_STYLE = { 
  fontSize: '28rpx', 
  color: '#1a1a1a', 
  fontWeight: 'bold', 
  marginBottom: '8rpx' 
};
const FORM_RULES = {
  userAge: [{ pattern: /^[0-9]*$/, message: '年龄必须为数字', trigger: ['blur', 'change'] }]
};

// --- Types ---
interface LoadingStatusRef {
  showToast: (options: { message?: string; type?: string; duration?: number }) => void;
  hideToast: () => void;
}
interface UFormRef {
  setRules: (rules: any) => void;
  validate: () => Promise<void>;
}
interface UserFormData {
  userId: string;
  userName: string;
  nickName: string;
  userEmail: string;
  userAge: string;
}

// --- State & Stores ---
const userStore = useUserStore();
const loadingStatusRef = ref<LoadingStatusRef | null>(null);
const uFormRef = ref<UFormRef | null>(null);
const showEditDrawer = ref(false);

const formData = ref<UserFormData>({
  userId: '',
  userName: '',
  nickName: '',
  userEmail: '',
  userAge: ''
});

// --- Computed Properties ---
const isLoggedIn = computed(() => !!userStore.token);
const userInfo = computed(() => userStore.userInfo);
const userBadmintonInfo = computed(() => userStore.userInfo?.badmintonInfo);
const isWeChatBound = computed(() => !!userStore.userInfo?.wxOpenId);
const displayName = computed(() => userInfo.value?.nickName || userInfo.value?.userName || '运动健将');

// 核心战绩数据
const coreStats = computed(() => [
  { value: userBadmintonInfo.value?.score || 0, label: '持有积分', class: 'primary' },
  { value: formatWinRate(userBadmintonInfo.value?.winRate) + '%', label: '胜率', class: 'highlight' },
  { value: userBadmintonInfo.value?.experience || 0, label: '经验值', class: '' }
]);

// 详细战绩数据
const detailStats = computed(() => [
  { value: userBadmintonInfo.value?.matchCount || 0, label: '参赛数' },
  { value: userBadmintonInfo.value?.gameCount || 0, label: '对局数' },
  { value: userBadmintonInfo.value?.winCount || 0, label: '胜局' },
  { value: userBadmintonInfo.value?.loseCount || 0, label: '败局' }
]);

// 菜单项
const menuItems = computed(() => {
  const items = [];
  
  if (!isWeChatBound.value) {
    items.push({
      text: '绑定微信',
      icon: 'weixin-fill',
      iconColor: '#07C160',
      action: bindWeChat
    });
  }
  
  items.push({
    text: '修改信息',
    icon: 'edit-pen',
    iconColor: '#3c9cff',
    action: openEditDrawer
  });
  
  items.push({
    text: '退出登录',
    icon: 'trash',
    iconColor: '#ff6b35',
    isLogout: true,
    action: handleLogout
  });
  
  return items;
});

// --- Helper Functions ---

/** 格式化胜率 */
const formatWinRate = (rate?: number) => {
  if (rate === undefined || rate === null) return '0';
  return (rate * 100).toFixed(1);
};

/** 计算等级 (每1000经验升一级) */
const calculateLevel = (exp: number = 0) => Math.floor(exp / 1000) + 1;

/** 邮箱脱敏 */
const maskEmail = (email: string) => {
  if (!email) return '';
  if (email.includes('@wx.com')) return '微信用户';
  const [name, domain] = email.split('@');
  if (name.length <= 3) return email;
  return `${name.substring(0, 3)}***@${domain}`;
};

/** 显示加载提示 */
const showLoading = (message: string) => {
  loadingStatusRef.value?.showToast({ type: "loading", message, duration: -1 });
};

/** 隐藏加载提示 */
const hideLoading = () => {
  loadingStatusRef.value?.hideToast();
};

// --- Action Handlers ---

/** 打开编辑抽屉并初始化数据 */
const openEditDrawer = () => {
  if (!userInfo.value) return;
  formData.value = {
    userId: String(userInfo.value.userId || ''),
    userName: userInfo.value.userName || '',
    nickName: userInfo.value.nickName || userInfo.value.userName || '',
    userEmail: userInfo.value.userEmail || '',
    userAge: userInfo.value.userAge ? String(userInfo.value.userAge) : ''
  };
  showEditDrawer.value = true;
};

/** 关闭编辑抽屉 */
const closeEditDrawer = () => {
  showEditDrawer.value = false;
};

/** 提交用户信息修改 */
const handleUpdateInfo = async () => {
  if (!userInfo.value) return;
  if (!formData.value.userName?.trim()) {
    uni.showToast({ title: "用户名不能为空", icon: "none" });
    return;
  }

  try {
    await uFormRef.value?.validate();
    showLoading("保存中...");

    const updateData = {
      userId: formData.value.userId,
      userName: formData.value.userName,
      userAlias: formData.value.nickName,
      userEmail: formData.value.userEmail,
      userAge: formData.value.userAge
    };

    await UserAPI.updateUserInfo(updateData);
    await userStore.getUserInfo(); // 刷新数据
    
    uni.showToast({ title: "修改成功", icon: "success" });
    closeEditDrawer();
  } catch (err) {
    console.error("修改失败:", err);
    uni.showToast({ title: "修改失败或验证未通过", icon: "none" });
  } finally {
    hideLoading();
  }
};

/** 跳转登录页 */
const goToLoginPage = () => uni.navigateTo({ url: "/pages/login/index" });

/** 退出登录 */
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          showLoading("正在退出...");
          await userStore.logout();
          uni.showToast({ title: "已退出", icon: "success" });
          setTimeout(() => uni.reLaunch({ url: "/pages/login/index" }), 1000);
        } catch (error) {
          console.error("退出失败:", error);
        } finally {
          hideLoading();
        }
      }
    }
  });
};

/** 微信一键登录 */
const handleWeChatLogin = async () => {
  try {
    showLoading("正在唤起微信...");
    await userStore.WeChatLogin();
    await userStore.WeChatGetUserInfo();
    uni.showToast({ title: "登录成功", icon: "success" });
  } catch (err) {
    console.error("微信登录错误:", err);
    uni.showToast({ title: "微信登录失败", icon: "none" });
  } finally {
    hideLoading();
  }
};

/** 绑定微信 */
const bindWeChat = async () => {
  try {
    showLoading("绑定中...");
    const code = (await userStore.WeChatLogin()) as string | number;
    const res = await UserAPI.bingWx({ code });
    if (res) {
      uni.showToast({ title: "绑定成功", icon: "success" });
      await userStore.getUserInfo();
    } else {
      throw new Error("绑定失败");
    }
  } catch (err) {
    console.error("绑定微信错误:", err);
    uni.showToast({ title: "绑定失败", icon: "none" });
  } finally {
    hideLoading();
  }
};

/** 账号完整性检查 */
const checkAccountIntegrity = async () => {
  if (!userStore.token) return;

  const tokenActive = await AuthAPI.checkTokenActive();
  if (!tokenActive?.data) {
    userStore.logout();
    return;
  }

  // 确保有用户信息
  if (!userStore.userInfo || Object.keys(userStore.userInfo).length === 0) {
    await userStore.getUserInfo();
  }

  // 如果邮箱为空,或者邮箱以@wx.com结尾，跳转补充信息页面
  if (!userStore.userInfo?.userEmail || userStore.userInfo?.userEmail?.endsWith('@wx.com')) {
    uni.navigateTo({ url: "/pages/profile/complete-info?needType=email" });
  }
};

// --- Lifecycle ---
onMounted(() => {
  uFormRef.value?.setRules(FORM_RULES);
});

onShow(() => {
  checkAccountIntegrity();
  if (userStore.token) {
    userStore.getUserInfo();
  }
});
</script>

<style lang="scss" scoped>
// 变量定义
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
  overflow: hidden;
}

.profile-container {
  position: relative;
  min-height: 100vh;
  background-color: $bg-color;
  box-sizing: border-box;
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), border-radius 0.4s ease, filter 0.4s ease;
  transform-origin: center 20%;
  z-index: 10;
  
  &.is-scaled {
    transform: scale(0.92) translateY(20rpx);
    border-radius: 40rpx;
    filter: blur(2px) brightness(0.9);
    overflow: hidden;
    pointer-events: none;
  }
}

/* 抽屉遮罩 */
.drawer-mask {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 900;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  
  &.show {
    opacity: 1;
    pointer-events: auto;
  }
}

/* 抽屉内容 */
.drawer-content {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: $card-bg;
  z-index: 999;
  border-radius: 40rpx 40rpx 0 0;
  padding: 40rpx;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  padding-bottom: calc(40rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  
  &.show {
    transform: translateY(0);
  }

  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40rpx;

    .drawer-title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-main;
    }
  }

  .drawer-body {
    display: flex;
    flex-direction: column;
    gap: 30rpx;

    .form-actions {
      margin-top: 40rpx;

      .save-btn {
        background: linear-gradient(135deg, $primary-color, $primary-dark);
        color: #fff;
        height: 90rpx;
        border-radius: 45rpx;
        font-size: 32rpx;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10rpx 20rpx rgba(255, 107, 53, 0.3);
        
        &::after { border: none; }
      }
    }
  }
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
    top: 10%; right: 10%; width: 30rpx; height: 30rpx;
    background: rgba(255, 107, 53, 0.1);
    border-radius: 50%;
    filter: blur(2px);
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 40rpx 32rpx;
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

/* 头部用户信息 */
.user-header {
  display: flex;
  align-items: center;
  margin-top: 20rpx;

  .avatar-container {
    position: relative;
    width: 140rpx;
    height: 140rpx;
    margin-right: 30rpx;

    .avatar-ring {
      position: absolute;
      top: -6rpx; left: -6rpx; right: -6rpx; bottom: -6rpx;
      border: 4rpx solid rgba(255, 107, 53, 0.3);
      border-radius: 50%;
      animation: spin 10s linear infinite;
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 6rpx solid #fff;
      box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.1);
      box-sizing: border-box;
      display: block;
    }

    .level-badge {
      position: absolute;
      bottom: 0; right: -10rpx;
      background: linear-gradient(90deg, $primary-color, $primary-dark);
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      border: 2rpx solid #fff;
      
      .level-text {
        font-size: 20rpx;
        color: #fff;
        font-weight: bold;
        font-style: italic;
      }
    }
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;

    .name-row {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 8rpx;

      .user-name {
        font-size: 40rpx;
        font-weight: 900;
        color: $text-main;
      }

      .edit-btn {
        width: 48rpx;
        height: 48rpx;
        background: #f0f2f5;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:active {
          transform: scale(0.9);
          background: #e1e4e8;
        }
      }
    }

    .user-email {
      font-size: 24rpx;
      color: $text-sub;
    }
  }
}

/* 战绩卡片 */
.stats-card {
  background: $card-bg;
  border-radius: 32rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.04);
  
  .card-header {
    display: flex;
    flex-direction: column;
    margin-bottom: 30rpx;
    border-bottom: 2rpx solid #f5f7fa;
    padding-bottom: 20rpx;

    .card-title {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-main;
    }
    .card-subtitle {
      font-size: 20rpx;
      color: $text-sub;
      letter-spacing: 2rpx;
      margin-top: 4rpx;
    }
  }

  .stats-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .stat-item {
      width: 30%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 30rpx;

      .stat-value {
        font-size: 44rpx;
        font-weight: 900;
        color: $text-main;
        font-family: 'DIN', sans-serif;
      }

      .stat-label {
        font-size: 24rpx;
        color: $text-sub;
        margin-top: 8rpx;
      }

      &.primary .stat-value { color: $primary-color; }
      &.highlight .stat-value { color: #07c160; }
    }

    .stat-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      margin-top: 20rpx;
      background: #f8f9fa;
      padding: 20rpx;
      border-radius: 16rpx;

      .mini-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;

        &:not(:last-child)::after {
          content: '';
          position: absolute;
          right: 0; top: 20%;
          height: 60%; width: 2rpx;
          background: #eee;
        }

        .val {
          font-size: 30rpx;
          font-weight: bold;
          color: $text-main;
        }
        .lbl {
          font-size: 20rpx;
          color: $text-sub;
          margin-top: 4rpx;
        }
      }
    }
  }
}

/* 菜单列表 */
.action-section {
  .menu-list {
    background: $card-bg;
    border-radius: 24rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
  }

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 2rpx solid #f5f7fa;
    transition: background 0.2s;

    &:active {
      background: #f9f9f9;
    }

    &:last-child {
      border-bottom: none;
    }

    .left {
      display: flex;
      align-items: center;
      gap: 20rpx;
    }

    .menu-text {
      font-size: 28rpx;
      color: $text-main;
      
      &.logout-text {
        color: $primary-color;
      }
    }
  }
}

/* 游客卡片 */
.guest-card {
  background: $card-bg;
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.05);
  margin-top: 100rpx;

  .guest-icon {
    width: 120rpx;
    height: 120rpx;
    background: #f5f7fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;
  }

  .guest-title {
    font-size: 36rpx;
    font-weight: bold;
    color: $text-main;
    margin-bottom: 12rpx;
  }

  .guest-desc {
    font-size: 26rpx;
    color: $text-sub;
    margin-bottom: 60rpx;
  }

  .guest-actions {
    width: 100%;
    
    button {
      width: 100%;
      height: 96rpx;
      border-radius: 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30rpx;
      font-weight: bold;
      border: none;
      
      &::after { border: none; }
    }

    .login-btn {
      background: linear-gradient(135deg, $primary-color, $primary-dark);
      color: #fff;
      box-shadow: 0 10rpx 20rpx rgba(255, 107, 53, 0.3);
      margin-bottom: 30rpx;
    }

    .wechat-btn {
      background: #fff;
      border: 2rpx solid #eee;
      color: #333;
      
      .wechat-text { margin-left: 12rpx; }
    }
  }
}

/* 动画类 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes slideUp {
  to { opacity: 1; transform: translateY(0); }
}

.slide-up-1 { animation: slideUp 0.6s ease-out forwards; opacity: 0; transform: translateY(40rpx); }
.slide-up-2 { animation: slideUp 0.6s ease-out 0.2s forwards; opacity: 0; transform: translateY(40rpx); }
.slide-up-3 { animation: slideUp 0.6s ease-out 0.4s forwards; opacity: 0; transform: translateY(40rpx); }
</style>