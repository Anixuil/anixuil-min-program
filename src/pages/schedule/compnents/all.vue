<template>
  <!-- 全部赛程：点击跳转到全部赛程列表页 -->
  <view class="list-wrapper">
    <!-- 头部入口：跳转到全部赛程页面（关键节点：入口强调色） -->
    <view class="header-entry" @click="goAllList">全部赛程</view>

    <!-- 列表：每个 item 可点击跳转详情页 -->
    <view v-for="item in list" :key="item.id" class="card" @click="goDetails(item)">
      <view class="card-header">
        <view class="card-title">{{ item.title }}</view>
        <!-- 状态徽标（关键节点：通用字典映射并上色） -->
        <up-tag type="warning" :plain="true">{{ formatStatus(item) }}</up-tag>
      </view>
      <view class="card-sub">{{ formatSub(item) }}</view>
    </view>
    <view class="end-text">- 已经到底啦 -</view>
  </view>
</template>

<script lang="ts" setup>
import { navigateToDetails } from "@/pages/schedule/shared";
import { useMatchStore } from "@/store/modules/match";
import { useDictStore } from "@/store/modules/dict";

const matchStore = useMatchStore();
const dictStore = useDictStore();

onLoad(async () => {
  await dictStore.loadMatchStatus();
  await matchStore.fetchList();
});

const formatSub = (item: any) => {
  const statusLabel = dictStore.findLabel(item.status || "");
  return `${item.planStartTime || ""}｜${item.description || ""}｜${statusLabel}`;
};

const formatStatus = (item: any) => dictStore.findLabel(item.status || "");

const goAllList = () => {
  uni.navigateTo({ url: "/pages/scheduleDetails/index" });
};

const list = computed(() => matchStore.list.map((m) => ({ ...m, id: m.id, title: m.name })));

const goDetails = (item: any) => navigateToDetails(item.id);
</script>

<style lang="scss" scoped>
.list-wrapper {
  padding: 16rpx;
}

.header-entry {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  color: #ff6b35;
  text-align: center;
  background: #fff7f3;
  border: 2rpx solid #ffe1d6;
  border-radius: 16rpx;
}

.card {
  padding: 24rpx;
  margin-top: 20rpx;
  background: #ffffff;
  border: 2rpx solid #ffe1d6;
  border-radius: 16rpx;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 53, 0.12);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
