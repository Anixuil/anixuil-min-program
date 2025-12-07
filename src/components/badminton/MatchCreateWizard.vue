<template>
  <up-popup :show="show" mode="bottom" :round="12" @close="close">
    <view class="wizard">
      <view class="title">创建比赛</view>
      <view v-if="step===1" class="form">
        <up-input v-model="form.name" placeholder="比赛名称" clearable />
        <up-input v-model="form.description" placeholder="比赛描述" clearable />
        <up-datetime-picker v-model="form.planStartTime" mode="datetime" />
        <up-datetime-picker v-model="form.planEndTime" mode="datetime" />
        <up-radio-group v-model="form.type">
          <up-radio name="single">单打</up-radio>
          <up-radio name="double">双打</up-radio>
        </up-radio-group>
        <view class="actions"><up-button type="primary" text="下一步" :disabled="!canNext" @click="step=2"/></view>
      </view>
      <view v-else class="form">
        <view class="sub-title">批量导入选手</view>
        <view class="players">
          <view v-for="(p,i) in players" :key="i" class="player-row">
            <up-input v-model="p.name" placeholder="选手名称" clearable />
            <up-button text="删除" @click="remove(i)" />
          </view>
        </view>
        <view class="row-actions" style="display: flex; gap: 10rpx;">
          <up-button text="添加选手" @click="add" />
          <up-button text="从历史选择" type="warning" @click="openHistory" />
        </view>
        <view class="actions">
          <up-button text="上一步" @click="step=1" />
          <up-button type="primary" :loading="loading" :disabled="!canSubmit" text="创建比赛" @click="submit" />
        </view>
      </view>
    </view>
  </up-popup>

  <!-- 历史选手选择弹窗 -->
  <up-popup :show="historyShow" mode="bottom" :round="12" @close="historyShow=false">
    <view class="wizard">
      <view class="title">选择历史选手</view>
      <scroll-view scroll-y style="max-height: 60vh;">
        <view v-if="historyLoading" style="padding: 20rpx; text-align: center;">加载中...</view>
        <view v-else-if="historyList.length === 0" style="padding: 20rpx; text-align: center;">暂无历史选手</view>
        <view v-else class="history-list">
          <view 
            v-for="(item, index) in historyList" 
            :key="index" 
            class="history-item"
            @click="selectHistory(item)"
          >
            <text>{{ item.name }}</text>
            <up-icon name="plus" color="#2979ff"></up-icon>
          </view>
        </view>
      </scroll-view>
      <view class="actions">
        <up-button text="关闭" @click="historyShow=false" />
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { useMatchStore } from "@/store/modules/match";
import { usePlayerStore } from "@/store/modules/player";
import { useGameStore } from "@/store/modules/game";
import BadmintonAPI from "@/api/badminton";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits(["close","created"]);

const matchStore = useMatchStore();
const playerStore = usePlayerStore();
const gameStore = useGameStore();

const step = ref(1);
const loading = ref(false);
const form = reactive({ name: "", description: "", planStartTime: "", planEndTime: "", type: "single", status: "notStart" });
// 改造 players 为对象数组，包含 userId 以便绑定
const players = ref<Array<{ name: string; userId?: string }>>([]);

const canNext = computed(() => !!form.name && !!form.planStartTime && !!form.planEndTime);
const canSubmit = computed(() => players.value.length>0);

const close = () => emit("close");
const add = () => players.value.push({ name: "" });
const remove = (i: number) => players.value.splice(i,1);

// 历史选手相关逻辑
const historyShow = ref(false);
const historyLoading = ref(false);
const historyList = ref<any[]>([]);

const openHistory = async () => {
  historyShow.value = true;
  historyLoading.value = true;
  try {
    const res = await BadmintonAPI.historyPlayer();
    // 假设返回的是选手对象列表，根据API文档暂无数据，这里做兼容处理
    // 如果是字符串数组则转对象，如果是对象则直接使用
    if (Array.isArray(res)) {
      historyList.value = res.map(item => {
        if (typeof item === 'string') return { name: item };
        return item;
      });
    }
  } catch (e) {
    console.error(e);
    uni.showToast({ title: "获取历史选手失败", icon: "none" });
  } finally {
    historyLoading.value = false;
  }
};

const selectHistory = (item: any) => {
  // 检查是否已存在（可选，这里不做严格限制，允许重复添加）
  players.value.push({
    name: item.name,
    userId: item.userId // 仅使用明确的 userId，避免混淆
  });
  uni.showToast({ title: `已添加 ${item.name}`, icon: "none" });
};

const submit = async () => {
  loading.value = true;
  const ok = await matchStore.createMatch({ name: form.name, description: form.description, planStartTime: form.planStartTime, planEndTime: form.planEndTime, status: form.status });
  if (!ok) { loading.value=false; return; }
  await matchStore.fetchList();
  const m = matchStore.list.find((x)=>x.name===form.name && x.planStartTime===form.planStartTime);
  if (!m) { loading.value=false; return; }
  if (players.value.length) {
    // 传递 matchId, name 和 userId
    await playerStore.batchCreate(players.value.map((p)=>({ matchId: m.id, name: p.name, userId: p.userId })));
  }
  await gameStore.createByMode(m.id);
  await gameStore.fetchList();
  loading.value = false;
  emit("created");
};
</script>

<style scoped lang="scss">
.wizard{padding:24rpx}
.title{font-size:30rpx;font-weight:600;margin-bottom:12rpx}
.sub-title{font-size:28rpx;margin-bottom:12rpx}
.form{display:flex;flex-direction:column;gap:12rpx}
.players{display:flex;flex-direction:column;gap:8rpx}
.player-row{display:flex;gap:8rpx}
.row-actions{margin-top:8rpx}
.actions{display:flex;gap:12rpx;margin-top:12rpx}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  padding: 10rpx 0;
}
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  &:active {
    background-color: #e0e0e0;
  }
}
</style>
