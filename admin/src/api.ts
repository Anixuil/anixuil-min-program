import { ref } from "vue";

export const token = ref(sessionStorage.getItem("yiyu-admin-session") || "");
const pending = new Map<string, string>();
try {
  const saved: unknown = JSON.parse(sessionStorage.getItem("yiyu-admin-pending") || "[]");
  if (Array.isArray(saved)) for (const entry of saved) {
    if (Array.isArray(entry) && typeof entry[0] === "string" && typeof entry[1] === "string") pending.set(entry[0], entry[1]);
  }
} catch { sessionStorage.removeItem("yiyu-admin-pending"); }
function persistPending() { sessionStorage.setItem("yiyu-admin-pending", JSON.stringify([...pending])); }
export function setToken(value: string) { token.value = value; pending.clear(); sessionStorage.removeItem("yiyu-admin-pending"); value ? sessionStorage.setItem("yiyu-admin-session", value) : sessionStorage.removeItem("yiyu-admin-session"); }
export class ApiError extends Error { constructor(message: string, public code: number) { super(message); } }
export async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const session = token.value, identity = `${session}:${method}:${path}:${JSON.stringify(body)}`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session) headers.Authorization = `Bearer ${session}`;
  if (method !== "GET" && path.startsWith("/admin/")) {
    if (!pending.has(identity)) pending.set(identity, crypto.randomUUID());
    persistPending();
    headers["Idempotency-Key"] = pending.get(identity)!;
  }
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(`/ani-server${path}`, { method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: controller.signal, cache: "no-store" });
    const data = await response.json();
    if (response.status === 401 && session === token.value && !path.startsWith("/auth/")) setToken("");
    if (response.status === 403 && path !== "/admin/me") window.dispatchEvent(new Event("admin-permissions-changed"));
    if (!response.ok || data.code !== 200) {
      // Conflicts may represent an original request still committing. Retain its key.
      if (response.status >= 400 && response.status < 500 && response.status !== 409) { pending.delete(identity); persistPending(); }
      throw new ApiError(data.message || "请求失败，请稍后重试", response.status);
    }
    pending.delete(identity);
    persistPending();
    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("网络异常或请求超时，请重试。未确认的操作会沿用原请求标识。", 0);
  } finally { clearTimeout(timer); }
}
export function query(values: Record<string, string | number | undefined>) { return new URLSearchParams(Object.entries(values).filter(([, value]) => value !== undefined && value !== "").map(([key, value]) => [key, String(value)])).toString(); }
export const message = (error: unknown) => error instanceof Error ? error.message : "请求失败，请重试";
export const date = (value?: string | null) => value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "—";
export const labels: Record<string, string> = { draft: "草稿", scheduled: "待开赛", active: "进行中", finished: "已结束", cancelled: "已取消", pending: "待完成", completed: "已完成", won: "助威成功", lost: "助威未中", refunded: "已退款", single: "单打", rotation: "轮转双打", fixed: "固定搭档", announcement: "公告", notification: "通知", published: "已发布", withdrawn: "已撤回", admin: "超级管理员", operator: "运营人员", viewer: "只读人员", check_in: "签到奖励", admin_adjustment: "管理调整", cheer_purchase: "助威支出", cheer_settlement: "助威结算" };
Object.assign(labels, {
  cheer_reward: "助威返还", cheer_correction: "助威纠错调整", cheer_refund: "助威退款",
  create: "创建球局", update: "修改球局", add: "添加选手", remove: "移除选手", pairs: "设置固定搭档",
  claim: "认领选手", unclaim: "解除认领", create_invitation: "创建邀请", schedule: "生成排赛",
  clear: "清除排赛", start: "开始球局", finish: "结束球局", cancel: "取消球局", delete: "删除球局",
  close_cheering: "结束助威", cancel_game: "取消对局", correct_score: "比分纠错", submit_score: "提交比分",
  "admin:user": "修改球友账号", "admin:points": "调整用户积分", "admin:publication-save": "保存公告或通知",
  "admin:publication-publish": "发布公告或通知", "admin:publication-withdraw": "撤回公告或通知",
  "admin:settings": "修改系统设置", "admin:revoke-links": "撤销分享与邀请",
  "admin:access:role": "维护系统角色", "admin:access:assign": "分配用户角色",
  ADMIN: "管理后台", SYSTEM: "用户端", A: "A 方", B: "B 方", all: "全部球友", users: "指定球友",
  publish: "发布", withdraw: "撤回", enabled: "启用", disabled: "停用", "cheer-v1": "助威规则第一版",
  stick: "加油棒", flag: "应援旗", horn: "助威号角",
});
export const label = (value: string) => labels[value] || value;
export interface Page<T> { list: T[]; total: number; page: number; pageSize: number }
export interface Identity { userId: string; roles: { id: string; code: string; name: string }[]; permissions: string[] }
export function can(identity: Identity, permission: string) { return identity.permissions.includes("*") || identity.permissions.includes("admin") || identity.permissions.includes(permission); }

