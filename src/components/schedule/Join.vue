<template>
  <view class="list-wrapper">
    <view v-for="item in list" :key="item.id" class="card" @click="goDetails(item)">
      <view class="card-title">{{ item.title }}</view>
      <view class="card-sub">{{ formatSub(item) }}</view>
    </view>
    <view class="end-text">- 已经到底啦 -</view>
  </view>
</template>

<script lang="ts" setup>
import { onMounted, computed } from "vue";
import { navigateToDetails } from "@/pages/schedule/shared";
import { usePlayerStore } from "@/store/modules/player";
import { useMatchStore } from "@/store/modules/match";
import { useUserStore } from "@/store/modules/user";
import { useDictStore } from "@/store/modules/dict";

const userStore = useUserStore();
const playerStore = usePlayerStore();
const matchStore = useMatchStore();
const dictStore = useDictStore();

onMounted(async () => {
  await dictStore.loadMatchStatus();
  await playerStore.fetchList();
  await matchStore.fetchList();
});

const myMatchIds = computed(() =>
  playerStore.list.filter((p) => p.userId === userStore.userInfo?.userId).map((p) => p.matchId),
);

const list = computed(() =>
  matchStore.list
    .filter((m) => myMatchIds.value.includes(m.id))
    .map((m) => ({ ...m, id: m.id, title: `${m.name}｜我参与` })),
);

const formatSub = (item: any) => {
  const statusLabel = dictStore.findLabel(item.status || "");
  return `${item.planStartTime || ""}｜${item.description || ""}｜${statusLabel}`;
};

const goDetails = (item: any) => navigateToDetails(item.id);
</script>

<style lang="scss" scoped>
.list-wrapper { padding: 0; }
.card {
  padding: 32rpx;
  margin-top: 24rpx;
  background: #ffffff;
  border-radius: 32rpx;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.04);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.98);
  }
}
.card-title { font-size: 32rpx; font-weight: bold; color: #1a1a1a; margin-bottom: 16rpx; }
.card-sub { font-size: 26rpx; color: #909399; line-height: 1.5; }
.end-text { margin-top: 32rpx; font-size: 24rpx; color: #c0c4cc; text-align: center; }
</style>
