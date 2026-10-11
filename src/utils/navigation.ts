export function isPublicResultPage(path?: string): boolean {
  if (path !== undefined) return path.replace(/^\//, "").split("?")[0] === "pages/matchResults/index";
  const pages = getCurrentPages();
  return pages.length > 0 && isPublicResultPage(pages[pages.length - 1].route || "");
}
export function rememberReturn() {
  const pages = getCurrentPages();
  const page = pages[pages.length - 1] as any;
  if (!page?.route || /pages\/(login|register)/.test(page.route)) return;
  const options = page.options || page.$page?.options || {};
  const query = Object.keys(options).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(options[key])}`).join("&");
  uni.setStorageSync("bm:return", `/${page.route}${query ? `?${query}` : ""}`);
}
export function toLogin() {
  rememberReturn();
  // Dispose the previous mini-program page instead of retaining its rendering layer below login.
  // #ifdef MP-WEIXIN
  uni.reLaunch({ url: "/pages/login/index" });
  // #endif
  // #ifndef MP-WEIXIN
  uni.navigateTo({ url: "/pages/login/index" });
  // #endif
}
export function afterLogin() {
  const saved = String(uni.getStorageSync("bm:return") || "");
  uni.removeStorageSync("bm:return");
  if (/^\/pages\/(matchDetails|scheduleDetails)\/index\?/.test(saved) || saved === "/pages/create/index") uni.redirectTo({ url: saved });
  else uni.switchTab({ url: "/pages/index/index" });
}
export const statusLabels: Record<string, string> = { draft: "待排赛", scheduled: "待开赛", active: "进行中", finished: "已结束", cancelled: "已取消" };
export const modeLabels: Record<string, string> = { single: "单打循环", rotation: "双打轮转", fixed: "固搭循环" };
export function dateLabel(value: string) { const d = new Date(value); return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }
export function showError(error: any) { uni.showToast({ title: error?.message || "操作失败，请重试", icon: "none", duration: 2500 }); }
export function confirm(content: string) { return new Promise<boolean>(resolve => uni.showModal({ title: "确认操作", content, success: result => resolve(result.confirm), fail: () => resolve(false) })); }
