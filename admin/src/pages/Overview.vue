<template>
  <section class="overview-page">
    <State :loading="loading" :error="error" @retry="load" />
    <template v-if="data && !loading && !error">
      <div class="overview-top">
        <div class="intro overview-intro">
          <span class="eyebrow">让球局有序，让热爱持续</span>
          <h2>球场动态，<br />一目了然。</h2>
          <p>已登记 <strong>{{ data.users }}</strong> 位球友<br /><strong>{{ data.drafts }}</strong> 条内容等待发布</p>
          <ElButton v-if="can(identity, 'bm:match:read')" tag="a" href="#matches" type="primary" :icon="ArrowRight">进入球局管理</ElButton>
          <span v-else class="intro-caption">从每场好球，看见热爱的发生。</span>
        </div>
        <div class="surface overview-chart">
          <div class="section-title"><h3>近 14 天新建球局</h3><span class="muted">北京时间 · 场</span></div>
          <AdminChart :option="trendOption" :label="trendLabel" :empty="!Array.isArray(data.trend)" empty-text="趋势数据暂不可用" :height="260" />
          <p class="hint">按创建日期统计，不代表当日开赛场次。无记录的日期计为 0 场。</p>
          <ElCollapse v-if="Array.isArray(data.trend)" class="chart-data-disclosure">
            <ElCollapseItem title="查看每日精确数据" name="trend-data">
              <ElTable :data="days" size="small" :max-height="270" stripe>
                <ElTableColumn prop="day" label="日期（北京时间）" min-width="170" />
                <ElTableColumn prop="count" label="新建球局 / 场" min-width="130" align="right" />
              </ElTable>
            </ElCollapseItem>
          </ElCollapse>
        </div>
      </div>
      <div class="overview-bottom">
        <div class="surface overview-chart">
          <div class="section-title">
            <h3>状态分布</h3>
            <ElLink v-if="can(identity, 'bm:match:read')" href="#matches" type="primary">查看球局<ElIcon><ArrowRight /></ElIcon></ElLink>
          </div>
          <ElRadioGroup v-model="distributionKind" size="small" aria-label="状态分布统计对象" class="distribution-switch">
            <ElRadioButton value="matches">球局</ElRadioButton>
            <ElRadioButton value="games">对局</ElRadioButton>
          </ElRadioGroup>
          <AdminChart :option="distributionOption" :label="distributionLabel" :empty="!distributionRows.length || distributionRows.every(row => row.count === 0)" :empty-text="distributionUnavailable ? '状态数据暂不可用' : `暂无${distributionKind === 'matches' ? '球局' : '对局'}记录`" :height="245" />
          <ul v-if="distributionRows.length" class="status-key" :aria-label="`${distributionKind === 'matches' ? '球局' : '对局'}状态数量`">
            <li v-for="(row, index) in distributionRows" :key="row.status">
              <i :style="{ background: chartColors[index % chartColors.length] }" aria-hidden="true" /><span>{{ label(row.status) }}</span><strong>{{ row.count }}</strong>
            </li>
          </ul>
        </div>
        <div class="surface overview-chart">
          <div class="section-title">
            <h3>助威结算</h3>
            <ElLink v-if="can(identity, 'bm:points:read')" href="#orders" type="primary">查看明细<ElIcon><ArrowRight /></ElIcon></ElLink>
          </div>
          <AdminChart :option="ordersOption" :label="ordersLabel" :empty="!data.orders?.length" :empty-text="Array.isArray(data.orders) ? '暂无助威记录' : '助威数据暂不可用'" :height="250" />
          <ElTable v-if="data.orders?.length" :data="data.orders" size="small" class="settlement-table">
            <ElTableColumn label="状态" min-width="108"><template #default="{ row }">{{ label(row.status) }}</template></ElTableColumn>
            <ElTableColumn prop="count" label="订单数" min-width="85" align="right" />
            <ElTableColumn prop="points" label="投入积分" min-width="100" align="right" />
            <ElTableColumn prop="settledReturn" label="已返积分" min-width="100" align="right" />
          </ElTable>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElButton, ElCollapse, ElCollapseItem, ElIcon, ElLink, ElRadioButton, ElRadioGroup, ElTable, ElTableColumn } from "element-plus";
import { ArrowRight } from "@element-plus/icons-vue";
import { can, request, message, label, type Identity } from "../api";
import State from "../components/State.vue";
import AdminChart from "../components/AdminChart.vue";
import type { AdminChartOption } from "../charts";

interface StatusCount { status: string; count: number }
interface Overview {
  users: number;
  drafts: number;
  matches: StatusCount[];
  games: StatusCount[];
  orders: { status: string; count: number; points: number; settledReturn: number }[];
  trend: { day: string; count: number }[];
}

defineProps<{ identity: Identity }>();
const data = ref<Overview>(), loading = ref(false), error = ref("");
const distributionKind = ref<"matches" | "games">("matches");
const loadedAt = ref(Date.now());
const chartColors = ["#e98842", "#244a3b", "#90b9a2", "#cfb27d", "#7b8885", "#bd6958"];
const days = computed(() => Array.from({ length: 14 }, (_, i) => {
  const day = new Date(loadedAt.value + 8 * 3600000 - (13 - i) * 86400000).toISOString().slice(0, 10);
  const recorded = data.value?.trend?.find(row => row.day === day);
  return { day, count: recorded ? recorded.count : 0 };
}));
const distributionUnavailable = computed(() => !Array.isArray(data.value?.[distributionKind.value]));
const distributionRows = computed(() => data.value?.[distributionKind.value] ?? []);
const trendLabel = computed(() => `近 14 天新建球局，按北京时间创建日期统计。${days.value.map(row => `${row.day}：${row.count} 场`).join("；")}`);
const distributionLabel = computed(() => `${distributionKind.value === "matches" ? "球局" : "对局"}状态分布：${distributionRows.value.map(row => `${label(row.status)} ${row.count}`).join("；")}`);
const ordersLabel = computed(() => `助威结算：${data.value?.orders?.map(row => `${label(row.status)}，${row.count} 笔订单，投入 ${row.points} 积分，已返 ${row.settledReturn} 积分`).join("；") || "暂无记录"}`);
const trendOption = computed<AdminChartOption>(() => ({
  color: [chartColors[0]],
  grid: { top: 30, right: 14, bottom: 35, left: 42, containLabel: true },
  tooltip: { trigger: "axis", confine: true, axisPointer: { type: "shadow" } },
  xAxis: { type: "category", data: days.value.map(row => row.day), axisTick: { show: false }, axisLine: { show: false }, axisLabel: { formatter: (value: string) => value.slice(5), color: "#6c7b73", interval: "auto" } },
  yAxis: { type: "value", minInterval: 1, name: "场", axisLine: { show: false }, splitLine: { lineStyle: { color: "#edf0eb", type: "dashed" } } },
  series: [{ name: "新建球局", type: "bar", barMaxWidth: 22, itemStyle: { borderRadius: [5, 5, 0, 0] }, emphasis: { itemStyle: { color: "#c76c2c" } }, data: days.value.map(row => row.count) }],
}));
const distributionOption = computed<AdminChartOption>(() => ({
  color: chartColors,
  tooltip: { trigger: "item", confine: true, formatter: "{b}：{c}（{d}%）" },
  series: [{ name: distributionKind.value === "matches" ? "球局" : "对局", type: "pie", radius: ["50%", "76%"], center: ["50%", "50%"], avoidLabelOverlap: true, padAngle: 3, minAngle: 2, itemStyle: { borderRadius: 5 }, label: { show: false }, emphasis: { scaleSize: 4, label: { show: true, position: "center", formatter: "{b}\n{c}", fontSize: 17, fontWeight: 600, lineHeight: 26, color: "#244a3b" } }, data: distributionRows.value.map(row => ({ name: label(row.status), value: row.count })) }],
}));
const ordersOption = computed<AdminChartOption>(() => ({
  color: [chartColors[0], chartColors[1]],
  legend: { bottom: 0, icon: "roundRect", itemWidth: 12, itemHeight: 8 },
  grid: { top: 28, right: 14, bottom: 42, left: 18, containLabel: true },
  tooltip: { trigger: "axis", confine: true, axisPointer: { type: "shadow" } },
  xAxis: { type: "category", data: data.value?.orders?.map(row => label(row.status)) ?? [], axisTick: { show: false }, axisLine: { show: false }, axisLabel: { interval: 0 } },
  yAxis: { type: "value", name: "积分", minInterval: 1, splitLine: { lineStyle: { color: "#edf0eb", type: "dashed" } } },
  series: [
    { name: "投入积分", type: "bar", barMaxWidth: 25, itemStyle: { borderRadius: [4, 4, 0, 0] }, data: data.value?.orders?.map(row => row.points) ?? [] },
    { name: "已返积分", type: "bar", barMaxWidth: 25, itemStyle: { borderRadius: [4, 4, 0, 0] }, data: data.value?.orders?.map(row => row.settledReturn) ?? [] },
  ],
}));

async function load() {
  if (loading.value) return;
  loading.value = true;
  error.value = "";
  try {
    const result = await request<Overview>("/admin/overview");
    loadedAt.value = Date.now();
    data.value = result;
  } catch (e) { error.value = message(e); }
  finally { loading.value = false; }
}
onMounted(load);
</script>

<style scoped>
.overview-top { display: grid; grid-template-columns: minmax(230px, .7fr) minmax(0, 1.6fr); gap: 24px; }
.overview-bottom { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 24px; margin-top: 24px; }
.overview-chart { min-width: 0; padding: 24px; }
.overview-intro { display: flex; flex-direction: column; align-items: flex-start; justify-content: center; padding: 28px; background: #eaf0e6; border-radius: 20px; }
.overview-intro h2 { margin: 22px 0; font-size: clamp(28px, 2.7vw, 40px); line-height: 1.4; color: #244a3b; }
.overview-intro p { line-height: 1.95; margin-bottom: 28px; color: #53675a; }
.overview-intro strong { color: #244a3b; font-size: 20px; font-variant-numeric: tabular-nums; }
.intro-caption { font-size: 13px; color: #627267; }
.section-title { gap: 16px; flex-wrap: wrap; }
.section-title :deep(.el-link) { font-size: 12px; }
.section-title :deep(.el-link .el-icon) { margin-left: 5px; }
.distribution-switch { margin-top: 8px; }
.status-key { margin: 0; padding: 0; list-style: none; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 24px; }
.status-key li { display: flex; align-items: center; gap: 9px; color: #60746a; font-size: 13px; }
.status-key i { height: 8px; width: 8px; flex: none; border-radius: 3px; }
.status-key strong { margin-left: auto; color: #244a3b; font-variant-numeric: tabular-nums; }
.chart-data-disclosure { margin-top: 15px; --el-collapse-header-height: 38px; border-bottom: 0; }
.chart-data-disclosure :deep(.el-collapse-item__header) { font-size: 12px; color: #60746a; }
.chart-data-disclosure :deep(.el-collapse-item__content) { padding-bottom: 0; }
.settlement-table { margin-top: 18px; }
@media (max-width: 1100px) { .overview-bottom { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 960px) { .overview-top { grid-template-columns: minmax(0, 1fr); } .overview-intro { padding: 24px; } .overview-intro h2 { margin: 14px 0; } .overview-chart { padding: 20px 16px; } }
</style>
