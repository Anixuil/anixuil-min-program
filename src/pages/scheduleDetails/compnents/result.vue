<template>
  <view class="result-wrapper">
    <!-- 比赛成绩表（关键节点：排行榜展示） -->
    <view class="card">
      <view class="card-title">比赛成绩</view>
      <view class="result-table">
        <view v-for="(r, i) in results" :key="r.name" class="result-row" :class="['rank-' + (i + 1)]">
          <text class="rank">{{ i + 1 }}</text>
          <text class="name">{{ r.name }}</text>
          <text class="score">{{ r.win }} 胜</text>
        </view>
      </view>
      <view class="result-actions">
        <up-button text="重算" @click="recalc"></up-button>
        <up-button text="分享比赛"></up-button>
        <up-button type="primary" text="成绩海报"></up-button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 接收父组件传入的比赛ID（关键节点：数据过滤）
const props = defineProps<{ matchId: string }>();
import { usePlayerStore } from "@/store/modules/player";
const playerStore = usePlayerStore();

onMounted(async () => {
  await playerStore.fetchList();
});

const players = computed(() => playerStore.list.filter((p) => p.matchId === props.matchId));
const results = computed(() => players.value.map((p) => ({ name: p.name, win: 0 })));
const recalc = () => uni.showToast({ title: "已重算", icon: "none" });
</script>

<style scoped lang="scss">
.result-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.card {
  padding: 24rpx;
  background: #ffffff;
  border: 2rpx solid #ffe1d6;
  border-radius: 16rpx;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 53, 0.12);
}
.card-title {
  margin-bottom: 12rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #000;
}
.result-table {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.result-row {
  display: grid;
  grid-template-columns: 60rpx 1fr 120rpx;
  align-items: center;
  padding: 16rpx;
  background: #ffffff;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
}
.rank-1 {
  background: linear-gradient(90deg, #fff1f0, #ffffff);
}
.rank-2 {
  background: linear-gradient(90deg, #fff7e6, #ffffff);
}
.rank-3 {
  background: linear-gradient(90deg, #e6f7ff, #ffffff);
}
.rank {
  font-weight: 700;
  color: #ff6b35;
}
.name {
  color: #333;
}
.score {
  color: #666;
  text-align: right;
}
.result-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}
</style>
