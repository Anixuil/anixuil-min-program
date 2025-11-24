<!--
 * @Author: moxunjingmu
 * @Date: 2025-03-24 17:39:53
 * @Description:
-->
<template>
  <view class="index-wrapper">
    <up-loading-page
      bgColor="#ffffff"
      color="#FF6B35"
      :loading="pageLoading"
      loading-text="小羽狂飞中..."
      icon-size="30"></up-loading-page>
    <view class="h-[100rpx] bg-[#333] text-white text-center line-height-[100rpx]">多人轮转赛</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

const pageLoading = ref(true);

onLoad(() => {
  pageLoading.value = false;
});
</script>

<style lang="scss" scoped>
.index-wrapper {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  padding: 32rpx;
  background-color: #ffffff;
}
</style>
