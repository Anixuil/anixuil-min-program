<template>
  <section class="surface table-surface users-page">
    <ElForm class="toolbar user-filters" :inline="true" @submit.prevent="load(1)">
      <ElFormItem label="球友">
        <ElInput v-model="search" placeholder="搜索昵称、邮箱" :prefix-icon="Search" :maxlength="100" clearable :disabled="loading" aria-label="搜索球友" />
      </ElFormItem>
      <ElFormItem label="账号状态">
        <ElSelect v-model="status" :disabled="loading" aria-label="账号状态" class="status-filter">
          <ElOption label="全部状态" value="" />
          <ElOption label="启用" value="enabled" />
          <ElOption label="停用" value="disabled" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem><ElButton native-type="submit" type="primary" :loading="loading" :icon="Search">查询</ElButton></ElFormItem>
    </ElForm>
    <ElAlert v-if="success" :title="success" type="success" show-icon :closable="true" class="result-alert" @close="success = ''" />
    <State :loading="loading" :error="error" :empty="!rows.length" @retry="load(page)" />
    <ElTable v-if="!loading && !error && rows.length" :data="rows" row-key="id" stripe class="users-table">
      <ElTableColumn label="球友" min-width="165">
        <template #default="{ row }"><strong class="player-name">{{ row.nickname?.trim() || row.id }}</strong></template>
      </ElTableColumn>
      <ElTableColumn label="邮箱" min-width="210" show-overflow-tooltip><template #default="{ row }">{{ row.email || '—' }}</template></ElTableColumn>
      <ElTableColumn label="登录方式" min-width="120"><template #default="{ row }">{{ row.wechatBound ? '微信已绑定' : '邮箱' }}</template></ElTableColumn>
      <ElTableColumn prop="balance" label="积分余额" min-width="115" align="right" />
      <ElTableColumn label="状态" min-width="100"><template #default="{ row }"><ElTag :type="row.disabled ? 'info' : 'success'" effect="light" round>{{ row.disabled ? '已停用' : '启用' }}</ElTag></template></ElTableColumn>
      <ElTableColumn label="注册时间" min-width="190"><template #default="{ row }">{{ date(row.createdAt) }}</template></ElTableColumn>
      <ElTableColumn label="操作" min-width="200" fixed="right">
        <template #default="{ row }">
          <div class="user-actions">
            <ElButton native-type="button" link type="primary" @click="open(row, 'stats')">战绩</ElButton>
            <ElButton v-if="can(identity, 'bm:user:write')" native-type="button" link type="primary" @click="open(row, 'edit')">管理</ElButton>
            <ElButton v-if="can(identity, 'bm:points:adjust')" native-type="button" link type="primary" @click="open(row, 'points')">调积分</ElButton>
          </div>
        </template>
      </ElTableColumn>
    </ElTable>
    <Pager :total="total" :page="page" :busy="loading" @change="load" />
    <Modal :open="!!selected" :title="`${selected?.nickname?.trim() || selected?.id || ''} · ${mode === 'stats' ? '个人战绩' : mode === 'points' ? '积分调整' : '账号管理'}`" :busy="busy" @close="close">
      <template v-if="selected">
        <template v-if="mode === 'stats'">
          <State :loading="statsLoading" :error="modalError" @retry="loadStats" />
          <template v-if="stats && !statsLoading && !modalError">
            <AdminChart :option="statsOption" :label="statsChartLabel" :empty="stats.gameCount === 0 || !hasWinLoss" :empty-text="stats.gameCount === 0 ? '还没有完成的对局' : '胜负数据暂不可用'" :height="250" />
            <ElDescriptions :column="2" border class="player-stats" title="战绩明细">
              <ElDescriptionsItem v-for="(value, key) in stats" :key="key" :label="statLabels[key] || key">{{ key === 'winRate' ? `${(value * 100).toFixed(1)}%` : value }}</ElDescriptionsItem>
            </ElDescriptions>
          </template>
        </template>
        <ElForm v-else :key="`${selected.id}-${mode}`" ref="editForm" :model="form" :rules="rules" :disabled="busy" label-position="top" @submit.prevent="save">
          <template v-if="mode === 'edit'">
            <ElFormItem label="昵称" prop="nickname"><ElInput v-model="form.nickname" :maxlength="80" show-word-limit autocomplete="off" /></ElFormItem>
            <ElFormItem label="账号状态">
              <ElCheckbox v-model="form.disabled" :disabled="selected.id === identity.userId">停用该球友的小程序账号</ElCheckbox>
              <p v-if="selected.id === identity.userId" class="hint field-hint">当前登录账号不能停用自身。</p>
            </ElFormItem>
          </template>
          <template v-else>
            <div class="balance-context"><span>当前余额</span><strong>{{ selected.balance }}</strong><span>积分</span></div>
            <ElFormItem label="调整数量" prop="delta">
              <ElInputNumber v-model="form.delta" :min="-100000" :max="100000" :step="1" :precision="0" controls-position="right" aria-label="调整数量，正数增加、负数扣减" />
              <p class="hint field-hint">正数增加、负数扣减；每次最多 100,000 积分。</p>
            </ElFormItem>
            <ElAlert title="变动将写入积分流水，扣减不能产生欠额。" type="info" :closable="false" show-icon class="points-notice" />
          </template>
          <ElFormItem label="操作原因" prop="reason"><ElInput v-model="form.reason" type="textarea" :rows="3" :maxlength="500" show-word-limit placeholder="请说明本次调整的原因，方便后续追溯" /></ElFormItem>
          <ElAlert v-if="modalError" :title="modalError" type="error" show-icon :closable="false" />
          <div class="form-actions">
            <ElButton native-type="button" :disabled="busy" @click="close">取消</ElButton>
            <ElButton native-type="submit" type="primary" :loading="busy">{{ busy ? '正在保存' : '确认保存' }}</ElButton>
          </div>
        </ElForm>
      </template>
    </Modal>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import {
  ElAlert, ElButton, ElCheckbox, ElDescriptions, ElDescriptionsItem, ElForm, ElFormItem,
  ElInput, ElInputNumber, ElOption, ElSelect, ElTable, ElTableColumn, ElTag,
  type FormInstance, type FormRules,
} from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { can, request, query, message, date, type Page, type Identity } from "../api";
import State from "../components/State.vue";
import Pager from "../components/Pager.vue";
import Modal from "../components/Modal.vue";
import AdminChart from "../components/AdminChart.vue";
import type { AdminChartOption } from "../charts";

interface User { id: string; nickname: string; email: string | null; wechatBound: boolean; disabled: boolean; balance: number; createdAt: string; updatedAt: string }
interface UserForm { nickname: string; disabled: boolean; delta: number | undefined; reason: string }
type Mode = "stats" | "edit" | "points";
const props = defineProps<{ identity: Identity }>();
const rows = ref<User[]>([]), selected = ref<User | null>(null), total = ref(0), page = ref(1);
const loading = ref(false), busy = ref(false), error = ref(""), modalError = ref(""), success = ref("");
const search = ref(""), status = ref(""), mode = ref<Mode>("edit");
const stats = ref<Record<string, number> | null>(null), statsLoading = ref(false);
const editForm = ref<FormInstance>();
const form = reactive<UserForm>({ nickname: "", disabled: false, delta: 100, reason: "" });
const rules: FormRules<UserForm> = {
  nickname: [{ required: true, whitespace: true, message: "请输入昵称", trigger: "blur" }, { max: 80, message: "昵称最多 80 个字符", trigger: "blur" }],
  reason: [{ required: true, whitespace: true, message: "请填写操作原因", trigger: "blur" }, { max: 500, message: "操作原因最多 500 个字符", trigger: "blur" }],
  delta: [{ validator: (_rule, value, done) => {
    if (typeof value !== "number" || !Number.isInteger(value) || value === 0 || value < -100000 || value > 100000) done(new Error("请输入 -100000 至 100000 之间的非零整数"));
    else done();
  }, trigger: ["blur", "change"] }],
};
let statsRevision = 0;
const statLabels: Record<string, string> = { matchCount: "参与球局", gameCount: "完成对局", wins: "胜场", losses: "负场", pointsFor: "总得分", pointsAgainst: "总失分", winRate: "胜率" };
const hasWinLoss = computed(() => !!stats.value && Number.isFinite(stats.value.wins) && Number.isFinite(stats.value.losses) && (stats.value.wins + stats.value.losses) > 0);
const statsChartLabel = computed(() => stats.value ? `个人战绩：${stats.value.gameCount} 场完成对局，胜 ${stats.value.wins} 场，负 ${stats.value.losses} 场。` : "个人战绩");
const statsOption = computed<AdminChartOption>(() => ({
  color: ["#e98842", "#244a3b"],
  tooltip: { trigger: "item", confine: true, formatter: "{b}：{c} 场（{d}%）" },
  legend: { bottom: 0, icon: "roundRect", itemWidth: 12, itemHeight: 8 },
  series: [{ name: "胜负分布", type: "pie", radius: ["47%", "72%"], center: ["50%", "44%"], padAngle: 3, itemStyle: { borderRadius: 5 }, label: { show: true, formatter: "{b} {c}", color: "#52675b" }, emphasis: { scaleSize: 4 }, data: [{ name: "胜场", value: stats.value?.wins ?? 0 }, { name: "负场", value: stats.value?.losses ?? 0 }] }],
}));

function close() {
  if (busy.value) return;
  statsRevision++;
  selected.value = null;
  statsLoading.value = false;
}

function open(row: User, action: Mode) {
  if (busy.value || (action === "edit" && !can(props.identity, "bm:user:write")) || (action === "points" && !can(props.identity, "bm:points:adjust"))) return;
  statsRevision++;
  statsLoading.value = false;
  selected.value = row;
  mode.value = action;
  Object.assign(form, { nickname: row.nickname || "", disabled: row.disabled, delta: 100, reason: "" });
  modalError.value = "";
  stats.value = null;
  if (action === "stats") void loadStats();
}

async function loadStats() {
  const id = selected.value?.id;
  if (!id || statsLoading.value) return;
  const ticket = ++statsRevision;
  statsLoading.value = true;
  modalError.value = "";
  try {
    const result = await request<Record<string, number>>(`/admin/users/${id}/stats`);
    if (ticket === statsRevision && selected.value?.id === id && mode.value === "stats") stats.value = result;
  } catch (e) {
    if (ticket === statsRevision && selected.value?.id === id && mode.value === "stats") modalError.value = message(e);
  } finally {
    if (ticket === statsRevision) statsLoading.value = false;
  }
}

async function load(next = page.value) {
  if (loading.value) return;
  loading.value = true;
  error.value = "";
  try {
    const result = await request<Page<User>>(`/admin/users?${query({ page: next, q: search.value.trim(), status: status.value })}`);
    rows.value = result.list;
    total.value = result.total;
    page.value = next;
  } catch (e) { error.value = message(e); }
  finally { loading.value = false; }
}

async function save() {
  if (busy.value || !selected.value || !editForm.value || mode.value === "stats") return;
  const permission = mode.value === "points" ? "bm:points:adjust" : "bm:user:write";
  if (!can(props.identity, permission)) { modalError.value = "当前账号没有执行此操作的权限。"; return; }
  busy.value = true;
  modalError.value = "";
  form.nickname = form.nickname.trim();
  form.reason = form.reason.trim();
  try {
    const valid = await editForm.value.validate().catch(() => false);
    if (!valid) return;
    const user = selected.value;
    if (mode.value === "points") {
      await request(`/admin/users/${user.id}/points`, "POST", { delta: form.delta, reason: form.reason });
    } else {
      if (form.disabled && user.id === props.identity.userId) { modalError.value = "不能停用当前登录账号。"; return; }
      await request(`/admin/users/${user.id}`, "PUT", { nickname: form.nickname, disabled: form.disabled, updatedAt: user.updatedAt, reason: form.reason });
    }
    selected.value = null;
    success.value = "操作已保存并记录日志。";
    await load();
  } catch (e) { modalError.value = message(e); }
  finally { busy.value = false; }
}

onMounted(() => load(1));
onBeforeUnmount(() => { statsRevision++; });
</script>

<style scoped>
.user-filters { row-gap: 6px; }
.user-filters :deep(.el-form-item) { margin-bottom: 0; }
.user-filters :deep(.el-input) { width: 230px; }
.status-filter { width: 145px; }
.result-alert { margin: 0 0 20px; }
.users-table { width: 100%; }
.player-name { color: #294536; font-weight: 600; overflow-wrap: anywhere; }
.user-actions { display: flex; flex-wrap: nowrap; gap: 15px; }
.user-actions :deep(.el-button + .el-button) { margin-left: 0; }
.balance-context { display: flex; align-items: baseline; gap: 8px; padding: 18px 20px; margin-bottom: 24px; border-radius: 14px; background: #f0f4eb; color: #607365; }
.balance-context strong { margin-left: auto; font-size: 28px; color: #244a3b; font-variant-numeric: tabular-nums; }
.field-hint { flex-basis: 100%; margin: 7px 0 0; line-height: 1.6; }
.points-notice { margin-bottom: 22px; }
.player-stats { margin-top: 20px; }
.player-stats :deep(.el-descriptions__label) { white-space: nowrap; }
@media (max-width: 600px) { .user-filters { display: flex; align-items: stretch; flex-direction: column; } .user-filters :deep(.el-form-item) { margin-right: 0; } .user-filters :deep(.el-input), .status-filter { width: 100%; } }
</style>
