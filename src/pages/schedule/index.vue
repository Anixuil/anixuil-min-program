<template><view><MatchDetailHost ref="matchHost" title="我的球局" @closed="list?.refresh()" /><MatchList ref="list" :suspended="!!matchHost?.isOpen" /><BmTabBar active="schedule" :hidden="!!matchHost?.isOpen" /></view></template>
<script setup lang="ts">
import BmTabBar from "@/components/badminton/BmTabBar.vue";
import { nextTick, ref } from "vue";
import { onShow, onPullDownRefresh, onReachBottom, onShareAppMessage } from "@dcloudio/uni-app";
import { BRAND_NAME } from "@/config/brand";
import MatchDetailHost from "@/components/badminton/MatchDetailHost.vue";
import { provideMatchPresentation } from "@/composables/useMatchPresentation";
import MatchList from "@/components/badminton/MatchList.vue";
const list = ref<InstanceType<typeof MatchList> | null>(null);
const matchHost = ref<InstanceType<typeof MatchDetailHost> | null>(null);
provideMatchPresentation(() => matchHost.value);
onReachBottom(() => list.value?.more());
onShow(async () => { await nextTick(); await list.value?.refresh(); });
onPullDownRefresh(async () => { try { await list.value?.refresh(); } finally { uni.stopPullDownRefresh(); } });
onShareAppMessage(() => matchHost.value?.share() || { title: BRAND_NAME, path: "/pages/index/index" });
</script>

