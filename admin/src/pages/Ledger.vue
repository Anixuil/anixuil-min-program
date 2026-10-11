<template>
  <section class="surface table-surface">
    <form class="toolbar" @submit.prevent="load(1)">
      <ElInput v-if="kind !== 'check-ins'" v-model.trim="search" :prefix-icon="Search" :placeholder="kind === 'orders' ? '搜索球局名称' : kind === 'logs' ? '搜索操作名称' : '搜索流水说明'" aria-label="搜索" clearable />
      <ElInput v-model.trim="userName" placeholder="用户昵称（可选）" aria-label="用户昵称" clearable />
      <ElInput v-if="kind !== 'check-ins'" v-model.trim="matchName" placeholder="球局名称（可选）" aria-label="球局名称" clearable />
      <ElSelect v-if="kind === 'orders'" v-model="status" aria-label="订单状态"><ElOption value="" label="全部状态" /><ElOption v-for="s in ['pending', 'won', 'lost', 'refunded']" :key="s" :value="s" :label="label(s)" /></ElSelect>
      <ElButton native-type="submit" type="primary" :loading="loading" :icon="Search">查询</ElButton>
    </form>
    <State :loading="loading" :error="error" :empty="!rows.length" @retry="load(page)" />
    <ElTable v-if="!loading && !error && rows.length" :data="rows" row-key="id" table-layout="auto" class="data-table">
      <ElTableColumn v-for="column in columns" :key="column.key" :label="column.name" :min-width="column.key === 'createdAt' || column.key === 'signDate' ? 170 : 140"><template #default="{ row }">{{ displayValue(row[column.key], column.key, row) }}</template></ElTableColumn>
      <ElTableColumn label="详情" width="88" fixed="right"><template #default="{ row }"><ElButton link type="primary" @click="selected = row">查看</ElButton></template></ElTableColumn>
    </ElTable>
    <Pager :total="total" :page="page" :busy="loading" @change="load" />
    <Modal :open="!!selected" title="记录详情" wide @close="selected = null">
      <dl v-if="selected" class="record-details"><template v-for="field in recordDetails(selected)" :key="field.key"><dt>{{ field.name }}</dt><dd><pre>{{ field.value }}</pre></dd></template></dl>
      <p class="hint">流水与日志保留原始记录，关联信息优先展示名称。助威退款和重结算由球局操作自动完成。</p>
    </Modal>
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElButton, ElInput, ElOption, ElSelect, ElTable, ElTableColumn } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { label, request, query, message, type Page } from "../api";
import { displayValue, fieldNames, recordDetails } from "../display";
import Pager from "../components/Pager.vue";
import State from "../components/State.vue";
import Modal from "../components/Modal.vue";

const props = defineProps<{ kind: string }>();
const rows = ref<Record<string, unknown>[]>([]), selected = ref<Record<string, unknown> | null>(null);
const total = ref(0), page = ref(1), loading = ref(false), error = ref("");
const search = ref(""), userName = ref(""), matchName = ref(""), status = ref("");
const columns = computed(() => (props.kind === "orders"
  ? ["matchId", "userId", "propName", "points", "settledReturn", "status", "createdAt"]
  : props.kind === "logs" ? ["operation", "userId", "method", "createdAt"]
    : props.kind === "check-ins" ? ["userId", "pointsDate", "pointsAwarded", "signDate"]
      : ["userId", "kind", "delta", "balanceAfter", "description", "createdAt"]
).map(key => ({ key, name: key === "userId" ? "用户昵称" : fieldNames[key] })));

async function load(next = page.value) {
  if (loading.value) return;
  loading.value = true; error.value = "";
  try {
    const path = props.kind === "logs" ? "/admin/logs" : `/admin/ledger/${props.kind}`;
    const result = await request<Page<Record<string, unknown>>>(`${path}?${query({ page: next, q: search.value, userName: userName.value, matchName: matchName.value, status: status.value })}`);
    rows.value = result.list; total.value = result.total; page.value = next;
  } catch (e) { error.value = message(e); }
  finally { loading.value = false; }
}
onMounted(() => load(1));
</script>

