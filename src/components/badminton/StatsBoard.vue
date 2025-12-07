<template>
  <view class="board-card">
    <view class="card-header">
      <text class="card-title">积分排名</text>
      <text class="card-subtitle">LEADERBOARD</text>
    </view>
    
    <view class="rows">
      <view v-for="(r, index) in rows" :key="r.key" class="rank-row">
        <view class="rank-badge" :class="`rank-${index + 1}`">
          <text v-if="index < 3">{{ index + 1 }}</text>
          <text v-else class="normal-rank">{{ index + 1 }}</text>
        </view>
        
        <view class="player-info">
          <text class="name">{{ r.name }}</text>
          <view class="bar-container">
            <view class="win-bar" :style="{ width: `${getPercentage(r.win)}%` }" />
          </view>
        </view>
        
        <view class="win-count">
          <text class="count">{{ r.win }}</text>
          <text class="unit">胜</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useGameStore } from "@/store/modules/game";
import type { MatchGameItem } from "@/api/badminton";
import { computed } from "vue";

const props = defineProps<{ matchId: string }>();
const gameStore = useGameStore();

const rows = computed(() => {
  const list = gameStore.list.filter((g)=>g.matchId===props.matchId);
  const map = new Map<string,{ name: string; win: number }>();
  for (const g of list) {
    const a = (g.matchGamePlayers||[])[0];
    const b = (g.matchGamePlayers||[])[1];
    if (!a || !b) continue;
    const an = [a.player?.name||"", a.partner?.name||""].filter(Boolean).join("/");
    const bn = [b.player?.name||"", b.partner?.name||""].filter(Boolean).join("/");
    const aw = (a.score||0)>(b.score||0);
    const kwA = an||a.id;
    const kwB = bn||b.id;
    if (!map.has(kwA)) map.set(kwA,{ name: an||"未知", win: 0 });
    if (!map.has(kwB)) map.set(kwB,{ name: bn||"未知", win: 0 });
    if (aw) map.get(kwA)!.win += 1; else map.get(kwB)!.win += 1;
  }
  return Array.from(map.values()).sort((x,y)=>y.win-x.win);
});

const maxWins = computed(() => {
  if (rows.value.length === 0) return 1;
  return rows.value[0].win || 1;
});

const getPercentage = (wins: number) => {
  return (wins / maxWins.value) * 100;
};
</script>

<style scoped lang="scss">
$primary-color: #ff6b35;
$text-main: #1a1a1a;
$text-sub: #909399;

.board-card {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 10rpx 40rpx rgba(0,0,0,0.04);
}

.card-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 30rpx;
  border-bottom: 2rpx solid #f5f7fa;
  padding-bottom: 20rpx;

  .card-title {
    font-size: 30rpx;
    font-weight: bold;
    color: $text-main;
  }
  .card-subtitle {
    font-size: 18rpx;
    color: $text-sub;
    letter-spacing: 2rpx;
    margin-top: 4rpx;
  }
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.rank-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.rank-badge {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 24rpx;
  border-radius: 12rpx;
  background: #f0f2f5;
  color: $text-sub;
  font-family: 'DIN', sans-serif;
  
  &.rank-1 {
    background: linear-gradient(135deg, #ffd700, #fff2cc);
    color: #b8860b;
    box-shadow: 0 4rpx 10rpx rgba(255, 215, 0, 0.2);
  }
  &.rank-2 {
    background: linear-gradient(135deg, #e0e0e0, #f5f5f5);
    color: #7f7f7f;
  }
  &.rank-3 {
    background: linear-gradient(135deg, #cd7f32, #e6b996);
    color: #8b4513;
  }
}

.player-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  
  .name {
    font-size: 26rpx;
    color: $text-main;
    font-weight: bold;
  }
  
  .bar-container {
    width: 100%;
    height: 8rpx;
    background: #f5f7fa;
    border-radius: 4rpx;
    overflow: hidden;
    
    .win-bar {
      height: 100%;
      background: $primary-color;
      border-radius: 4rpx;
      transition: width 0.5s ease;
    }
  }
}

.win-count {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
  
  .count {
    font-size: 32rpx;
    font-family: 'DIN', sans-serif;
    font-weight: bold;
    color: $primary-color;
  }
  
  .unit {
    font-size: 20rpx;
    color: $text-sub;
  }
}
</style>
