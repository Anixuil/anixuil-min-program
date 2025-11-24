<template>
  <view class="mood-tracker-wrapper">
    <text class="mood-title">今天的心情如何？</text>
    <view class="mood-list">
      <view
        v-for="(mood, index) in moods"
        :key="index"
        class="mood-item"
        :class="selectedMood === index ? 'mood-item-selected' : ''"
        @click="selectMood(index)">
        <text class="mood-emoji">{{ mood.emoji }}</text>
        <text class="mood-label">{{ mood.label }}</text>
      </view>
    </view>
    <view v-if="selectedMood !== null" class="mood-message-wrapper">
      <text class="mood-message">{{ getMoodMessage() }}</text>
      <view class="mood-animation" :class="getAnimationClass()"></view>
    </view>
    <button
      class="mood-button"
      :class="selectedMood === null ? 'mood-button-disabled' : 'mood-button-active'"
      @click="saveMood"
      :disabled="selectedMood === null">
      记录心情
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";

const moods = [
  { emoji: "😊", label: "开心", color: "#FFD700", message: "阳光般灿烂的一天！" },
  { emoji: "😌", label: "平静", color: "#87CEEB", message: "平静安详的心情" },
  { emoji: "😔", label: "低落", color: "#6A5ACD", message: "每个人都会有不开心的时候" },
  { emoji: "😡", label: "生气", color: "#FF6347", message: "深呼吸，放松一下" },
  { emoji: "🤔", label: "思考", color: "#9370DB", message: "思考使人进步" },
];

const selectedMood = ref<number | null>(null);

const selectMood = (index: number) => {
  selectedMood.value = index;
};

const getMoodMessage = () => {
  if (selectedMood.value !== null) {
    return moods[selectedMood.value].message;
  }
  return "";
};

const getAnimationClass = () => {
  if (selectedMood.value === null) return "";

  const moodIndex = selectedMood.value;
  switch (moodIndex) {
    case 0:
      return "happy-animation";
    case 1:
      return "calm-animation";
    case 2:
      return "sad-animation";
    case 3:
      return "angry-animation";
    case 4:
      return "thinking-animation";
    default:
      return "";
  }
};

const saveMood = () => {
  if (selectedMood.value !== null) {
    uni.showToast({
      title: `已记录今日心情：${moods[selectedMood.value].label}`,
      icon: "success",
    });

    // 这里可以添加保存数据的逻辑
    // 例如：保存到本地存储或发送到服务器
  }
};
</script>

<style scoped lang="scss">
.mood-tracker-wrapper {
  padding: 30rpx;
  margin: 20rpx;
  background-color: #ffffff;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.mood-title {
  display: block;
  margin-bottom: 30rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: #000000;
  text-align: center;
}

.mood-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin-bottom: 40rpx;
}

.mood-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120rpx;
  padding: 20rpx;
  cursor: pointer;
  border-radius: 12rpx;
  transition: all 0.3s;

  .mood-emoji {
    margin-bottom: 10rpx;
    font-size: 50rpx;
  }

  .mood-label {
    font-size: 24rpx;
    color: #666666;
  }

  &.mood-item-selected {
    background-color: rgba(255, 107, 53, 0.1);
    border: 2rpx solid #ff6b35;
    transform: scale(1.1);

    .mood-label {
      font-weight: bold;
      color: #ff6b35;
    }
  }
}

.mood-message-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  margin-bottom: 30rpx;
  background-color: rgba(255, 107, 53, 0.05);
  border: 2rpx solid rgba(255, 107, 53, 0.2);
  border-radius: 12rpx;

  .mood-message {
    margin-bottom: 20rpx;
    font-size: 28rpx;
    color: #000000;
    text-align: center;
  }

  .mood-animation {
    width: 60rpx;
    height: 60rpx;
    margin: 20rpx 0;
    background-color: #ff6b35;
    border-radius: 50%;
  }
}

.mood-button {
  width: 100%;
  padding: 20rpx 40rpx;
  margin-top: 20rpx;
  font-size: 28rpx;
  border: none;
  border-radius: 10rpx;

  &.mood-button-active {
    color: #ffffff;
    background-color: #ff6b35;
  }

  &.mood-button-disabled {
    color: #cccccc;
    background-color: #f5f5f5;
    border: 2rpx solid #e0e0e0;
  }
}

/* 动画关键帧 */
@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes float {
  0% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10rpx);
  }

  100% {
    transform: translateY(0);
  }
}

@keyframes shrink {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.8);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-5rpx);
  }

  50% {
    transform: translateX(0);
  }

  75% {
    transform: translateX(5rpx);
  }

  100% {
    transform: translateX(0);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 应用动画 */
.happy-animation {
  background-color: #ff6b35;
  animation: pulse 1.5s infinite;
}

.calm-animation {
  background-color: #ff6b35;
  animation: float 3s infinite;
}

.sad-animation {
  background-color: #ff6b35;
  animation: shrink 2s infinite;
}

.angry-animation {
  background-color: #ff6b35;
  animation: shake 0.5s infinite;
}

.thinking-animation {
  background-color: #ff6b35;
  animation: rotate 3s infinite;
}
</style>
