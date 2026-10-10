<template><view class="bm-page bm-route-status" role="status"><view :style="sectionStyle(0, 'fade')"><BmBrand compact /></view><view :style="sectionStyle(1, 'fade')"><text class="bm-heading">正在打开球局…</text><text class="bm-muted">即将前往你的球场</text></view></view></template>
<script setup lang="ts">
import BmBrand from "@/components/badminton/BmBrand.vue";
import { onLoad } from "@dcloudio/uni-app";
import { usePageMotion } from "@/composables/useMotionState";
const { sectionStyle } = usePageMotion();
onLoad(query => { const id = String(query?.id || ""); if (id) uni.redirectTo({ url: `/pages/matchDetails/index?id=${encodeURIComponent(id)}` }); else uni.switchTab({ url: "/pages/schedule/index" }); });
</script>
