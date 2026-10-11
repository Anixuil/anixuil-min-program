<template>
  <section class="surface table-surface">
    <form class="toolbar" @submit.prevent="load(1)">
      <ElInput v-model.trim="search" :prefix-icon="Search" placeholder="搜索标题" aria-label="搜索标题" clearable />
      <ElSelect v-model="status" aria-label="发布状态"><ElOption value="" label="全部状态" /><ElOption v-for="s in ['draft', 'published', 'withdrawn']" :key="s" :value="s" :label="label(s)" /></ElSelect>
      <ElButton native-type="submit" type="primary" :loading="loading" :icon="Search">查询</ElButton><span class="spacer" /><ElButton v-if="canWrite" native-type="button" type="primary" :icon="Plus" @click="edit()">新建内容</ElButton>
    </form>
    <ElAlert v-if="success" :title="success" type="success" show-icon :closable="false" />
    <State :loading="loading" :error="error" :empty="!rows.length" @retry="load(page)" />
    <ElTable v-if="rows.length && !loading && !error" :data="rows" row-key="id" class="data-table">
      <ElTableColumn label="标题" min-width="240"><template #default="{ row }"><strong>{{ row.title }}</strong><small class="cell-id">{{ row.pinned ? '置顶 · ' : '' }}{{ row.expiresAt ? `截止 ${date(row.expiresAt)}` : '长期有效' }}</small></template></ElTableColumn>
      <ElTableColumn label="类型" min-width="100"><template #default="{ row }">{{ label(row.kind) }}</template></ElTableColumn>
      <ElTableColumn label="接收范围" min-width="150"><template #default="{ row }">{{ row.audience === 'all' ? '全部球友' : `${row.recipientIds.length} 位指定球友` }}</template></ElTableColumn>
      <ElTableColumn label="状态" min-width="100"><template #default="{ row }"><ElTag :type="row.status === 'published' ? 'success' : row.status === 'draft' ? 'warning' : 'info'" effect="light">{{ label(row.status) }}</ElTag></template></ElTableColumn>
      <ElTableColumn prop="readCount" label="已读人数" min-width="100" />
      <ElTableColumn label="发布时间" min-width="170"><template #default="{ row }">{{ date(row.publishedAt) }}</template></ElTableColumn>
      <ElTableColumn label="操作" width="170" fixed="right"><template #default="{ row }"><div class="actions wrap"><ElButton link type="primary" @click="preview = row">预览</ElButton><template v-if="canWrite || can(identity, 'bm:publication:publish')"><ElButton v-if="canWrite && row.status === 'draft'" link type="primary" @click="edit(row)">编辑</ElButton><ElButton v-if="can(identity, 'bm:publication:publish') && row.status === 'draft'" link type="primary" @click="prepare(row, 'publish')">发布</ElButton><ElButton v-if="can(identity, 'bm:publication:publish') && row.status === 'published'" link type="danger" @click="prepare(row, 'withdraw')">撤回</ElButton></template></div></template></ElTableColumn>
    </ElTable>
    <Pager :page="page" :total="total" :busy="loading" @change="load" />
    <Modal :open="editorOpen" :title="editing ? '编辑草稿' : '新建公告或通知'" :busy="busy" wide @close="editorOpen = false">
      <form @submit.prevent="save">
        <div class="form-grid">
          <label class="field"><span>内容类型</span><ElSelect v-model="form.kind" :disabled="busy" aria-label="内容类型" @change="form.kind === 'announcement' && (form.audience = 'all')"><ElOption value="announcement" label="公告" /><ElOption value="notification" label="站内通知" /></ElSelect></label>
          <label class="field"><span>接收范围</span><ElSelect v-model="form.audience" :disabled="busy || form.kind === 'announcement'" aria-label="接收范围"><ElOption value="all" label="全部球友" /><ElOption value="users" label="指定球友" /></ElSelect></label>
          <label class="field span-2"><span>标题</span><ElInput v-model.trim="form.title" required maxlength="120" show-word-limit :disabled="busy" /></label>
          <label class="field span-2"><span>正文</span><ElInput v-model.trim="form.content" type="textarea" required maxlength="15000" :rows="9" show-word-limit :disabled="busy" placeholder="填写小程序消息中心展示的正文。支持换行。" /></label>
          <PublicationRecipients v-if="editorOpen && form.audience === 'users'" v-model="recipients" class="span-2" :disabled="busy" />
          <label class="field"><span>有效截止时间（可选）</span><ElInput v-model="form.expiresAt" type="datetime-local" :disabled="busy" /></label>
          <label class="field"><span>展示方式</span><ElSwitch v-model="form.pinned" :disabled="busy" active-text="在消息中心置顶" /></label>
        </div>
        <p class="hint">保存为草稿后可预览并发布。发布内容将出现在小程序消息中心；此处不发送微信订阅消息。</p>
        <ElAlert v-if="modalError" :title="modalError" type="error" show-icon :closable="false" />
        <div class="form-actions"><ElButton native-type="button" :disabled="busy" @click="editorOpen = false">取消</ElButton><ElButton native-type="submit" type="primary" :loading="busy">保存草稿</ElButton></div>
      </form>
    </Modal>
    <Modal :open="!!pending" :title="nextAction === 'publish' ? '确认发布' : '确认撤回'" :busy="busy" @close="pending = null">
      <form v-if="pending" @submit.prevent="publish">
        <h3>{{ pending.title }}</h3><p>{{ nextAction === 'publish' ? `发布后${pending.audience === 'all' ? '所有球友' : '指定球友'}可在消息中心看到此内容。` : '撤回后此内容将不再显示，已有阅读记录保留。' }}</p>
        <label class="field"><span>操作原因</span><ElInput v-model.trim="reason" type="textarea" required maxlength="500" :rows="3" show-word-limit :disabled="busy" /></label>
        <ElAlert v-if="modalError" :title="modalError" type="error" show-icon :closable="false" />
        <div class="form-actions"><ElButton native-type="button" :disabled="busy" @click="pending = null">返回</ElButton><ElButton native-type="submit" type="primary" :loading="busy">确认{{ nextAction === 'publish' ? '发布' : '撤回' }}</ElButton></div>
      </form>
    </Modal>
    <Modal :open="!!preview" title="内容预览" @close="preview = null"><article v-if="preview" class="publication-preview"><ElTag effect="plain">{{ label(preview.kind) }}</ElTag><h2>{{ preview.title }}</h2><small class="muted">{{ preview.publishedAt ? date(preview.publishedAt) : '尚未发布' }}</small><p class="hint">接收范围：{{ preview.audience === 'all' ? '全部球友' : recipientNames(preview).join('、') }}</p><p>{{ preview.content }}</p></article></Modal>
  </section>
</template>
<script setup lang="ts">
import { ElAlert, ElButton, ElInput, ElOption, ElSelect, ElSwitch, ElTable, ElTableColumn, ElTag } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";
import { computed, onMounted, reactive, ref } from "vue"; import { can, request, query, message, date, label, type Page, type Identity } from "../api"; import Modal from "../components/Modal.vue"; import Pager from "../components/Pager.vue"; import State from "../components/State.vue"; import PublicationRecipients from "../components/PublicationRecipients.vue";
interface Publication { id: string; kind: string; title: string; content: string; status: string; audience: string; recipientIds: string[]; recipients?: { id: string; name: string }[]; pinned: boolean; version: number; expiresAt: string | null; publishedAt: string | null; readCount: number }
const props = defineProps<{ identity: Identity }>(), canWrite = computed(() => can(props.identity, "bm:publication:write"));
const rows = ref<Publication[]>([]), total = ref(0), page = ref(1), loading = ref(false), error = ref(""), success = ref(""), search = ref(""), status = ref(""), busy = ref(false), editorOpen = ref(false), modalError = ref(""), editing = ref<Publication | null>(null), pending = ref<Publication | null>(null), preview = ref<Publication | null>(null), recipients = ref<{ id: string; name: string }[]>([]), nextAction = ref("publish"), reason = ref("");
const form = reactive({ kind: "announcement", title: "", content: "", audience: "all", pinned: false, expiresAt: "" });
function edit(row?: Publication) { editing.value = row || null; Object.assign(form, { kind: row?.kind || "announcement", title: row?.title || "", content: row?.content || "", audience: row?.audience || "all", pinned: row?.pinned || false, expiresAt: row?.expiresAt ? new Date(new Date(row.expiresAt).getTime() - new Date(row.expiresAt).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "" }); recipients.value = row ? row.recipientIds.map(id => ({ id, name: row.recipients?.find(user => user.id === id)?.name?.trim() || id })) : []; modalError.value = ""; editorOpen.value = true; }
function recipientNames(row: Publication) { return row.recipientIds.map(id => row.recipients?.find(user => user.id === id)?.name?.trim() || id); }
function prepare(row: Publication, action: string) { pending.value = row; nextAction.value = action; reason.value = ""; modalError.value = ""; }
async function load(next = page.value) { if (loading.value) return; loading.value = true; error.value = ""; try { const result = await request<Page<Publication>>(`/admin/publications?${query({ page: next, q: search.value, status: status.value })}`); rows.value = result.list; total.value = result.total; page.value = next; } catch (e) { error.value = message(e); } finally { loading.value = false; } }
async function save() { if (busy.value || !canWrite.value) return; if (!form.title.trim() || form.title.length > 120 || !form.content.trim() || form.content.length > 15000) { modalError.value = "请填写标题和正文，标题最多 120 字，正文最多 15000 字。"; return; } if (form.expiresAt && !Number.isFinite(new Date(form.expiresAt).getTime())) { modalError.value = "请选择有效的截止时间。"; return; } if (form.audience === "users" && (!recipients.value.length || recipients.value.length > 100)) { modalError.value = "请选择 1 至 100 位接收球友。"; return; } busy.value = true; modalError.value = ""; try { const data = { ...form, recipientIds: form.audience === "all" ? [] : [...new Set(recipients.value.map(user => user.id))], expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null }; await request(`/admin/publications${editing.value ? `/${editing.value.id}` : ""}`, editing.value ? "PUT" : "POST", { version: editing.value?.version || 0, data }); editorOpen.value = false; success.value = "草稿已保存，可预览后发布。"; await load(); } catch (e) { modalError.value = message(e); } finally { busy.value = false; } }
async function publish() { if (busy.value || !pending.value || !can(props.identity, "bm:publication:publish")) return; if (!reason.value.trim() || reason.value.length > 500) { modalError.value = "请填写 1–500 字的操作原因。"; return; } busy.value = true; modalError.value = ""; try { await request(`/admin/publications/${pending.value.id}/status`, "POST", { version: pending.value.version, action: nextAction.value, reason: reason.value }); pending.value = null; success.value = nextAction.value === "publish" ? "已发布到小程序消息中心。" : "内容已撤回。"; await load(); } catch (e) { modalError.value = message(e); } finally { busy.value = false; } } onMounted(() => load(1));
</script>



