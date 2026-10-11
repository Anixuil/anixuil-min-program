import { isPublicResultPage, rememberReturn } from "@/utils/navigation";
let redirecting = false;
type RequestOptions = UniApp.RequestOptions & { public?: boolean };
export default function request<T>(options: RequestOptions): Promise<T> {
  const { public: publicRequest = false, ...requestOptions } = options;
  const token = publicRequest ? "" : uni.getStorageSync("token");
  const header = { ...options.header };
  if (publicRequest) {
    Object.keys(header).forEach(key => { if (key.toLowerCase() === "authorization") delete header[key]; });
  } else if (token) header.Authorization = `Bearer ${token}`;
  let origin = String(import.meta.env.VITE_BADMINTON_ORIGIN || "http://127.0.0.1:3000").replace(/\/$/, "");
  // #ifdef H5
  origin = "";
  // #endif
  return new Promise((resolve, reject) => {
    uni.request({
      ...requestOptions, timeout: 15000,
      url: `${origin}/ani-server${options.url}`,
      header,
      success: response => {
        const data = response.data as { code?: number; message?: string; data?: T };
        const code = Number(data?.code || response.statusCode);
        if (!publicRequest && code === 401 && token === uni.getStorageSync("token") && !options.url.startsWith("/auth/")) {
          uni.removeStorageSync("token");
          uni.removeStorageSync("userId");
          uni.$emit("bm:unauthorized");
          if (!redirecting && !isPublicResultPage()) {
            redirecting = true;
            rememberReturn();
            uni.reLaunch({ url: "/pages/login/index", complete: () => { redirecting = false; } });
          }
        }
        if (response.statusCode >= 200 && response.statusCode < 300 && Number(data?.code) === 200) resolve(data.data as T);
        else reject({ code, message: data?.message || "请求失败，请稍后重试" });
      },
      fail: error => {
        // Native network errors can embed the full URL, including a bearer share token.
        const errMsg = (error.errMsg || "").replace(/(\/result-shares\/)[^\s?#'"<>]+/g, "$1[redacted]");
        let message = "网络连接失败，请检查网络后重试";
        if (/timeout/i.test(errMsg)) message = "请求超时，服务未及时响应，请稍后重试";
        else if (/url not in domain list|domain list|不在.*合法域名/i.test(errMsg)) message = "请求域名未获允许，请联系管理员检查小程序配置";
        else if (/abort|cancel/i.test(errMsg)) message = "请求已取消，请重试";
        if (import.meta.env.DEV) {
          // Do not log headers or payloads: they can contain tokens, passwords and login codes.
          const safeUrl = options.url.replace(/(\/result-shares\/)[^\s?#]+/g, "$1[redacted]");
          console.warn("[api] 请求失败", { url: `${origin}/ani-server${safeUrl}`, errMsg });
        }
        reject({ code: 0, message, errMsg });
      },
    });
  });
}
