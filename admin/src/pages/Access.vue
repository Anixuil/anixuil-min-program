<template>
  <section>
    <ElTabs v-model="tab" class="tabs" aria-label="授权管理"><ElTabPane name="users" label="用户授权" /><ElTabPane name="roles" label="系统角色" /></ElTabs>
    <ElAlert v-if="success" :title="success" type="success" show-icon :closable="false" />
    <State :loading="loading" :error="error" @retry="load" />
    <div v-if="!loading && !error" class="surface table-surface">
      <template v-if="tab === 'users'">
        <form class="toolbar" @submit.prevent="load(1)"><ElInput v-model.trim="search" :prefix-icon="Search" placeholder="搜索昵称、邮箱或用户 ID" aria-label="搜索授权用户" clearable /><ElButton native-type="submit" type="primary" :loading="loading" :icon="Search">查询</ElButton><span class="spacer" /><p class="muted">同一账号可拥有多个角色，权限合并生效。</p></form>
        <ElTable :data="users" row-key="userId" class="data-table">
          <ElTableColumn label="用户" min-width="160"><template #default="{ row: user }"><strong>{{ user.name?.trim() || user.userId }}</strong></template></ElTableColumn>
          <ElTableColumn label="邮箱" min-width="200"><template #default="{ row: user }">{{ user.email || '—' }}</template></ElTableColumn>
          <ElTableColumn label="账号" width="90"><template #default="{ row: user }"><ElTag :type="user.disabled ? 'info' : 'success'" effect="light">{{ user.disabled ? '停用' : '启用' }}</ElTag></template></ElTableColumn>
          <ElTableColumn label="系统角色" min-width="220"><template #default="{ row: user }"><div class="actions wrap"><ElTag v-for="id in user.roleIds" :key="id" effect="plain">{{ roleName(id) }}</ElTag><span v-if="!user.roleIds.length" class="muted">未分配角色</span></div></template></ElTableColumn>
          <ElTableColumn label="操作" width="120" fixed="right"><template #default="{ row: user }"><ElButton v-if="writable && user.userId !== identity.userId" link type="primary" @click="editUser(user)">分配角色</ElButton><span v-else class="muted">{{ user.userId === identity.userId ? '当前账号' : '只读' }}</span></template></ElTableColumn>
        </ElTable>
        <Pager :page="page" :total="total" :busy="loading" @change="load" />
      </template>
      <template v-else>
        <div class="toolbar"><p class="muted">与 ani-server 共用角色和权限。修改会影响该角色的全部用户。</p><span class="spacer" /><ElButton v-if="writable" type="primary" :icon="Plus" @click="editRole()">新建角色</ElButton></div>
        <ElTable :data="roles" row-key="id" class="data-table">
          <ElTableColumn label="角色" min-width="220"><template #default="{ row: role }"><strong>{{ roleDisplayName(role) }}</strong></template></ElTableColumn>
          <ElTableColumn label="状态" width="100"><template #default="{ row: role }"><ElTag :type="role.enabled ? 'success' : 'info'" effect="light">{{ role.enabled ? '启用' : '停用' }}</ElTag></template></ElTableColumn>
          <ElTableColumn label="权限" min-width="140"><template #default="{ row: role }">{{ role.protected ? '全部权限' : `${role.permissionIds.length} 项` }}</template></ElTableColumn>
          <ElTableColumn label="操作" width="120" fixed="right"><template #default="{ row: role }"><ElButton link type="primary" @click="editRole(role)">{{ editable(role) ? '编辑权限' : '查看权限' }}</ElButton></template></ElTableColumn>
        </ElTable>
      </template>
    </div>
    <Modal :open="!!selectedUser" title="分配系统角色" :busy="busy" @close="selectedUser = null">
      <form v-if="selectedUser" @submit.prevent="saveUser">
        <h3>{{ selectedUser.name?.trim() || selectedUser.userId }}</h3><p class="hint">取消角色会撤销其权限；其他角色提供的权限仍然保留。</p>
        <ElCheckboxGroup v-model="selectedRoles" class="permission-options">
          <ElCheckbox v-for="role in roles" :key="role.id" :value="role.id" :disabled="busy || !grantable(role) || ((!role.enabled || selectedUser.disabled) && !selectedUser.roleIds.includes(role.id))"><span>{{ roleDisplayName(role) }}<small v-if="!role.enabled || !grantable(role)" class="cell-id">{{ [!role.enabled ? '已停用' : '', !grantable(role) ? '超出可授权范围' : ''].filter(Boolean).join(' · ') }}</small></span></ElCheckbox>
        </ElCheckboxGroup>
        <label class="field"><span>调整原因</span><ElInput v-model.trim="reason" type="textarea" required maxlength="500" :rows="3" show-word-limit :disabled="busy" /></label>
        <ElAlert v-if="modalError" :title="modalError" type="error" show-icon :closable="false" />
        <div class="form-actions"><ElButton native-type="button" :disabled="busy" @click="selectedUser = null">取消</ElButton><ElButton native-type="submit" type="primary" :loading="busy">保存角色分配</ElButton></div>
      </form>
    </Modal>
    <Modal :open="roleOpen" :title="roleReadonly ? '角色权限详情' : selectedRole ? '编辑系统角色' : '新建系统角色'" :busy="busy" wide @close="roleOpen = false">
      <form @submit.prevent="saveRole">
        <ElAlert v-if="roleReadonly" title="系统超级管理员角色、自身正在使用的角色及超出授权范围的角色在此只读。" type="info" show-icon :closable="false" />
        <div class="form-grid">
          <label v-if="roleReadonly && selectedRole" class="field"><span>角色名称</span><ElInput :model-value="roleDisplayName(selectedRole)" disabled /></label>
          <template v-else>
            <label class="field"><span>角色名称</span><ElInput v-model.trim="form.name" required maxlength="80" :disabled="busy" /></label>
            <label class="field"><span>角色编码</span><ElInput v-model.trim="form.code" required pattern="[a-z][a-z0-9:_-]{1,79}" maxlength="80" :disabled="busy" placeholder="例如 bm_scorer" /><small class="muted">以小写字母开头，可含数字、冒号、下划线和连字符。</small></label>
            <label class="field"><span>显示名称</span><ElInput v-model.trim="form.alias" maxlength="80" :disabled="busy" /></label>
          </template>
          <label class="field"><span>角色状态</span><ElSwitch v-model="form.enabled" :disabled="busy || roleReadonly" active-text="启用角色" /></label>
        </div>
        <p class="hint">进入后台需勾选「进入羽毛球管理后台」，业务操作还需对应查看权限。权限变更在下一次请求生效。</p>
        <ElAlert v-if="selectedRole?.protected" title="系统超级管理员角色自动拥有全部权限，无需逐项勾选。" type="success" show-icon :closable="false" />
        <fieldset v-for="group in groups" :key="group.name" class="permission-group"><legend>{{ group.name }}</legend><ElCheckboxGroup v-model="form.permissionIds" class="permission-options"><ElCheckbox v-for="permission in group.items" :key="permission.id" :value="permission.id" :disabled="busy || roleReadonly || !can(identity, permission.code)">{{ permission.name?.trim() || permission.id }}</ElCheckbox></ElCheckboxGroup></fieldset>
        <template v-if="!roleReadonly">
          <label class="field"><span>调整原因</span><ElInput v-model.trim="reason" type="textarea" required maxlength="500" :rows="3" show-word-limit :disabled="busy" /></label>
          <ElAlert v-if="modalError" :title="modalError" type="error" show-icon :closable="false" />
          <div class="form-actions"><ElButton native-type="button" :disabled="busy" @click="roleOpen = false">取消</ElButton><ElButton native-type="submit" type="primary" :loading="busy">保存角色权限</ElButton></div>
        </template>
      </form>
    </Modal>
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElAlert, ElButton, ElCheckbox, ElCheckboxGroup, ElInput, ElSwitch, ElTabPane, ElTable, ElTableColumn, ElTabs, ElTag } from "element-plus";
import { Plus, Search } from "@element-plus/icons-vue";
import { can, request, query, message, label, type Identity, type Page } from "../api";
import Modal from "../components/Modal.vue";
import Pager from "../components/Pager.vue";
import State from "../components/State.vue";
interface Permission { id: string; name: string; code: string }
interface Role { id: string; name: string; code: string; alias: string | null; enabled: boolean; permissionIds: string[]; revision: string; protected: boolean }
interface User { userId: string; name: string | null; email: string; disabled: boolean; roleIds: string[]; revision: string }
const props = defineProps<{ identity: Identity }>();
const writable = computed(() => can(props.identity, "bm:access:write"));
const tab = ref("users"), search = ref(""), page = ref(1), total = ref(0), loading = ref(false), busy = ref(false), error = ref(""), modalError = ref(""), success = ref("");
const roles = ref<Role[]>([]), permissions = ref<Permission[]>([]), users = ref<User[]>([]), selectedUser = ref<User | null>(null), selectedRoles = ref<string[]>([]), selectedRole = ref<Role | null>(null), roleOpen = ref(false), reason = ref("");
const form = reactive({ name: "", code: "", alias: "", enabled: true, permissionIds: [] as string[], revision: "" });
const groups = computed(() => [{ name: "羽毛球管理", items: permissions.value.filter(item => item.code.startsWith("bm:")) }, { name: "系统及其他应用", items: permissions.value.filter(item => !item.code.startsWith("bm:")) }].filter(group => group.items.length));
function grantable(role: Role) { return role.protected ? can(props.identity, "*") : role.permissionIds.every(id => { const permission = permissions.value.find(item => item.id === id); return !!permission && can(props.identity, permission.code); }); }
function editable(role: Role) { return writable.value && !role.protected && !props.identity.roles.some(item => item.id === role.id) && grantable(role); }
const roleReadonly = computed(() => selectedRole.value ? !editable(selectedRole.value) : !writable.value);
function roleDisplayName(role: Role) { return role.alias?.trim() || (role.name?.trim() ? label(role.name.trim()) : role.id); }
function roleName(id: string) { const role = roles.value.find(item => item.id === id); return role ? `${roleDisplayName(role)}${role.enabled ? "" : "（停用）"}` : id; }
async function load(next = page.value) {
  if (loading.value) return; loading.value = true; error.value = "";
  try {
    const [roleRows, permissionRows, userRows] = await Promise.all([request<Role[]>("/admin/roles"), request<Permission[]>("/admin/permissions"), request<Page<User>>(`/admin/staff?${query({ page: next, q: search.value })}`)]);
    roles.value = roleRows; permissions.value = permissionRows; users.value = userRows.list; total.value = userRows.total; page.value = next;
  } catch (e) { error.value = message(e); } finally { loading.value = false; }
}
function editUser(user: User) { selectedUser.value = user; selectedRoles.value = [...user.roleIds]; reason.value = ""; modalError.value = ""; }
function editRole(role?: Role) { selectedRole.value = role || null; Object.assign(form, { name: role?.name || "", code: role?.code || "", alias: role?.alias || "", enabled: role?.enabled ?? true, permissionIds: [...(role?.permissionIds || [])], revision: role?.revision || "" }); reason.value = ""; modalError.value = ""; roleOpen.value = true; }
async function saveUser() {
  if (busy.value || !selectedUser.value || !writable.value) return;
  if (!reason.value.trim() || reason.value.length > 500) { modalError.value = "请填写 1–500 字的调整原因。"; return; }
  busy.value = true; modalError.value = "";
  try { await request("/admin/staff", "PUT", { userId: selectedUser.value.userId, roleIds: selectedRoles.value, revision: selectedUser.value.revision, reason: reason.value }); selectedUser.value = null; success.value = "用户角色已更新。"; await load(); window.dispatchEvent(new Event("admin-permissions-changed")); }
  catch (e) { modalError.value = message(e); } finally { busy.value = false; }
}
async function saveRole() {
  if (busy.value || roleReadonly.value) return;
  if (!form.name.trim() || form.name.length > 80 || !/^[a-z][a-z0-9:_-]{1,79}$/.test(form.code) || form.alias.length > 80) { modalError.value = "请填写有效角色名称和编码，并确认显示名称不超过 80 字。"; return; }
  if (!reason.value.trim() || reason.value.length > 500) { modalError.value = "请填写 1–500 字的调整原因。"; return; }
  busy.value = true; modalError.value = "";
  try { await request(`/admin/roles${selectedRole.value ? `/${selectedRole.value.id}` : ""}`, selectedRole.value ? "PUT" : "POST", { ...form, reason: reason.value }); roleOpen.value = false; success.value = "角色权限已更新，关联账号下一次请求生效。"; await load(); window.dispatchEvent(new Event("admin-permissions-changed")); }
  catch (e) { modalError.value = message(e); } finally { busy.value = false; }
}
onMounted(() => load());
</script>

