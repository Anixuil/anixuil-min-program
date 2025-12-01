<template>
  <view class="ai-chat-wrapper">
    <view class="chat-input">
      <up-textarea v-model="text" placeholder="输入内容" />
    </view>
    <up-button @click="send" text="发送"></up-button>
    <view class="chat-output">
      <text>{{ output }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import AiAPI from "@/api/ai";

const text = ref("");
const output = ref("");

const send = async () => {
  const res = await AiAPI.deepseek({ model: "deepseek-reasoner", messages: [{ role: "user", content: text.value }] });
  output.value = JSON.stringify(res);
};
</script>

<style scoped lang="scss">
.ai-chat-wrapper {
  padding: 16rpx;
}
.chat-input {
  margin-bottom: 16rpx;
}
.chat-output {
  padding: 16rpx;
  margin-top: 16rpx;
  background: #f7f7f7;
  border-radius: 12rpx;
}
</style>
