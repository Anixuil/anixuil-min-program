import { defineStore } from "pinia";
import { ref } from "vue";
import { api, clearPendingWrites } from "@/api/competition";
import type { Account } from "@/types/competition";

export const useUserStore = defineStore("user", () => {
  const token = ref<string>(uni.getStorageSync("token") || "");
  const userInfo = ref<Account | null>(null);
  let restoring: Promise<Account | null> | null = null;
  function clear() {
    token.value = ""; userInfo.value = null; restoring = null;
    uni.removeStorageSync("token"); uni.removeStorageSync("userId");
    clearPendingWrites();
  }
  function accept(result: { access_token: string; user: Account }) {
    if (!result.access_token || !result.user?.id) throw new Error("登录返回数据不完整");
    clearPendingWrites(); restoring = null; token.value = result.access_token; userInfo.value = result.user;
    uni.setStorageSync("token", token.value); uni.setStorageSync("userId", result.user.id);
  }
  async function login(input: { email: string; password: string }) { accept(await api.login(input)); }
  async function register(input: { email: string; password: string; nickname: string }) { accept(await api.register(input)); }
  async function wechat() {
    const code = await new Promise<string>((resolve, reject) => uni.login({ provider: "weixin", success: r => r.code ? resolve(r.code) : reject(new Error("未获得微信登录凭证")), fail: () => reject(new Error("微信登录已取消或不可用")) }));
    accept(await api.wechat(code));
  }
  function restore(): Promise<Account | null> {
    if (!token.value) return Promise.resolve(null);
    if (!restoring) {
      const session = token.value;
      restoring = api.me().then(user => { if (token.value === session) userInfo.value = user; return token.value === session ? user : null; }).finally(() => { if (token.value === session) restoring = null; });
    }
    return restoring;
  }
  async function logout() { try { await api.logout(); } catch (error: any) { if (error.code !== 401) throw error; } clear(); }
  uni.$on("bm:unauthorized", clear);
  return { token, userInfo, login, register, wechat, restore, logout, clear };
});
