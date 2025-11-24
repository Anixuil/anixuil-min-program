<template>
  <!-- 全部赛程：点击跳转到全部赛程列表页 -->
  <view class="list-wrapper">
    <!-- 头部入口：跳转到全部赛程页面 -->
    <view class="header-entry" @click="goAllList">全部赛程</view>

    <!-- 列表：每个 item 可点击跳转详情页 -->
    <view v-for="item in list" :key="item.id" class="card" @click="goDetails(item)">
      <view class="card-title">{{ item.title }}</view>
      <view class="card-sub">{{ formatSub(item) }}</view>
    </view>
    <view class="end-text">- 已经到底啦 -</view>
  </view>
</template>

<script lang="ts" setup>
import { formatSub, navigateToDetails, type ScheduleItem } from "@/pages/schedule/shared";

const goAllList = () => {
  uni.navigateTo({ url: "/pages/scheduleDetails/index" });
};

const list: ScheduleItem[] = [
  { id: "A1", title: "多人轮转赛｜11-20发布", time: "2025-10-01 10:00", place: "羽球馆A", type: "多人轮转赛" },
  { id: "A2", title: "双打淘汰赛｜11-21发布", time: "2025-10-02 10:00", place: "羽球馆B", type: "双打淘汰赛" },
];

const goDetails = (item: ScheduleItem) => navigateToDetails(item.id);
</script>

<style lang="scss" scoped>
.list-wrapper {
  padding: 16rpx;
}

.header-entry {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  color: #000000;
  text-align: center;
  background: #ffffff;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
}

.card {
  padding: 24rpx;
  margin-top: 20rpx;
  background: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
}

.card-title {
  margin-bottom: 8rpx;
  font-size: 30rpx;
  font-weight: 500;
  color: #000;
}

.card-sub {
  font-size: 24rpx;
  color: #666;
}

.end-text {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
  text-align: center;
}
</style>
