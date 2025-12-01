<!--
 * @Author: Anixuil
 * @Date: 2025-09-26 16:52:01
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-10-02 14:06:47
 * @Description: 赛程页面
-->
<template>
  <view class="schedule-wrapper">
    <view class="page-title">全部赛程</view>
    <view class="content-container">
      <All />
    </view>
  </view>
</template>

<script setup lang="ts">
import All from "@/pages/schedule/compnents/all.vue";
</script>

<style lang="scss" scoped>
.schedule-wrapper {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  padding: 32rpx;
  background-color: #f3f3f3;
}

.page-title {
  margin-bottom: 20rpx;
  font-size: 36rpx;
  font-weight: 600;
  color: #000000;
}

.content-container {
  padding: 8rpx 16rpx;
  background-color: #ffffff;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
}
</style>
