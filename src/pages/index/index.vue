<!--
 * @Author: moxunjingmu
 * @Date: 2025-03-24 17:39:53
 * @Description:
-->
<template>
  <view class="index-wrapper">
    <!-- 顶部渐变横幅（关键节点：品牌颜色与视觉吸引） -->
    <view class="hero">
      <text class="hero-title">羽球对决</text>
      <text class="hero-subtitle">激情开赛，马上加入！</text>
      <view class="hero-actions">
        <up-button type="primary" :customStyle="{ 'border-radius': '20rpx' }" @click="goSchedule">查看赛程</up-button>
        <up-button type="success" :customStyle="{ 'border-radius': '20rpx' }" @click="goProfile">我的主页</up-button>
      </view>
    </view>

    <!-- 精选模块卡片（关键节点：增强色彩与层次） -->
    <view class="section">
      <view class="section-title">精选功能</view>
      <view class="card-grid">
        <view class="feature-card">
          <text class="card-title">快速报名</text>
          <text class="card-desc">一键加入比赛，享受竞技快感</text>
        </view>
        <view class="feature-card alt">
          <text class="card-title">赛程管理</text>
          <text class="card-desc">掌握比赛进度与赛事信息</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

const pageLoading = ref(true);

onLoad(() => {
  pageLoading.value = false;
});

const goSchedule = () => {
  uni.switchTab({ url: "/pages/schedule/index" });
};

const goProfile = () => {
  uni.switchTab({ url: "/pages/profile/index" });
};
</script>

<style lang="scss" scoped>
.index-wrapper {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  padding: 32rpx;
  background-color: #ffffff;
}

// 顶部渐变横幅
.hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  height: 260rpx;
  padding: 32rpx;
  color: #ffffff;
  background: linear-gradient(135deg, #ff6b35 0%, #ff934f 50%, #ffcb77 100%);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 53, 0.3);
}
.hero-title {
  font-size: 48rpx;
  font-weight: 800;
}
.hero-subtitle {
  margin-top: 12rpx;
  font-size: 28rpx;
  opacity: 0.95;
}
.hero-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 24rpx;
}

// 精选模块
.section {
  margin-top: 28rpx;
}
.section-title {
  margin-bottom: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}
.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}
.feature-card {
  padding: 24rpx;
  background: #ffffff;
  border: 2rpx solid #ffe1d6;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 53, 0.15);
}
.feature-card.alt {
  border-color: #d6ecff;
  box-shadow: 0 6rpx 16rpx rgba(0, 153, 255, 0.15);
}
.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #000000;
}
.card-desc {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #666666;
}
</style>
