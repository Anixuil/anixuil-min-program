<!--
 * @Author: Anixuil
 * @Date: 2025-10-02 12:08:03
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-10-02 12:21:09
 * @Description: 加载状态组件
-->
<template>
  <up-transition :show="show" mode="fade-up">
    <div class="loading-status-wrapper">
      <up-toast ref="uToastRef"></up-toast>
    </div>
  </up-transition>
</template>

<script setup lang="ts">
const show = ref(false);
const uToastRef = ref();
const showToast = ({ message = "小羽狂飞中...", type = "loading", duration = -1 }) => {
  show.value = true;
  nextTick(() => {
    uToastRef.value.show({
      type: type,
      message: message,
      duration: duration,
    });
  });
};

const hideToast = () => {
  nextTick(() => {
    uToastRef.value.hide();
  });
  show.value = false;
};

defineExpose({
  showToast,
  hideToast,
});
</script>

<style scoped lang="scss">
.loading-status-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: #ffffff;
}
</style>
