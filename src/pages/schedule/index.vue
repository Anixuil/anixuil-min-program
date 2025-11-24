<!--
 * @Author: Anixuil
 * @Date: 2025-09-26 16:52:01
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-10-02 14:06:47
 * @Description: 赛程页面
-->
<template>
  <view class="schedule-wrapper">
    <view class="tabs-container">
      <wd-tabs v-model="tab" :animated="false">
        <wd-tab title="全部比赛">
          <All />
        </wd-tab>
        <wd-tab title="我发起的">
          <My />
        </wd-tab>
        <wd-tab title="我参与的">
          <Join />
        </wd-tab>
      </wd-tabs>
    </view>
  </view>
</template>

<script setup lang="ts">
// 引入 Vue API
import { ref } from "vue";
import All from "@/pages/schedule/compnents/all.vue";
import My from "@/pages/schedule/compnents/my.vue";
import Join from "@/pages/schedule/compnents/join.vue";
import wdTabs from "wot-design-uni/components/wd-tabs/wd-tabs.vue";
import wdTab from "wot-design-uni/components/wd-tab/wd-tab.vue";

const tab = ref(0);
</script>

<style lang="scss" scoped>
.schedule-wrapper {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  padding: 32rpx;
  background-color: #f3f3f3;
}

.tabs-container {
  padding: 8rpx 16rpx;
  margin-bottom: 20rpx;
  background-color: #ffffff;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
}

.tab-content {
  min-height: calc(100vh - 160rpx);
}
</style>
