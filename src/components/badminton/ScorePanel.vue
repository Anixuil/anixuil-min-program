<template>
  <up-popup :show="show" mode="bottom" :round="24" @close="onClose" bgColor="#ffffff">
    <view class="panel">
      <view class="panel-header">
        <text class="title">录入比分</text>
        <view class="close-btn" @click="onClose">
          <up-icon name="close" color="#909399" size="20" />
        </view>
      </view>

      <view v-if="game && game.matchGamePlayers" class="sides-container">
        <view class="vs-label">选择获胜方 / 录入得分</view>
        <view class="sides">
          <view 
            v-for="p in game.matchGamePlayers" 
            :key="p.id" 
            class="side-card" 
            :class="{ active: selected === p.id }" 
            @click="selected = p.id"
          >
            <view class="check-icon">
              <up-icon name="checkmark" color="#fff" size="12" v-if="selected === p.id" />
            </view>
            <view class="names">
              <text class="name">{{ p.player?.name }}</text>
              <text v-if="p.partner?.name" class="name">/{{ p.partner?.name }}</text>
            </view>
            <view class="current-score">
              <text class="label">当前得分</text>
              <text class="value">{{ p.score ?? 0 }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="input-section">
        <view class="input-label">本局得分</view>
        <view class="input-wrapper">
          <up-input 
            v-model="inputScore" 
            type="number" 
            placeholder="请输入分数" 
            border="none"
            :customStyle="{ height: '100rpx', fontSize: '40rpx', fontWeight: 'bold', textAlign: 'center' }"
          />
        </view>
      </view>

      <view class="actions">
        <button class="submit-btn" :class="{ disabled: !canSubmit }" @click="submit">确认提交</button>
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import { useGameStore } from "@/store/modules/game";
import type { MatchGameItem } from "@/api/badminton";
import { ref, computed } from "vue";

const props = defineProps<{ show: boolean; game: MatchGameItem | null }>();
const emit = defineEmits(["close","submitted"]);

const gameStore = useGameStore();

const selected = ref<string>("");
const inputScore = ref<string>("");

const canSubmit = computed(() => !!props.game && !!selected.value && !!inputScore.value);

const onClose = () => emit("close");

const submit = async () => {
  if (!props.game) return;
  const n = Number(inputScore.value);
  if (!selected.value || Number.isNaN(n)) return;
  await gameStore.registerScore({ matchGameId: props.game.id, matchGamePlayerId: selected.value, score: n });
  emit("submitted");
  // Reset
  inputScore.value = "";
  selected.value = "";
};
</script>

<style scoped lang="scss">
$primary-color: #ff6b35;

.panel {
  padding: 40rpx 40rpx calc(40rpx + constant(safe-area-inset-bottom));
  padding: 40rpx 40rpx calc(40rpx + env(safe-area-inset-bottom));
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  
  .title {
    font-size: 36rpx;
    font-weight: 900;
    color: #1a1a1a;
  }
}

.vs-label {
  font-size: 24rpx;
  color: #909399;
  margin-bottom: 20rpx;
}

.sides {
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.side-card {
  flex: 1;
  background: #f8f9fc;
  border: 2rpx solid transparent;
  border-radius: 24rpx;
  padding: 24rpx;
  position: relative;
  transition: all 0.3s;
  
  &.active {
    background: #fff7f3;
    border-color: $primary-color;
    box-shadow: 0 8rpx 20rpx rgba(255, 107, 53, 0.1);
    
    .check-icon {
      background: $primary-color;
      transform: scale(1);
    }
    
    .current-score .value {
      color: $primary-color;
    }
  }
  
  .check-icon {
    position: absolute;
    top: -12rpx;
    right: -12rpx;
    width: 36rpx;
    height: 36rpx;
    border-radius: 50%;
    background: #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(0);
    transition: all 0.3s;
  }
  
  .names {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-bottom: 16rpx;
    min-height: 80rpx;
    
    .name {
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
    }
  }
  
  .current-score {
    display: flex;
    flex-direction: column;
    
    .label {
      font-size: 20rpx;
      color: #909399;
    }
    .value {
      font-size: 40rpx;
      font-family: 'DIN', sans-serif;
      font-weight: bold;
      color: #606266;
    }
  }
}

.input-section {
  margin-bottom: 40rpx;
  
  .input-label {
    font-size: 28rpx;
    font-weight: bold;
    color: #1a1a1a;
    margin-bottom: 16rpx;
  }
  
  .input-wrapper {
    background: #f5f7fa;
    border-radius: 24rpx;
    padding: 10rpx;
  }
}

.submit-btn {
  background: linear-gradient(135deg, $primary-color, #e85a2a);
  color: #fff;
  height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10rpx 20rpx rgba(255, 107, 53, 0.3);
  transition: all 0.3s;
  
  &::after { border: none; }
  
  &.disabled {
    opacity: 0.5;
    background: #ccc;
    box-shadow: none;
  }
}
</style>
