/*
 * @Author: Anixuil
 * @Date: 2025-09-26 16:52:01
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-10-19 22:46:11
 * @Description: 用户模块
 */
//  src/store/module/user.ts
import { defineStore } from "pinia";
import AuthAPI from "@/api/auth";
import UserAPI, { UserInfo } from "@/api/user";

export const useUserStore = defineStore("user", () => {
  // 确保 token 是响应式的
  const token = ref<string>(uni.getStorageSync("token") || "");
  const userInfo = ref<UserInfo | null>(null);

  const weChatCode = ref<string | number>(""); // 微信登录code

  // 登录
  const login = async (data: { userEmail: string; userPassword: string }) => {
    try {
      const res = await AuthAPI.login(data);
      token.value = `${res.access_token}`;
      uni.setStorageSync("token", token.value);
      userInfo.value = res.userInfo as UserInfo;
    } catch (err) {
      console.error("login error:", err);
    }
  };

  // 获取用户信息
  const getUserInfo = async () => {
    const info = await UserAPI.getUserInfo();
    userInfo.value = info;
    return info;
  };

  // 登出
  const logout = async () => {
    try {
      await AuthAPI.logout();
    } catch (err) {
      console.error("logout error:", err);
    } finally {
      userInfo.value = null;
      token.value = ""; // 清空 token
      uni.removeStorageSync("token"); // 从本地缓存移除 token
    }
  };

  // 微信一键登录
  const WeChatLogin = async () => {
    return new Promise((resolve, reject) => {
      let code = "";
      uni.login({
        provider: "weixin",
        success: (res) => {
          code = res.code;
          weChatCode.value = code;
          uni.setStorageSync("weChatCode", weChatCode.value);
          resolve(weChatCode.value);
        },
        fail: (err) => {
          // console.log('微信登录失败', err);
          reject(err);
        },
        complete: () => {
          // console.log('微信登录完成');
        },
      });
    });
  };

  // 微信获取用户信息
  const WeChatGetUserInfo = async () => {
    return new Promise((resolve, reject) => {
      uni.getUserInfo({
        provider: "weixin",
        success: (res) => {
          UserAPI.WeChatLogin({
            code: weChatCode.value,
            avatarUrl: res.userInfo.avatarUrl,
            nickName: res.userInfo.nickName,
          })
            .then((loginRes) => {
              const accessToken = loginRes?.access_token || "";
              if (!accessToken) {
                reject(new Error("登录接口调用失败，access_token为空"));
                return;
              }
              uni.setStorageSync("token", accessToken);
              userInfo.value = loginRes.userInfo;
              token.value = accessToken;
              resolve(loginRes);
            })
            .catch((err) => {
              console.log("登录接口调用失败", err);
              reject(err);
            });
        },
        fail: (err) => {
          console.log("微信获取用户信息失败", err);
        },
      });
    });
  };

  return {
    token,
    userInfo,
    login,
    logout,
    getUserInfo,
    WeChatLogin,
    WeChatGetUserInfo,
  };
});
