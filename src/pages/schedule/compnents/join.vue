<template>
  <view class="list-wrapper">
    <view class="header-entry">我参与的赛程</view>
    <view v-for="item in list" :key="item.id" class="card" @click="goDetails(item)">
      <view class="card-title">{{ item.title }}</view>
      <view class="card-sub">{{ formatSub(item) }}</view>
    </view>
    <view class="end-text">- 已经到底啦 -</view>
  </view>
</template>

<script lang="ts" setup>
import { formatSub, navigateToDetails, type ScheduleItem } from "@/pages/schedule/shared";

const list: ScheduleItem[] = [
  { id: "J1", title: "线上报名赛｜我参与", time: "2025-10-06 14:00", place: "羽球馆C", type: "公开赛" },
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
