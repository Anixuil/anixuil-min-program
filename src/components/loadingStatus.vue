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
const show = ref(false)
const uToastRef = ref()
const showToast = ({message = '小羽狂飞中...', type = 'loading', duration = -1}) => {
    show.value = true
    nextTick(() => {
        uToastRef.value.show({
            type: type,
            message: message,
            duration: duration,
        })
    })
}

const hideToast = () => {
    nextTick(() => {
        uToastRef.value.hide()
    })
    show.value = false
}

defineExpose({
    showToast,
    hideToast,
})
</script>

<style scoped lang="scss">
.loading-status-wrapper {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}
</style>