import { rememberReturn } from "@/utils/navigation";
let redirecting = false;
export default function request<T>(options: UniApp.RequestOptions): Promise<T> {
  const token = uni.getStorageSync("token");
  let origin = String(import.meta.env.VITE_BADMINTON_ORIGIN || "http://127.0.0.1:3000").replace(/\/$/, "");
  // #ifdef H5
  origin = "";
  // #endif
  return new Promise((resolve, reject) => {
    uni.request({
      ...options, timeout: 15000,
      url: `${origin}/ani-server${options.url}`,
      header: { ...options.header, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      success: response => {
        const data = response.data as { code?: number; message?: string; data?: T };
        const code = Number(data?.code || response.statusCode);
        if (code === 401 && token === uni.getStorageSync("token") && !options.url.startsWith("/auth/")) {
          uni.removeStorageSync("token");
          uni.removeStorageSync("userId");
          uni.$emit("bm:unauthorized");
          if (!redirecting) {
            redirecting = true;
            rememberReturn();
            uni.reLaunch({ url: "/pages/login/index", complete: () => { redirecting = false; } });
          }
        }
        if (response.statusCode >= 200 && response.statusCode < 300 && Number(data?.code) === 200) resolve(data.data as T);
        else reject({ code, message: data?.message || "请求失败，请稍后重试" });
      },
      fail: error => {
        const errMsg = error.errMsg || "";
        let message = "网络连接失败，请检查网络后重试";
        if (/timeout/i.test(errMsg)) message = "请求超时，服务未及时响应，请稍后重试";
        else if (/url not in domain list|domain list|不在.*合法域名/i.test(errMsg)) message = "请求域名未获允许，请联系管理员检查小程序配置";
        else if (/abort|cancel/i.test(errMsg)) message = "请求已取消，请重试";
        if (import.meta.env.DEV) {
          // Do not log headers or payloads: they can contain tokens, passwords and login codes.
          console.warn("[api] 请求失败", { url: `${origin}/ani-server${options.url}`, errMsg });
        }
        reject({ code: 0, message, errMsg });
      },
    });
  });
}
