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
        // 业务状态码 200 表示成功
        if (resData.code == "200") {
          resolve(resData.data);
          // uni.showToast({
          //   title: resData.message || "业务处理成功",
          //   icon: "success",
          //   duration: 2000,
          // });
        } else {
          uni.showToast({
            title: resData.message || "业务处理失败",
            icon: "none",
            duration: 2000,
          });
          reject({
            message: resData.message || "业务处理失败",
            code: resData.code,
          });
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
