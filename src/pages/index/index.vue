<!--
 * @Author: moxunjingmu
 * @Date: 2025-03-24 17:39:53
 * @Description:
-->
<template>
  <view class="index-wrapper">
    <up-loading-page bgColor="#121826" color="#00FF94" :loading="pageLoading" loading-text="小羽狂飞中..." icon-size="30"></up-loading-page>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

const pageLoading = ref(true)

onLoad(() => {
  pageLoading.value = false
})
</script>

<style lang="scss" scoped>
.index-wrapper {
  width: 100vw;
  height: 100vh;
  background-color: #121826;
  box-sizing: border-box;
  padding: 32rpx;
}
</style>
