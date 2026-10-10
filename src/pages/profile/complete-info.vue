<template><view class="bm-page bm-route-status" role="status"><view :style="sectionStyle(0, 'fade')"><BmBrand compact /></view><view :style="sectionStyle(1, 'fade')"><text class="bm-heading">正在打开个人资料…</text><text class="bm-muted">即将前往你的球场</text></view></view></template>
<script setup lang="ts">
import BmBrand from "@/components/badminton/BmBrand.vue";
import { onLoad } from "@dcloudio/uni-app";
import { usePageMotion } from "@/composables/useMotionState";
const { sectionStyle } = usePageMotion();
onLoad(() => uni.switchTab({ url: "/pages/profile/index" }));
</script>
