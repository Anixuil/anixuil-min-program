<template>
  <view class="page">
    <!-- 顶部：赛事标题与基本信息配置 -->
    <view class="card">
      <view class="card-title">{{ title }}</view>
      <view class="row">
        <text class="label">比赛时间</text>
        <input v-model="basicInfo.time" class="input" placeholder="添加比赛时间" />
      </view>
      <view class="row">
        <text class="label">比赛地点</text>
        <input v-model="basicInfo.place" class="input" placeholder="添加比赛地点" />
      </view>
    </view>

    <!-- 报名名单：可增减条目，每一组显示为卡片行 -->
    <view class="card">
      <view class="card-title">报名名单</view>
      <view class="signup-list">
        <view v-for="(p, i) in participants" :key="i" class="signup-item">
          <view class="name">{{ p.name }}</view>
          <button class="btn-mini" @click="removeParticipant(i)">删除</button>
        </view>
      </view>
      <view class="actions">
        <button class="btn" @click="addParticipant">增加一组</button>
      </view>
    </view>

    <!-- 比赛规则：数组形式，每条规则一行，可增删 -->
    <view class="card">
      <view class="card-title">比赛规则</view>
      <view class="rule-list">
        <view v-for="(r, i) in rules" :key="i" class="rule-item">
          <input v-model="rules[i]" class="input" placeholder="输入规则" />
          <button class="btn-mini" @click="removeRule(i)">删除</button>
        </view>
      </view>
      <view class="actions">
        <button class="btn" @click="addRule">添加比赛规则</button>
      </view>
    </view>

    <!-- 底部操作区：示例按钮 -->
    <view class="footer">
      <button class="btn-secondary">邀请报名</button>
      <button class="btn-primary">生成对阵</button>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

type Preset = { title: string; time: string; place: string; participants: string[]; rules: string[] };
const PRESETS: Record<string, Preset> = {
  A1: {
    title: "多人轮转赛｜11-20发布",
    time: "2025-10-01 10:00",
    place: "羽球馆A",
    participants: ["发财", "空位", "空位", "空位"],
    rules: ["每局 15 分", "轮转，每人至少一局"],
  },
  A2: {
    title: "双打淘汰赛｜11-21发布",
    time: "2025-10-02 10:00",
    place: "羽球馆B",
    participants: ["甲队", "乙队"],
    rules: ["三局两胜", "不得迟到"],
  },
  M1: {
    title: "俱乐部内部赛｜我发起",
    time: "2025-10-05 19:00",
    place: "俱乐部馆",
    participants: ["管理员", "成员A"],
    rules: ["内部赛仅限会员"],
  },
  J1: {
    title: "线上报名赛｜我参与",
    time: "2025-10-06 14:00",
    place: "羽球馆C",
    participants: ["本人", "队友"],
    rules: ["须提前 1 天确认"],
  },
};

const title = ref("赛事详情");
const basicInfo = reactive({ time: "", place: "" });
const participants = ref<{ name: string }[]>([{ name: "发财" }]);
const rules = ref<string[]>([]);

onLoad((query) => {
  const id = (query && (query as any).id) as string | undefined;
  if (!id) return;
  const preset = PRESETS[id];
  if (!preset) return;
  title.value = preset.title;
  basicInfo.time = preset.time;
  basicInfo.place = preset.place;
  participants.value = preset.participants.map((name) => ({ name }));
  rules.value = [...preset.rules];
});

const addParticipant = () => participants.value.push({ name: "空位" });
const removeParticipant = (i: number) => participants.value.splice(i, 1);
const addRule = () => rules.value.push("");
const removeRule = (i: number) => rules.value.splice(i, 1);
</script>

<style lang="scss" scoped>
.page {
  box-sizing: border-box;
  width: 100vw;
  min-height: 100vh;
  padding: 24rpx;
  background-color: #f5f5f5;
}

.card {
  padding: 24rpx;
  margin-bottom: 20rpx;
  background: #ffffff;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
}

.card-title {
  margin-bottom: 12rpx;
  font-size: 30rpx;
  font-weight: 500;
  color: #000000;
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
  background: #f7f7f7;
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
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
}

.btn-mini {
  padding: 12rpx 20rpx;
  background: #ffffff;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
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
</style>
