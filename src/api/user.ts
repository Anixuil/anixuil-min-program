/*
 * @Author: Anixuil
 * @Date: 2025-09-26 16:52:01
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-10-03 10:07:51
 * @Description: 用户接口
 */
import request from "@/utils/request";

const USER_BASE_URL = "/sys-user";

const UserAPI = {
  /**
   * 获取当前登录用户信息
   *
   * @returns 登录用户昵称、头像信息，包括角色和权限
   */
  getUserInfo(): Promise<UserInfo> {
    return request<UserInfo>({
      url: `${USER_BASE_URL}/getUserInfo`,
      method: "GET",
    });
  },

  // 微信登录
  WeChatLogin(data: WxLoginData): Promise<any> {
    return request({
      url: `${USER_BASE_URL}/wxLogin`,
      method: "POST",
      data,
    })
  }
};
export default UserAPI;

/** 登录用户信息 */
export interface UserInfo {
  /** 用户ID */
  userId?: number;

  /** 用户名 */
  userName?: string;

  /** 邮箱 */
  userEmail?: string;

  /** 昵称 */
  nickName?: string;

  /** 头像URL */
  wxAvatarUrl?: string;

  wxOpenId?: string; // 微信openid

  wxUnionId?: string; // 微信unionid

  userAge?: string; // 用户年龄
}

/** 微信登录数据 */
export interface WxLoginData {
  code: string; // 微信登录code
  avatarUrl: string; // 微信头像
  nickName: string; // 微信昵称
}
