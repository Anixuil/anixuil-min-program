<template><MatchDetailContent v-if="loaded" ref="content" :id="id" :invite="invite" @ready="markMatchReady(id)" /></template>
<script setup lang="ts">
import { nextTick, ref } from "vue";
import { onLoad, onShow, onHide, onShareAppMessage, onPullDownRefresh, onPageScroll, onResize } from "@dcloudio/uni-app";
import { BRAND_NAME } from "@/config/brand";
import { setResultShareMenu } from "@/utils/resultShare";
import MatchDetailContent from "@/components/badminton/MatchDetailContent.vue";
import { markMatchReady } from "@/composables/useMotion";
const content = ref<InstanceType<typeof MatchDetailContent> | null>(null);
const id = ref(""), invite = ref(""), loaded = ref(false);
onLoad(query => { setResultShareMenu(false); id.value = String(query?.id || query?.matchId || ""); invite.value = String(query?.invite || ""); loaded.value = true; });
onShow(async () => { await nextTick(); content.value?.resume(); });
onHide(() => content.value?.suspend());
onPageScroll(() => content.value?.invalidateShared());
onResize(() => content.value?.invalidateShared());
onPullDownRefresh(async () => { try { await content.value?.reload(); } finally { uni.stopPullDownRefresh(); } });
onShareAppMessage(() => content.value?.share() || { title: BRAND_NAME, path: "/pages/index/index" });
</script>
