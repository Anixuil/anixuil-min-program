<!--
 * @Author: Anixuil
 * @Date: 2025-10-03 10:53:41
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-10-03 10:59:21
 * @Description: 补充信息页面
-->
<template>
    <div class="complete-info-wrapper">
        <text>补充信息页面</text>
        
    </div>
</template>

<script setup lang="ts">
// 获取参数
const needType = ref<string>('')
onLoad((query: AnyObject | undefined) => {
    needType.value = query?.needType || ''
    console.log('needType', needType.value)
})
</script>

<style scoped lang="scss">
.complete-info-wrapper {
  width: 100vw;
  height: 100vh;
  background-color: #121826;
  box-sizing: border-box;
  padding: 32rpx;
}
</style>