<template>
  <section class="recipient-picker" aria-label="选择接收球友" :aria-busy="loading">
    <div class="recipient-heading"><strong>接收球友</strong><ElTag effect="plain" round>已选 {{ modelValue.length }} / {{ limit }} 位</ElTag></div>
    <p class="hint">按昵称或邮箱搜索，可跨页选择，最多选择 {{ limit }} 位球友。</p>
    <div v-if="modelValue.length" class="recipient-selected" aria-label="已选择的球友">
      <ElTag v-for="user in modelValue" :key="user.id" :closable="!disabled" effect="light" round @close="remove(user.id)">{{ displayName(user) }}</ElTag>
    </div>
    <div class="recipient-search">
      <ElInput v-model.trim="search" :prefix-icon="Search" aria-label="搜索接收球友的昵称或邮箱" placeholder="搜索昵称或邮箱" clearable :disabled="disabled || loading" @keydown.enter.prevent="load(1)" />
      <ElButton native-type="button" :disabled="disabled" :loading="loading" :icon="Search" @click="load(1)">查询</ElButton>
    </div>
    <State :loading="loading" :error="error" :empty="!options.length" @retry="load(page)" />
    <div v-if="!loading && !error && options.length" class="recipient-options">
      <ElCheckbox v-for="user in options" :key="user.id" :model-value="selectedIds.has(user.id)" :disabled="disabled || (!selectedIds.has(user.id) && modelValue.length >= limit)" class="recipient-option" :class="{ selected: selectedIds.has(user.id) }" @change="toggle(user)">
        <span><strong>{{ displayName(user) }}</strong><small v-if="user.email" class="cell-id">{{ user.email }}</small></span>
      </ElCheckbox>
    </div>
    <p v-if="modelValue.length >= limit" class="hint" role="status">已达到人数上限，可先移除已选球友再添加。</p>
    <Pager :total="total" :page="page" :size="pageSize" :busy="disabled || loading" @change="load" />
  </section>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { ElButton, ElCheckbox, ElInput, ElTag } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { message, query, request, type Page } from "../api";
import Pager from "./Pager.vue";
import State from "./State.vue";

interface Recipient { id: string; name: string; email?: string | null }
const props = defineProps<{ modelValue: Recipient[]; disabled?: boolean }>();
const emit = defineEmits<{ (event: "update:modelValue", value: Recipient[]): void }>();
const limit = 100, pageSize = 20;
const search = ref(""), loading = ref(false), error = ref(""), page = ref(1), total = ref(0), options = ref<Recipient[]>([]);
const selectedIds = computed(() => new Set(props.modelValue.map(user => user.id)));
let revision = 0;

function displayName(user: Recipient) { return user.name?.trim() || user.id; }
function remove(id: string) {
  if (!props.disabled) emit("update:modelValue", props.modelValue.filter(user => user.id !== id));
}
function toggle(user: Recipient) {
  if (props.disabled) return;
  if (selectedIds.value.has(user.id)) remove(user.id);
  else if (props.modelValue.length < limit) emit("update:modelValue", [...props.modelValue, { id: user.id, name: displayName(user) }]);
}
async function load(next = page.value) {
  if (props.disabled || loading.value) return;
  const ticket = ++revision;
  loading.value = true;
  error.value = "";
  try {
    const result = await request<Page<Recipient>>(`/admin/publication-recipients?${query({ page: next, pageSize, q: search.value })}`);
    if (ticket !== revision) return;
    options.value = result.list;
    total.value = result.total;
    page.value = next;
    const currentNames = new Map(result.list.map(user => [user.id, displayName(user)]));
    if (props.modelValue.some(user => currentNames.has(user.id) && currentNames.get(user.id) !== user.name)) {
      emit("update:modelValue", props.modelValue.map(user => ({ ...user, name: currentNames.get(user.id) || user.name })));
    }
  } catch (cause) {
    if (ticket === revision) error.value = message(cause);
  } finally {
    if (ticket === revision) loading.value = false;
  }
}
onMounted(() => load(1));
onBeforeUnmount(() => { revision++; });
</script>
<style scoped>
.recipient-picker { margin: 12px 0; padding: 18px; border: 1px solid var(--line); border-radius: 12px; }
.recipient-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 13px; }
.recipient-picker > .hint { margin: 10px 0; }
.recipient-selected { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
.recipient-selected :deep(.el-tag) { height: auto; min-height: 28px; padding-block: 4px; max-width: 100%; }
.recipient-selected :deep(.el-tag__content) { white-space: normal; overflow-wrap: anywhere; }
.recipient-search { display: flex; gap: 10px; margin-top: 16px; }
.recipient-search :deep(.el-input) { flex: 1; min-width: 0; }
.recipient-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 14px; }
.recipient-option { height: auto; align-items: flex-start; margin: 0; padding: 12px; border: 1px solid var(--line); border-radius: 8px; transition: background .16s, border-color .16s; }
.recipient-option.selected { background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-5); }
.recipient-option :deep(.el-checkbox__input) { margin-top: 3px; }
.recipient-option :deep(.el-checkbox__label) { min-width: 0; white-space: normal; overflow-wrap: anywhere; }
.recipient-option strong { font-weight: 600; }
.recipient-picker :deep(.state) { padding: 24px 12px; }
.recipient-picker :deep(.pager) { flex-wrap: wrap; padding: 14px 0 0; margin-top: 16px; }
@media (max-width: 600px) { .recipient-options { grid-template-columns: 1fr; } .recipient-picker { padding: 14px; } }
@media (prefers-reduced-motion: reduce) { .recipient-option { transition: none; } }
</style>
