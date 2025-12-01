<template>
  <view class="page">
    <!-- 顶部标签页：报名信息 / 对局计分 / 比赛成绩 -->
    <view class="tabs">
      <view :class="['tab', active === 'info' ? 'tab-active' : '']" @click="active = 'info'">报名信息</view>
      <view :class="['tab', active === 'score' ? 'tab-active' : '']" @click="active = 'score'">对局计分</view>
      <view :class="['tab', active === 'result' ? 'tab-active' : '']" @click="active = 'result'">比赛成绩</view>
    </view>

    <!-- 报名信息 -->
    <view v-if="active === 'info'" class="card">
      <view class="card-title">报名信息</view>
      <view class="signup-list">
        <view v-for="p in players" :key="p.id" class="signup-item">
          <up-tag type="primary" :plain="true">{{ p.name }}</up-tag>
        </view>
      </view>
    </view>

    <!-- 对局计分 -->
    <view v-if="active === 'score'" class="score-list">
      <view v-for="(g, idx) in gamesOfMatch" :key="g.id" class="game-card">
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
        <up-tag type="info" :plain="true">全部 {{ gamesOfMatch.length }} 场</up-tag>
      </view>
    </view>

    <!-- 比赛成绩 -->
    <view v-if="active === 'result'" class="card">
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
import { onLoad } from "@dcloudio/uni-app";
import { useGameStore } from "@/store/modules/game";
import { usePlayerStore } from "@/store/modules/player";

const gameStore = useGameStore();
const playerStore = usePlayerStore();

const matchId = ref<string>("");
const active = ref<"info" | "score" | "result">("info");

onLoad(async (query) => {
  matchId.value = String((query as any)?.matchId || "");
  const tab = String((query as any)?.active || "info");
  active.value = ["info", "score", "result"].includes(tab) ? (tab as any) : "info";
  await playerStore.fetchList();
  await gameStore.fetchList();
});

const players = computed(() => playerStore.list.filter((p) => p.matchId === matchId.value));
const gamesOfMatch = computed(() => gameStore.list.filter((g) => g.matchId === matchId.value));

const startGame = (id: string) => {
  uni.showToast({ title: `开始比赛 ${id.slice(0, 6)}`, icon: "none" });
};
const recordScore = (id: string) => {
  uni.showToast({ title: `记录比分 ${id.slice(0, 6)}`, icon: "none" });
};

const results = computed(() => {
  // 占位：按玩家名称统计胜场（真实数据接入后替换）
  return players.value.map((p) => ({ name: p.name, win: 0 }));
});

const recalc = () => {
  uni.showToast({ title: "已重算", icon: "none" });
};
</script>

<style scoped lang="scss">
.page {
  box-sizing: border-box;
  width: 100vw;
  min-height: 100vh;
  padding: 24rpx;
  background: #f5f7fa;
}
.tabs {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
}
.tab {
  padding: 16rpx 24rpx;
  color: #333;
  background: #ffffff;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
}
.tab-active {
  color: #ff6b35;
  background: #fff7f3;
  border-color: #ff6b35;
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
.signup-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx 0;
}

.score-list {
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
