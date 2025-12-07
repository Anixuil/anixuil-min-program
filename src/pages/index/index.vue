<template>
  <loadingStatus ref="loadingStatusRef" />
  <up-notify ref="notifyRef"></up-notify>

  <!-- 主容器 -->
  <view class="index-wrapper">
    <view class="index-container" :class="{ 'no-scroll': filteredMatches.length === 0, 'is-scaled': showCreateDrawer }">
      <!-- 背景装饰：复用登录页风格 -->
    <view class="bg-decoration">
      <view class="court-lines"></view>
      <view class="speed-shape shape-1"></view>
      <view class="speed-shape shape-2"></view>
      <view class="floating-shuttlecock"></view>
    </view>

    <!-- 自定义导航栏 -->
    <up-navbar
      title="羽球对决"
      :titleStyle="{ fontWeight: '900', fontSize: '36rpx', fontStyle: 'italic', color: '#1a1a1a' }"
      bgColor="transparent"
      :placeholder="true"
      leftIcon=""
      :border="false"
    />

    <view class="content-wrapper">
      <!-- 每日签到卡片 -->
      <view class="sign-in-card slide-up-1">
        <view class="card-bg-decoration"></view>
        <view class="card-content">
          <view class="text-info">
            <view class="title-row">
              <up-icon name="calendar-fill" color="#ffffff" size="24" style="margin-right: 10rpx;"></up-icon>
              <text class="title">每日签到</text>
            </view>
            <text class="subtitle">每日签到领 100 积分，助威心仪选手！</text>
          </view>
          <up-button
            shape="circle"
            size="small"
            :customStyle="{ padding: '0 30rpx', height: '60rpx', backgroundColor: '#ffffff', color: '#ff6b35', fontWeight: 'bold', border: 'none' }"
            @click="handleSignIn"
            :disabled="isSigned"
          >
            {{ isSigned ? '已签到' : '立即签到' }}
          </up-button>
        </view>
      </view>

      <!-- 快捷入口：创建比赛 -->
      <view class="quick-actions slide-up-2">
        <view class="action-card create-match" @click="goCreateMatch">
          <view class="action-content">
            <view class="action-icon">
              <up-icon name="plus-circle-fill" color="#ffffff" size="48"></up-icon>
            </view>
            <view class="action-text">
              <text class="main-text">创建比赛</text>
              <text class="sub-text">发起对决，邀请好友</text>
            </view>
          </view>
          <view class="card-decoration"></view>
        </view>
      </view>

      <!-- 赛事列表区域 -->
      <view class="section-header slide-up-3">
        <text class="section-title">赛事大厅</text>
        <view class="filter-tabs">
          <text 
            class="tab" 
            :class="{ active: currentFilter === 'all' }" 
            @click="currentFilter = 'all'"
          >全部</text>
          <text 
            class="tab" 
            :class="{ active: currentFilter === 'inProgress' }" 
            @click="currentFilter = 'inProgress'"
          >进行中</text>
        </view>
      </view>

      <view class="match-list">
        <view 
          v-for="(match, index) in filteredMatches" 
          :key="match.id" 
          class="match-card" 
          @click="goMatchDetail(match.id)"
          :style="{ animationDelay: `${0.4 + index * 0.1}s` }"
        >
          <!-- 状态标签 -->
          <view class="status-badge" :class="match.status">
            {{ getStatusText(match.status) }}
          </view>
          
          <view class="card-body">
            <view class="match-header">
              <text class="match-name">{{ match.name }}</text>
              <text class="match-time">{{ formatDate(match.planStartTime) }}</text>
            </view>
            
            <view class="match-tags">
              <view class="tag type-tag">{{ match.type === 'single' ? '单打' : '双打' }}</view>
              <view class="tag mode-tag">{{ getModeText(match.mode) }}</view>
            </view>

            <view class="match-desc">{{ match.description || '暂无描述' }}</view>
          </view>

          <view class="card-footer">
            <view class="owner-info">
              <up-avatar 
                :src="match.user?.userAvatar || match.user?.wxAvatarUrl || ''" 
                size="24"
              ></up-avatar>
              <text class="owner-name">{{ match.user?.userAlias || '房主' }}</text>
            </view>
            <view class="match-status-info">
              <text class="player-count">{{ match.playerCount || 0 }}人已加入</text>
              <view class="action-arrow">
                <up-icon name="arrow-right" color="#909399" size="16"></up-icon>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态 -->
        <view v-if="filteredMatches.length === 0" class="empty-state slide-up-4">
          <up-empty 
            :icon="emptyBadmintonIcon" 
            text="暂无比赛，快去创建吧"
            width="300"
            height="240"
            textSize="28"
            marginTop="20"
          ></up-empty>
        </view>
      </view>
    </view>
    </view>

    <MatchCreateDrawer v-model:show="showCreateDrawer" @created="onMatchCreated" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onLoad, onShow, onPullDownRefresh, onReachBottom } from "@dcloudio/uni-app";
import { listMatch, Match, dailySign } from "@/api/match";
import UserAPI from "@/api/user";
import { useUserStore } from "@/store/modules/user";
import MatchCreateDrawer from "@/components/badminton/MatchCreateDrawer.vue";

// 状态
const userStore = useUserStore();
const loadingStatusRef = ref();
const notifyRef = ref();
const showCreateDrawer = ref(false);
// 默认已签到，避免登录用户进入时闪烁显示“立即签到”
const isSigned = ref(true);
const SIGN_IN_KEY = 'ANI_BADMINTON_LAST_SIGN_IN_DATE';

// 辅助函数：获取当前日期字符串 YYYY-MM-DD
const getTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// 检查签到状态
const checkSignInStatus = async () => {
  // 1. 未登录状态：显示未签到
  if (!userStore.token) {
    isSigned.value = false;
    return;
  }

  // 2. 已登录状态：尝试自动签到
  try {
    // 调用签到接口
    const res = await dailySign();

    if (res?.data === true) {
      // 签到成功
      notifyRef.value.show({
        message: '每日签到成功！获得 +100 积分',
        type: 'success',
        duration: 2000
      });
    }
    isSigned.value = true;   
  } catch (e) {
    // 3. 签到失败（通常是因为已签到）
    // console.log('自动签到未成功（可能是已签到）', e);
    isSigned.value = true;
  }
};

const currentFilter = ref('all');

// 列表数据相关
const matchList = ref<Match[]>([]);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const isLoading = ref(false);
const hasMore = ref(true);

// 羽毛球空状态 SVG (Base64 encoded)
const emptyBadmintonIcon = 'data:image/svg+xml;charset=utf-8,%3Csvg width="300" height="240" viewBox="0 0 300 240" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M150 200C205.228 200 250 182.091 250 160C250 137.909 205.228 120 150 120C94.7715 120 50 137.909 50 160C50 182.091 94.7715 200 150 200Z" fill="%23FF6B35" fill-opacity="0.05"/%3E%3Cg transform="translate(120, 80) rotate(-15)"%3E%3Cellipse cx="40" cy="50" rx="35" ry="45" stroke="%23333333" stroke-width="2"/%3E%3Cpath d="M40 95 L40 140" stroke="%23333333" stroke-width="2" stroke-linecap="round"/%3E%3Crect x="37" y="140" width="6" height="25" rx="2" fill="%23FF6B35"/%3E%3Cpath d="M20 50 H60 M30 30 H50 M30 70 H50 M40 20 V80 M25 35 V65 M55 35 V65" stroke="%23E0E0E0" stroke-width="1"/%3E%3C/g%3E%3Cg transform="translate(180, 110) rotate(45)"%3E%3Cpath d="M0 0 L-15 -25 L15 -25 L0 0Z" fill="%23FF6B35" stroke="%23FF6B35" stroke-width="1" stroke-linejoin="round"/%3E%3Ccircle cx="0" cy="0" r="4" fill="%23333333"/%3E%3C/g%3E%3Ccircle cx="210" cy="60" r="2" fill="%23FF6B35" fill-opacity="0.4"/%3E%3Ccircle cx="90" cy="180" r="3" fill="%23FF6B35" fill-opacity="0.4"/%3E%3C/svg%3E';

// 获取比赛列表
const getMatchList = async (isRefresh = false) => {
  if (isLoading.value) return;
  
  if (isRefresh) {
    page.value = 1;
    hasMore.value = true;
  }
  
  if (!hasMore.value) return;

  isLoading.value = true;
  try {
    const res = await listMatch({
      page: page.value,
      pageSize: pageSize.value,
      name: '' // 暂时不传搜索条件
    });
    
    if (isRefresh) {
      matchList.value = res.list;
    } else {
      matchList.value = [...matchList.value, ...res.list];
    }
    
    total.value = res.total;
    hasMore.value = matchList.value.length < total.value;
    
    if (hasMore.value) {
      page.value++;
    }
  } catch (error) {
    console.error('获取比赛列表失败', error);
    uni.showToast({
      title: '获取比赛列表失败',
      icon: 'none'
    });
  } finally {
    isLoading.value = false;
    if (isRefresh) {
      uni.stopPullDownRefresh();
    }
  }
};

// 计算属性
const filteredMatches = computed(() => {
  if (currentFilter.value === 'all') return matchList.value;
  return matchList.value.filter(m => m.status === currentFilter.value);
});

// 辅助函数
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'notStart': '未开始',
    'inProgress': '进行中',
    'end': '已结束'
  };
  return map[status] || status;
};

const getModeText = (mode: string) => {
  const map: Record<string, string> = {
    'multiPerson_relay': '多人轮转赛',
    'fixed_pair_cycle': '固搭循环赛'
  };
  return map[mode] || mode;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  // Simple format: YYYY-MM-DD HH:mm
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

// 交互逻辑
const handleSignIn = async () => {
  // 未登录，跳转到登录页
  if (!userStore.token) {
    uni.navigateTo({ url: '/pages/login/index' });
    return;
  }

  // 已登录但未签到（理论上 checkSignInStatus 会自动处理，这里作为手动触发兜底）
  if (isSigned.value) return;
  
  uni.vibrateShort({});
  
  try {
    await dailySign();
    isSigned.value = true;
    notifyRef.value.show({
      message: '签到成功！获得 +100 积分',
      type: 'success',
      duration: 2000
    });
  } catch (error) {
    // 失败也视为已签到
    isSigned.value = true;
    notifyRef.value.show({
      message: '您今日已签到',
      type: 'warning',
      duration: 2000
    });
  }
};

const goMatchDetail = (id: string) => {
  uni.navigateTo({ url: `/pages/matchDetails/index?id=${id}` });
};

const goCreateMatch = () => {
  uni.vibrateShort({});
  if (!userStore.token) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  showCreateDrawer.value = true;
};

const onMatchCreated = () => {
  // 刷新列表
  getMatchList(true);
};

// 页面生命周期
onLoad(() => {
  getMatchList(true);
});

onShow(() => {
  // 检查签到状态（自动处理过期逻辑）
  checkSignInStatus();
  // 每次显示页面时也可以选择刷新，或者保持状态
  // getMatchList(true);
});

onPullDownRefresh(() => {
  getMatchList(true);
});

onReachBottom(() => {
  getMatchList();
});
</script>

<style lang="scss" scoped>
// 变量定义 (保持与 Profile/Login 一致)
$primary-color: #ff6b35;
$primary-dark: #e85a2a;
$text-main: #1a1a1a;
$text-sub: #909399;
$bg-color: #f8f9fc;
$card-bg: #ffffff;

/* Mixins (简单模拟) */
@mixin text-ellipsis($lines: 1) {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
}

.index-wrapper {
  background-color: #000000; // 黑色背景，用于缩放时的底色
  min-height: 100vh;
}

.index-container {
  position: relative;
  min-height: 100vh;
  background-color: $bg-color;
  box-sizing: border-box;
  padding-bottom: 120rpx; // 留出底部 Tabbar 空间
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), border-radius 0.4s ease, filter 0.4s ease;
  transform-origin: center 20%;

  &.no-scroll {
    height: 100vh;
    overflow: hidden;
  }

  &.is-scaled {
    transform: scale(0.92) translateY(20rpx);
    border-radius: 40rpx;
    filter: blur(2px) brightness(0.9);
    overflow: hidden;
    pointer-events: none;
  }
}

.content-wrapper {
  position: relative;
  z-index: 1;
  padding: 20rpx 32rpx;
}

/* 背景装饰 (复用 Login) */
.bg-decoration {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;

  .court-lines {
    position: absolute;
    top: -10%;
    right: -20%;
    width: 120%;
    height: 80vh;
    background-image:
      linear-gradient(rgba(255, 107, 53, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 107, 53, 0.03) 1px, transparent 1px);
    background-size: 40rpx 40rpx;
    transform: rotate(-10deg);
  }

  .speed-shape {
    position: absolute;
    border-radius: 50rpx;
    transform: skewX(-20deg);
  }

  .shape-1 {
    top: 100rpx;
    right: -60rpx;
    width: 300rpx;
    height: 400rpx;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 107, 53, 0) 100%);
    filter: blur(30px);
  }

  .shape-2 {
    top: 400rpx;
    left: -80rpx;
    width: 200rpx;
    height: 300rpx;
    background: linear-gradient(135deg, rgba(255, 107, 53, 0.06) 0%, rgba(255, 107, 53, 0) 100%);
    filter: blur(25px);
  }

  .floating-shuttlecock {
    position: absolute;
    top: 150rpx;
    left: 40rpx;
    width: 30rpx;
    height: 30rpx;
    background: rgba(255, 107, 53, 0.08);
    border-radius: 50%;
    filter: blur(2px);
    animation: float 4s ease-in-out infinite;
  }
}

/* 签到卡片 */
.sign-in-card {
  position: relative;
  width: 100%;
  height: 180rpx;
  border-radius: 32rpx;
  background: linear-gradient(120deg, #ff6b35 0%, #ff8c42 100%);
  box-shadow: 0 16rpx 32rpx rgba(255, 107, 53, 0.25);
  overflow: hidden;
  margin-bottom: 40rpx;

  .card-bg-decoration {
    position: absolute;
    top: 0; right: 0;
    width: 200rpx;
    height: 200rpx;
    background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
    transform: translate(30%, -30%);
  }

  .card-content {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 40rpx;
  }

  .text-info {
    color: #ffffff;
    .title-row {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;
      
      .title {
        font-size: 40rpx;
        font-weight: 900;
        letter-spacing: 2rpx;
        font-style: italic;
      }
    }
    
    .subtitle {
      font-size: 24rpx;
      opacity: 0.9;
    }
  }
}

/* 快捷入口 */
.quick-actions {
  margin-bottom: 40rpx;

  .action-card {
    position: relative;
    width: 100%;
    height: 160rpx;
    border-radius: 24rpx;
    overflow: hidden;
    transition: all 0.3s;

    &:active {
      transform: scale(0.98);
    }
  }

  .create-match {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    box-shadow: 0 12rpx 24rpx rgba(79, 172, 254, 0.3);

    .action-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 40rpx;
    }

    .action-icon {
      width: 96rpx;
      height: 96rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 32rpx;
      backdrop-filter: blur(10px);
    }

    .action-text {
      color: #ffffff;
      display: flex;
      flex-direction: column;
      
      .main-text {
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 8rpx;
      }
      
      .sub-text {
        font-size: 24rpx;
        opacity: 0.9;
      }
    }

    .card-decoration {
      position: absolute;
      bottom: -20rpx;
      right: -20rpx;
      width: 160rpx;
      height: 160rpx;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }
  }
}

/* 区域标题 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24rpx;
  padding: 0 8rpx;

  .section-title {
    font-size: 34rpx;
    font-weight: 800;
    color: $text-main;
    position: relative;
    z-index: 1;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 2rpx;
      left: 0;
      width: 100%;
      height: 12rpx;
      background: rgba(255, 107, 53, 0.15);
      z-index: -1;
      border-radius: 4rpx;
    }
  }

  .filter-tabs {
    display: flex;
    gap: 24rpx;

    .tab {
      font-size: 26rpx;
      color: $text-sub;
      transition: all 0.3s;
      position: relative;

      &.active {
        color: $primary-color;
        font-weight: bold;
        transform: scale(1.05);
      }
    }
  }
}

/* 赛事列表 */
.match-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.match-card {
  position: relative;
  background: $card-bg;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  border: 2rpx solid transparent;
  transition: all 0.3s ease;
  animation: slideUp 0.6s ease-out forwards; // 添加动画
  opacity: 0; // 配合 slide-up 动画

  &:active {
    transform: scale(0.98);
    border-color: rgba(255, 107, 53, 0.1);
  }

  .status-badge {
    position: absolute;
    top: 0;
    right: 0;
    padding: 8rpx 20rpx;
    border-radius: 0 24rpx 0 16rpx;
    font-size: 22rpx;
    font-weight: bold;
    color: #fff;

    &.notStart { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    &.inProgress { background: linear-gradient(135deg, #ff6b35 0%, #ff934f 100%); }
    &.end { background: #c0c4cc; }
  }

  .card-body {
    margin-bottom: 24rpx;
  }

  .match-header {
    display: flex;
    flex-direction: column;
    margin-bottom: 16rpx;

    .match-name {
      font-size: 32rpx;
      font-weight: bold;
      color: $text-main;
      margin-bottom: 8rpx;
    }

    .match-time {
      font-size: 24rpx;
      color: $text-sub;
    }
  }

  .match-tags {
    display: flex;
    gap: 12rpx;
    margin-bottom: 16rpx;

    .tag {
      padding: 4rpx 16rpx;
      border-radius: 8rpx;
      font-size: 20rpx;
      font-weight: 600;
    }

    .type-tag {
      background: rgba(255, 107, 53, 0.1);
      color: $primary-color;
    }

    .mode-tag {
      background: #f0f2f5;
      color: #606266;
    }
  }

  .match-desc {
    font-size: 26rpx;
    color: #606266;
    line-height: 1.4;
    @include text-ellipsis(2);
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20rpx;
    border-top: 2rpx solid #f5f7fa;

    .owner-info {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .owner-name {
        font-size: 26rpx;
        color: $text-main;
        font-weight: 500;
      }
    }

    .match-status-info {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .player-count {
        font-size: 24rpx;
        color: $text-sub;
      }
    }
  }
}

.empty-state {
  padding: 60rpx 0;
  display: flex;
  justify-content: center;
}



/* 动画定义 */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-12rpx); }
}

@keyframes slideUp {
  to { opacity: 1; transform: translateY(0); }
}

@for $i from 1 through 4 {
  .slide-up-#{$i} {
    animation: slideUp 0.6s ease-out #{$i * 0.1}s forwards;
    opacity: 0;
    transform: translateY(40rpx);
  }
}
</style>
