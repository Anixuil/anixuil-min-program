<template>
  <view class="page">
    <!-- 顶部：赛事标题与三段内容 Tab -->
    <view class="page-title">{{ title }}</view>
    <view class="tabs">
      <view :class="['tab', active === 'info' ? 'tab-active' : '']" @click="active = 'info'">报名信息</view>
      <view :class="['tab', active === 'score' ? 'tab-active' : '']" @click="active = 'score'">对局计分</view>
      <view :class="['tab', active === 'result' ? 'tab-active' : '']" @click="active = 'result'">比赛成绩</view>
    </view>
    <view class="tab-content">
      <Info v-if="active === 'info'" :matchId="matchId" />
      <Score v-if="active === 'score'" :matchId="matchId" />
      <Result v-if="active === 'result'" :matchId="matchId" />
    </view>

    <!-- 底部操作区：示例按钮 -->
    <view class="footer">
      <button class="btn-secondary" @click="invite">邀请报名</button>
      <button class="btn-primary" @click="openConfirm">生成对阵</button>
    </view>

    <!-- 生成对阵确认弹窗（关键节点：对阵参数选择与确认） -->
    <up-modal
      :show="confirmShow"
      title="确认设置"
      @close="confirmShow = false"
      @confirm="confirmGenerate"
      confirmText="生成对阵"
      cancelText="取消">
      <view class="confirm-content">
        <view class="confirm-row">
          <text class="confirm-title">参与比赛人数：{{ participants.length }} 人</text>
        </view>
        <view class="confirm-row">
          <text class="confirm-subtitle">女生设置</text>
          <view class="confirm-options">
            <up-tag
              :type="femaleOpt === 'standard' ? 'primary' : 'info'"
              :plain="femaleOpt !== 'standard'"
              @click="femaleOpt = 'standard'">
              标准
            </up-tag>
            <up-tag
              :type="femaleOpt === 'avoid' ? 'primary' : 'info'"
              :plain="femaleOpt !== 'avoid'"
              @click="femaleOpt = 'avoid'">
              避免女双碰到男双
            </up-tag>
          </view>
        </view>
        <view class="confirm-row">
          <text class="confirm-subtitle">比赛局数</text>
          <view class="confirm-options">
            <up-tag :type="gameCount === 3 ? 'warning' : 'info'" :plain="gameCount !== 3" @click="gameCount = 3">
              3局
            </up-tag>
            <up-tag :type="gameCount === 6 ? 'warning' : 'info'" :plain="gameCount !== 6" @click="gameCount = 6">
              6局
            </up-tag>
            <up-tag :type="gameCount === 9 ? 'warning' : 'info'" :plain="gameCount !== 9" @click="gameCount = 9">
              9局
            </up-tag>
          </view>
        </view>
      </view>
    </up-modal>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useMatchStore } from "@/store/modules/match";
import { usePlayerStore } from "@/store/modules/player";
import { useGameStore } from "@/store/modules/game";
import Info from "@/pages/scheduleDetails/compnents/info.vue";
import Score from "@/pages/scheduleDetails/compnents/score.vue";
import Result from "@/pages/scheduleDetails/compnents/result.vue";

const matchStore = useMatchStore();
const playerStore = usePlayerStore();
const gameStore = useGameStore();

const matchId = ref<string>("");
const title = ref("赛事详情");
const active = ref<"info" | "score" | "result">("info");

const participants = computed(() => playerStore.list.filter((p) => p.matchId === matchId.value));

onLoad(async (query) => {
  const id = (query && (query as any).id) as string | undefined;
  if (!id) return;
  matchId.value = id;
  const detail = await matchStore.fetchDetail(id);
  title.value = detail?.name || "赛事详情";
  await playerStore.fetchList();
  await gameStore.fetchList();
});

const invite = async () => {
  uni.showToast({ title: "邀请已发送", icon: "success" });
};

// 确认弹窗与参数
const confirmShow = ref(false);
const femaleOpt = ref<"standard" | "avoid">("standard");
const gameCount = ref<number>(3);
const openConfirm = () => {
  confirmShow.value = true;
};
const confirmGenerate = async () => {
  confirmShow.value = false;
  // 根据选择的参数生成对阵（此处先使用比赛局数作为批量创建数量的参考）
  await gameStore.batchCreate(matchId.value, gameCount.value);
  // 切换到本页面的“对局计分”Tab
  active.value = "score";
};
</script>

<style lang="scss" scoped>
.page {
  box-sizing: border-box;
  width: 100vw;
  min-height: 100vh;
  padding: 24rpx;
  background-color: #f5f5f5;
}

.page-title {
  margin-bottom: 16rpx;
  font-size: 36rpx;
  font-weight: 700;
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
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.card {
  padding: 24rpx;
  margin-bottom: 20rpx;
  background: #ffffff;
  border: 2rpx solid #ffe1d6;
  border-radius: 16rpx;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 53, 0.12);
}

.card-title {
  padding-left: 12rpx;
  margin-bottom: 12rpx;
  font-size: 30rpx;
  font-weight: 500;
  color: #000000;
  background: linear-gradient(90deg, #fff7f3 0%, #ffffff 100%);
  border-left: 8rpx solid #ff6b35;
  border-radius: 8rpx;
}

.row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.label {
  width: 160rpx;
  color: #666;
}

.input {
  flex: 1;
  padding: 16rpx;
  font-size: 28rpx;
  background: #f7f7f7;
  border-radius: 12rpx;
}

.signup-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
  margin-bottom: 12rpx;
  background: #fff7f3;
  border-radius: 12rpx;
}

.name {
  color: #333;
}

.rule-item {
  display: flex;
  gap: 16rpx;
  align-items: center;
  margin-bottom: 12rpx;
}

.actions {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.btn {
  padding: 16rpx 24rpx;
  background: #ffffff;
  border: 2rpx solid #ffe1d6;
  border-radius: 12rpx;
}

.btn-mini {
  padding: 12rpx 20rpx;
  background: #ffffff;
  border: 2rpx solid #ffe1d6;
  border-radius: 12rpx;
}
.btn-mini.alt {
  border-color: #d6ecff;
}
.btn-mini.danger {
  border-color: #ffd6d6;
}

.footer {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 20rpx;
  padding: 16rpx;
  background: #f5f5f5;
}

.btn-secondary {
  flex: 1;
  padding: 20rpx;
  background: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
}

.btn-primary {
  flex: 1;
  padding: 20rpx;
  color: #fff;
  background: #ff6b35;
  border-radius: 16rpx;
}

/* 确认弹窗样式 */
.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.confirm-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.confirm-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #000000;
}
.confirm-subtitle {
  font-size: 28rpx;
  font-weight: 600;
  color: #333333;
}
.confirm-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
</style>
