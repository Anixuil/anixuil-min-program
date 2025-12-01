/*
 * @Author: Anixuil
 * @Date: 2025-09-26 16:52:01
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-10-19 20:38:10
 * @Description: 请求封装
 */
// src/utils/request.ts
export default function request<T>(options: UniApp.RequestOptions): Promise<T> {
  const token = uni.getStorageSync("token"); // 从本地缓存获取 token
  return new Promise((resolve, reject) => {
    uni.request({
      ...options,
      // VITE_APP_API_URL 是在 Vite 项目的 .env.development 文件中配置的环境变量，使用代理标识，实际转发到真实 API
      url: `${import.meta.env.VITE_APP_API_URL}${import.meta.env.VITE_APP_BASE_API}${options.url}`, // 示例: http://localhost:5173/dev-api/login
      header: {
        ...options.header,
        Authorization: `Bearer ${token}`,
      },
      success: (response) => {
        const resData = response.data as ResponseData<T>;
        const status = (response as any).statusCode;
        const codeNum =
          typeof (resData as any).code === "string" ? parseInt((resData as any).code, 10) : (resData as any).code;
        if (status === 401 || codeNum === 401) {
          uni.removeStorageSync("token");
          uni.removeStorageSync("userId");
          uni.showToast({ title: "登录状态已过期，请先登录", icon: "none", duration: 1500 });
          setTimeout(() => {
            uni.reLaunch({ url: "/pages/login/index" });
          }, 1200);
          reject({ message: "Unauthorized", code: 401 });
          return;
        }
        const codeVal = (resData as any).code;
        const isOk = codeVal === 200 || codeVal === "200";
        if (isOk) {
          resolve(resData.data as T);
        } else {
          uni.showToast({ title: resData.message || "业务处理失败", icon: "none", duration: 2000 });
          reject({ message: resData.message || "业务处理失败", code: resData.code });
        }
      },
      fail: (error) => {
        uni.showToast({
          title: "网络请求失败",
          icon: "none",
          duration: 2000,
        });
        reject({
          message: "网络请求失败",
          error,
        });
      },
    });
  });
}
