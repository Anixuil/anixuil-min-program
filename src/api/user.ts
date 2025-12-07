/*
 * @Author: Anixuil
 * @Date: 2025-09-26 16:52:01
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-12-07 11:06:37
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
    });
  },

  // 发送邮箱验证码
  sendEmailCode(data: { userEmail: string; emailTitle: string }): Promise<any> {
    return request({
      url: `${USER_BASE_URL}/sendEmailCode`,
      method: "POST",
      data,
    });
  },

  // 验证邮箱验证码
  verifyEmailCode(data: { userEmail: string; code: string }): Promise<any> {
    return request({
      url: `${USER_BASE_URL}/verifyEmailCode`,
      method: "POST",
      data,
    });
  },

  // 更改用户信息
  updateUserInfo(data: {
    userId: string;
    userName: string;
    userEmail: string;
    userAge?: string;
    userAlias?: string;
  }): Promise<any> {
    return request({
      url: `${USER_BASE_URL}/updateUserInfo`,
      method: "PUT",
      data,
    });
  },

  // 绑定微信
  bingWx(data: { code: string | number }): Promise<any> {
    return request({
      url: `${USER_BASE_URL}/bindWx`,
      method: "POST",
      data,
    });
  },
  // 用户注册
  register(data: { userName: string; userPassword: string; userEmail: string }): Promise<any> {
    return request({
      url: `${USER_BASE_URL}/register`,
      method: "POST",
      data,
    });
  },
};
export default UserAPI;

/** 羽毛球信息 */
export interface UserBadmintonInfo {
  score: number;
  experience: number;
  matchCount?: number; // 参加过比赛数
  gameCount?: number; // 对局总数
  winCount?: number; // 胜局数
  loseCount?: number; // 败局数
  winRate?: number; // 胜率
}

/** 登录用户信息 */
export interface UserInfo {
  /** 用户ID */
  userId: string;

  /** 用户名 */
  userName: string;

  /** 邮箱 */
  userEmail: string;

  /** 昵称 */
  nickName?: string;

  /** 头像URL */
  wxAvatarUrl?: string;

  wxOpenId?: string; // 微信openid

  wxUnionId?: string; // 微信unionid

  userAge?: string; // 用户年龄

  userPassword?: string; // 用户密码

  /** 羽球信息 */
  badmintonInfo?: UserBadmintonInfo;

  /** 是否已签到 */
  isSign?: boolean;
}

/** 微信登录数据 */
export interface WxLoginData {
  code: string | number; // 微信登录code
  avatarUrl: string; // 微信头像
  nickName: string; // 微信昵称
}
