<template>
  <view class="score-wrapper">
    <!-- 对局计分列表（关键节点：开始比赛/记录比分入口） -->
    <view v-for="(g, idx) in games" :key="g.id" class="game-card">
      <view class="game-header">
        <view class="index-dot">{{ idx + 1 }}</view>
        <text class="pk">PK</text>
      </view>
      <view class="game-actions">
        <up-button :customStyle="{ 'border-radius': '14rpx' }" text="开始比赛" @click="startGame(g.id)"></up-button>
        <up-button
          type="primary"
          :customStyle="{ 'border-radius': '14rpx' }"
          text="记录比分"
          @click="recordScore(g.id)"></up-button>
      </view>
    </view>
    <view class="score-footer">
      <up-tag type="info" :plain="true">全部 {{ games.length }} 场</up-tag>
    </view>
  </view>
</template>

<script setup lang="ts">
// 接收父组件传入的比赛ID（关键节点：数据过滤）
const props = defineProps<{ matchId: string }>();
import { useGameStore } from "@/store/modules/game";
const gameStore = useGameStore();

onMounted(async () => {
  await gameStore.fetchList();
});
const games = computed(() => gameStore.list.filter((g) => g.matchId === props.matchId));

const startGame = (id: string) => uni.showToast({ title: `开始比赛 ${id.slice(0, 6)}`, icon: "none" });
const recordScore = (id: string) => uni.showToast({ title: `记录比分 ${id.slice(0, 6)}`, icon: "none" });
</script>

<style scoped lang="scss">
.score-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.game-card {
  padding: 24rpx;
  background: #ffffff;
  border: 2rpx solid #d6ecff;
  border-radius: 16rpx;
  box-shadow: 0 6rpx 16rpx rgba(0, 153, 255, 0.1);
}
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12rpx;
}
.index-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
  font-size: 26rpx;
  color: #fff;
  background: #ff6b35;
  border-radius: 50%;
}
.pk {
  font-weight: 700;
  color: #ff6b35;
}
.game-actions {
  display: flex;
  gap: 16rpx;
}
.score-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 8rpx;
}
</style>
