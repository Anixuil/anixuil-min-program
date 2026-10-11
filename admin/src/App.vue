<template>
  <ElConfigProvider :locale="zhCn">
    <LoginPanel v-if="!identity" :busy="busy" :restoring="restoring" :error="error" @login="login" />
    <div v-else class="app-shell" :class="{ 'is-collapsed': collapsed }">
      <aside v-if="!isNarrow" class="sidebar">
        <a :href="'#' + (navigation[0]?.id || '')" class="brand-link"><Brand :compact="collapsed" /></a>
        <span v-if="!collapsed" class="nav-caption">工作空间</span>
        <AdminNavigation :items="navigation" :active="route" :collapsed="collapsed" />
        <div class="sidebar-foot">
          <span class="status-dot" /><span v-if="!collapsed">{{ roleNames }}</span>
          <small v-if="!collapsed">专注每一场好球</small>
        </div>
      </aside>
      <ElDrawer v-model="drawerOpen" title="工作空间" direction="ltr" size="264px" class="navigation-drawer" :with-header="false">
        <div class="drawer-heading"><Brand /><ElButton :icon="Close" text circle aria-label="关闭导航" @click="drawerOpen = false" /></div>
        <AdminNavigation :items="navigation" :active="route" @navigate="drawerOpen = false" />
        <p class="drawer-role">{{ roleNames }}</p>
      </ElDrawer>
      <div class="workspace">
        <header class="topbar">
          <div class="topbar-location">
            <ElButton :icon="isNarrow ? Menu : collapsed ? Expand : Fold" text circle :aria-label="isNarrow ? '打开导航' : collapsed ? '展开导航' : '收起导航'" :aria-expanded="isNarrow ? drawerOpen : !collapsed" @click="toggleNavigation" />
            <ElBreadcrumb separator="/"><ElBreadcrumbItem>运营工作台</ElBreadcrumbItem><ElBreadcrumbItem>{{ current?.name || "暂无可访问模块" }}</ElBreadcrumbItem></ElBreadcrumb>
          </div>
          <div class="topbar-actions"><span class="role-caption">{{ roleNames }}</span><ElButton :icon="SwitchButton" :loading="busy" :disabled="busy" text @click="logout">退出登录</ElButton></div>
        </header>
        <main class="page-content" id="main-content">
          <div v-if="current" class="page-heading">
            <div><span class="eyebrow">{{ current.english }}</span><h1>{{ current.name }}</h1><p class="muted">{{ current.description }}</p></div>
            <span class="today">{{ today }}</span>
          </div>
          <ElAlert v-if="error" :title="error" type="error" :closable="false" show-icon class="page-alert" />
          <Transition name="page" mode="out-in">
            <component v-if="current" :is="current.component" :key="route" :identity="identity" :kind="route" />
            <ElEmpty v-else description="尚未分配业务模块权限，请联系管理员。" />
          </Transition>
        </main>
      </div>
    </div>
  </ElConfigProvider>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, defineComponent, h, onMounted, onUnmounted, ref, watch } from "vue";
import { ElAlert, ElBreadcrumb, ElBreadcrumbItem, ElButton, ElConfigProvider, ElDrawer, ElEmpty, ElResult } from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { Calendar, Close, DataAnalysis, Document, Expand, Flag, Fold, Key, List, Menu, Setting, SwitchButton, Tickets, User, Wallet } from "@element-plus/icons-vue";
import { request, token, setToken, message, can, ApiError, type Identity } from "./api";
import AdminNavigation from "./components/AdminNavigation.vue";
import Brand from "./components/Brand.vue";
import LoginPanel from "./components/LoginPanel.vue";
import State from "./components/State.vue";

const PageLoading = defineComponent({ setup: () => () => h(State, { loading: true }) });
const PageError = defineComponent({
  setup: () => () => h(ElResult, { icon: "warning", title: "页面暂时无法加载", subTitle: "请刷新页面后重试。" }),
});
function page(loader: () => Promise<any>) {
  return defineAsyncComponent({ loader, loadingComponent: PageLoading, errorComponent: PageError, delay: 120 });
}
const Ledger = page(() => import("./pages/Ledger.vue"));
const allNavigation = [
  { id: "overview", icon: DataAnalysis, name: "运营概览", english: "OVERVIEW", description: "掌握球局进展，处理今天的重要事项。", component: page(() => import("./pages/Overview.vue")) },
  { id: "matches", icon: Calendar, name: "球局管理", english: "MATCH OPERATIONS", description: "从名单到战绩，全程管理每一场球局。", component: page(() => import("./pages/Matches.vue")) },
  { id: "users", icon: User, name: "球友管理", english: "PLAYERS", description: "查看球友资料、战绩与积分，维护账号状态。", component: page(() => import("./pages/Users.vue")) },
  { id: "transactions", icon: Wallet, name: "积分流水", english: "POINTS LEDGER", description: "追踪每笔积分变动，让余额有据可查。", component: Ledger },
  { id: "orders", icon: Flag, name: "助威记录", english: "CHEERING", description: "查看助威订单与结算；比分纠错自动触发重结算。", component: Ledger },
  { id: "check-ins", icon: Tickets, name: "签到记录", english: "CHECK-INS", description: "按用户追踪每日签到及奖励发放。", component: Ledger },
  { id: "publications", icon: Document, name: "公告与通知", english: "COMMUNICATIONS", description: "发布球场资讯，将重要消息送达球友。", component: page(() => import("./pages/Publications.vue")) },
  { id: "staff", icon: Key, name: "角色与授权", english: "ACCESS CONTROL", description: "按职责配置系统角色与权限，并分配给用户。", component: page(() => import("./pages/Access.vue")) },
  { id: "logs", icon: List, name: "操作日志", english: "AUDIT TRAIL", description: "保留管理操作和赛事变更的完整线索。", component: Ledger },
  { id: "settings", icon: Setting, name: "系统设置", english: "SETTINGS", description: "维护服务信息，查看当前积分规则。", component: page(() => import("./pages/System.vue")) },
];
const identity = ref<Identity | null>(null);
const route = ref("overview"), busy = ref(false), restoring = ref(Boolean(token.value)), error = ref("");
const collapsed = ref(false), drawerOpen = ref(false);
const narrowQuery = window.matchMedia("(max-width: 800px)");
const isNarrow = ref(narrowQuery.matches);
const today = new Date().toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai", month: "long", day: "numeric", weekday: "long" });
const pagePermissions: Record<string, string> = { overview: "bm:overview:read", matches: "bm:match:read", users: "bm:user:read", transactions: "bm:points:read", orders: "bm:points:read", "check-ins": "bm:points:read", publications: "bm:publication:read", staff: "bm:access:read", logs: "bm:logs:read", settings: "bm:settings:read" };
const navigation = computed(() => identity.value ? allNavigation.filter(item => can(identity.value!, pagePermissions[item.id])) : []);
const current = computed(() => navigation.value.find(item => item.id === route.value) || navigation.value[0]);
const roleNames = computed(() => identity.value?.roles.map(role => role.name).join(" / ") || "已授权用户");

function navigate() {
  const next = location.hash.slice(1);
  route.value = navigation.value.some(item => item.id === next) ? next : navigation.value[0]?.id || "";
  drawerOpen.value = false;
}
function toggleNavigation() {
  if (isNarrow.value) drawerOpen.value = !drawerOpen.value;
  else collapsed.value = !collapsed.value;
}
function resizeNavigation(event: MediaQueryListEvent) {
  isNarrow.value = event.matches;
  drawerOpen.value = false;
}
async function restore() {
  const session = token.value;
  busy.value = true;
  error.value = "";
  try {
    const result = await request<Identity>("/admin/me");
    if (session === token.value) identity.value = result;
  } catch (cause) {
    if (session === token.value) { error.value = message(cause); setToken(""); }
    else if (!token.value) error.value = message(cause);
  } finally {
    busy.value = false;
    restoring.value = false;
  }
}
async function login(credentials: { email: string; password: string }) {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    const result = await request<{ access_token: string }>("/auth/login", "POST", credentials);
    credentials.password = "";
    setToken(result.access_token);
    identity.value = await request<Identity>("/admin/me");
  } catch (cause) {
    if (token.value) { try { await request("/auth/logout", "POST"); } catch {} }
    setToken("");
    error.value = message(cause);
  } finally { credentials.password = ""; busy.value = false; }
}
async function logout() {
  if (busy.value) return;
  busy.value = true;
  error.value = "";
  try { await request("/auth/logout", "POST"); setToken(""); }
  catch (cause) { error.value = message(cause); }
  finally { busy.value = false; }
}
let refreshing = false;
async function refreshAccess() {
  if (!token.value || refreshing || busy.value) return;
  refreshing = true;
  const session = token.value;
  try {
    const result = await request<Identity>("/admin/me");
    if (session === token.value) { identity.value = result; error.value = ""; navigate(); }
  } catch (cause) {
    if (session === token.value) {
      error.value = message(cause);
      if (cause instanceof ApiError && [401, 403].includes(cause.code)) { identity.value = null; setToken(""); }
    }
  } finally { refreshing = false; }
}
function focusRefresh() { void refreshAccess(); }
watch(identity, navigate);
watch(token, value => { if (!value) { identity.value = null; drawerOpen.value = false; } });
onMounted(() => {
  navigate();
  window.addEventListener("hashchange", navigate);
  window.addEventListener("focus", focusRefresh);
  window.addEventListener("admin-permissions-changed", focusRefresh);
  narrowQuery.addEventListener("change", resizeNavigation);
  if (token.value) void restore();
});
onUnmounted(() => {
  window.removeEventListener("hashchange", navigate);
  window.removeEventListener("focus", focusRefresh);
  window.removeEventListener("admin-permissions-changed", focusRefresh);
  narrowQuery.removeEventListener("change", resizeNavigation);
});
</script>

