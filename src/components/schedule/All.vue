<!--
 * @Author: Anixuil
 * @Date: 2025-12-07 11:58:31
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-12-07 20:06:23
 * @Description: 请填写简介
-->
<template>
  <view class="list-wrapper">
    <view 
      v-for="item in list" 
      :key="item.id" 
      class="card" 
      @click="goDetails(item)"
      @longpress="onLongPress(item)"
    >
      <view class="card-header">
        <view class="card-title">{{ item.title }}</view>
        <up-tag type="warning" :plain="true" shape="circle" size="mini">{{ formatStatus(item) }}</up-tag>
      </view>
      <view class="card-sub">{{ formatSub(item) }}</view>
    </view>
    <view class="end-text">- 已经到底啦 -</view>
  </view>
</template>

<script lang="ts" setup>
import { onMounted, computed } from "vue";
import { navigateToDetails } from "@/pages/schedule/shared";
import { useMatchStore } from "@/store/modules/match";
import { useUserStore } from "@/store/modules/user";
import { useDictStore } from "@/store/modules/dict";

const emit = defineEmits(['delete-item']);

const matchStore = useMatchStore();
const userStore = useUserStore();
const dictStore = useDictStore();

const isOwner = (item: any) => {
  return item.createBy && userStore.userInfo && item.createBy === userStore.userInfo.userId;
};

const onLongPress = (item: any) => {
  if (!isOwner(item)) return;
  
  // Haptic feedback
  uni.vibrateShort({});
  emit('delete-item', item);
};

onMounted(async () => {
  await dictStore.loadMatchStatus();
  await matchStore.fetchList();
});

const formatSub = (item: any) => {
  const statusLabel = dictStore.findLabel(item.status || "");
  return `${item.planStartTime || ""}｜${item.description || ""}｜${statusLabel}`;
};

const formatStatus = (item: any) => dictStore.findLabel(item.status || "");

const list = computed(() => matchStore.list.map((m) => ({ ...m, id: m.id, title: m.name })));

const goDetails = (item: any) => navigateToDetails(item.id);
</script>

<style lang="scss" scoped>
.list-wrapper { padding: 0; }
.swipe-item {
  margin-top: 24rpx;
}
.card {
  padding: 32rpx;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.04);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
  }
}

.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16rpx; }
.card-title { font-size: 32rpx; font-weight: bold; color: #1a1a1a; }
.card-sub { font-size: 26rpx; color: #909399; line-height: 1.5; }
.end-text { margin-top: 32rpx; font-size: 24rpx; color: #c0c4cc; text-align: center; }
</style>
