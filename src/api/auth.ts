/*
 * @Author: Anixuil
 * @Date: 2025-09-26 16:52:01
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-10-03 10:23:29
 * @Description: 登录登出接口
 */
import request from "@/utils/request";
import { UserInfo } from "./user";

const AuthAPI = {
  /**
   * 登录接口
   *
   * @param username 用户名
   * @param password 密码
   * @returns 返回 token
   */
  login(data: {userEmail: string, userPassword: string}): Promise<LoginResult> {
    return request<LoginResult>({
      url: "/sys-user/login",
      method: "POST",
      data
    });
  },

  /**
   * 登出接口
   */
  logout(): Promise<any> {
    return request({
      url: "/sys-user/logout",
      method: "POST",
    });
  },

  // 检测token活性
  checkTokenActive(): Promise<any> {
    return request({
      url: '/testAuth',
      method: 'GET',
    })
  }
};

export default AuthAPI;

/** 登录响应 */
export interface LoginResult {
  /** 访问token */
  access_token?: string;
  /** token 类型 */
  userInfo?: UserInfo;
}
