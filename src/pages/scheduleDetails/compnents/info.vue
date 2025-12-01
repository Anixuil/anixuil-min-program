<template>
  <view class="info-wrapper">
    <!-- 基本信息卡片（关键节点：时间与地点展示） -->
    <view class="card">
      <view class="card-title">基本信息</view>
      <view class="row">
        <text class="label">比赛时间</text>
        <input v-model="basicInfo.time" class="input" placeholder="添加比赛时间" />
      </view>
      <view class="row">
        <text class="label">比赛地点</text>
        <input v-model="basicInfo.place" class="input" placeholder="添加比赛地点" />
      </view>
    </view>

    <!-- 报名名单（关键节点：认领/取消认领） -->
    <view class="card">
      <view class="card-title">报名名单</view>
      <view class="signup-list">
        <view v-for="(p, i) in participants" :key="i" class="signup-item">
          <up-tag type="primary" :plain="true">{{ p.name }}</up-tag>
          <view class="btn-group">
            <button class="btn-mini" @click="claim(p.name)">认领</button>
            <button class="btn-mini alt" @click="unclaim(p.name)">取消认领</button>
            <button class="btn-mini danger" @click="removeParticipant(i)">删除</button>
          </view>
        </view>
      </view>
      <view class="actions">
        <button class="btn" @click="addParticipant">增加一组</button>
      </view>
    </view>

    <!-- 比赛规则（关键节点：规则维护） -->
    <view class="card">
      <view class="card-title">比赛规则</view>
      <view class="rule-list">
        <view v-for="(r, i) in rules" :key="i" class="rule-item">
          <up-tag type="success" :plain="true">{{ r || "待补充" }}</up-tag>
          <button class="btn-mini danger" @click="removeRule(i)">删除</button>
        </view>
      </view>
      <view class="actions">
        <button class="btn" @click="addRule">添加比赛规则</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
// 接收父组件传入的比赛ID（关键节点：数据关联）
const props = defineProps<{ matchId: string }>();

// 基本信息与本地编辑态
const basicInfo = reactive({ time: "", place: "" });
const participants = ref<{ name: string }[]>([]);
const rules = ref<string[]>([]);

// 认领/取消认领依赖 store（关键节点：数据来源）
import { usePlayerStore } from "@/store/modules/player";
import { useUserStore } from "@/store/modules/user";
import { useMatchStore } from "@/store/modules/match";
const playerStore = usePlayerStore();
const userStore = useUserStore();
const matchStore = useMatchStore();

onMounted(async () => {
  await playerStore.fetchList();
  const detail = await matchStore.fetchDetail(props.matchId);
  basicInfo.time = detail?.planStartTime || "";
  basicInfo.place = detail?.description || "";
  participants.value = playerStore.list.filter((p) => p.matchId === props.matchId).map((p) => ({ name: p.name }));
});

const addParticipant = () => participants.value.push({ name: "空位" });
const removeParticipant = (i: number) => participants.value.splice(i, 1);
const addRule = () => rules.value.push("");
const removeRule = (i: number) => rules.value.splice(i, 1);

const claim = async (name: string) => {
  const p = playerStore.list.find((x) => x.matchId === props.matchId && x.name === name);
  if (!p) {
    uni.showToast({ title: "选手未找到", icon: "none" });
    return;
  }
  const userId = String(userStore.userInfo?.userId || "");
  await playerStore.claim({ matchId: props.matchId, playerId: p.id, userId });
  uni.showToast({ title: "认领成功", icon: "success" });
};

const unclaim = async (name: string) => {
  const p = playerStore.list.find((x) => x.matchId === props.matchId && x.name === name);
  if (!p) {
    uni.showToast({ title: "选手未找到", icon: "none" });
    return;
  }
  await playerStore.unclaim({ matchId: props.matchId, playerId: p.id });
  uni.showToast({ title: "取消认领成功", icon: "success" });
};
</script>

<style scoped lang="scss">
.info-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.card {
  padding: 24rpx;
  background: #ffffff;
  border: 2rpx solid #ffe1d6;
  border-radius: 16rpx;
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 53, 0.12);
}
.card-title {
  padding-left: 12rpx;
  margin-bottom: 12rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: #000;
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
.signup-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.signup-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx;
  background: #fff7f3;
  border-radius: 12rpx;
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
.btn-group {
  display: flex;
  gap: 12rpx;
}
</style>
