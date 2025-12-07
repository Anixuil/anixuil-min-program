/*
 * @Author: Anixuil
 * @Date: 2025-12-07 08:49:10
 * @LastEditors: Anixuil
 * @LastEditTime: 2025-12-07 08:56:09
 * @Description: 比赛相关接口
 */
import request from '@/utils/request';

// 比赛信息接口
export interface Match {
  id: string;
  name: string;
  description: string;
  planStartTime: string;
  planEndTime: string;
  mode: string;
  type: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createBy: string;
  updateBy: string;
  playerCount?: number;
  user?: {
    userAvatar?: string;
    wxAvatarUrl?: string;
    userAlias?: string;
  };
}

// 比赛列表返回数据
export interface MatchListResult {
  list: Match[];
  total: number;
}

// 对局选手信息接口
export interface MatchGamePlayer {
  id: string;
  matchGameId: string;
  playerId: string;
  partnerId: string;
  isDeleted: boolean;
  odds: number;
  createdAt: string;
  updatedAt: string;
  createBy: string;
  updateBy: string;
  player?: any; // 根据实际情况定义 Player 接口
}

// 比赛对局接口
export interface MatchGame {
  id: string;
  matchId: string;
  totalOdds: number;
  status: string; // e.g., "notStart"
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createBy: string;
  updateBy: string;
  match?: Match;
  matchGamePlayers?: MatchGamePlayer[];
}

// 比赛对局列表返回数据
export interface MatchGameListResult {
  list: MatchGame[];
}

// 登记比分参数
export interface RegistrationScoreParams {
  matchGameId: string;
  matchGamePlayerId: string;
  score: number;
}

// 根据比赛模式生成对局参数
export interface CreateMatchGameByModeParams {
  matchId: string;
}

// 选手信息接口
export interface Player {
  id: string;
  matchId: string;
  userId: string;
  name: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createBy: string;
  updateBy: string;
  user?: any;
}

// 批量创建选手参数项
export interface BatchCreatePlayerItem {
  matchId: string;
  userId?: string;
  name: string;
}

// 认领选手参数
export interface ClaimPlayerParams {
  matchId: string;
  playerId: string;
  userId: string;
}

// 取消认领参数
export interface UnclaimPlayerParams {
  matchId: string;
  playerId: string;
}

// 新建比赛参数
export interface CreateMatchParams {
  name: string;
  description: string;
  planStartTime: string;
  planEndTime: string;
  mode: string;
  type: string;
  status: string;
}

// 比赛列表查询参数
export interface ListMatchParams {
  page: number;
  pageSize: number;
  name: string;
}

// 修改比赛参数
export interface UpdateMatchParams {
  id: string;
  name?: string;
  description?: string;
  planStartTime?: string;
  planEndTime?: string;
  status?: string;
  mode?: string;
  type?: string;
}

// 批量创建对局参数
export interface BatchCreateMatchGameParams {
  matchId: string;
  matchGameNum: number;
}

// 批量选手对局绑定参数项
export interface BatchMatchGameBindPlayerItem {
  matchGameId: string;
  playerId: string;
  partnerId?: string;
  odds?: number;
}

// 选手对局解除绑定参数
export interface UnbindMatchGamePlayerParams {
  id: string;
  matchGameId: string;
  playerId?: string;
  partnerId?: string;
}

// 选手绑定对局参数
export interface BindMatchGamePlayerParams {
  id: string;
  matchGameId: string;
  playerId: string;
  partnerId: string; // 与playerId必须填一个
}

// 比赛对局列表查询参数
export interface ListMatchGameParams {
  page: number;
  pageSize: number;
  matchName: string;
}

// 1. 新建比赛
export function createMatch(data: CreateMatchParams) {
  return request<boolean>({
    url: '/badminton/createMatch',
    method: 'POST',
    data,
  });
}

// 11. 登记比分
export function registrationScore(data: RegistrationScoreParams) {
  return request<number>({
    url: '/badminton/registrationScore',
    method: 'POST',
    data,
  });
}

// 12. 根据比赛模式生成对局
export function createMatchGameByMode(data: CreateMatchGameByModeParams) {
  return request<boolean>({
    url: '/badminton/createMatchGameByMode',
    method: 'POST',
    data,
  });
}

// 13. 批量创建选手
export function batchCreatePlayer(data: BatchCreatePlayerItem[]) {
  return request<boolean>({
    url: '/badminton/batchCreatePlayer',
    method: 'POST',
    data,
  });
}

// 14. 选手列表
export function listPlayer() {
  return request<Player[]>({
    url: '/badminton/listPlayer',
    method: 'GET',
  });
}

// 15. 认领选手
export function claimPlayer(data: ClaimPlayerParams) {
  return request<boolean>({
    url: '/badminton/claimPlayer',
    method: 'POST',
    data,
  });
}

// 16. 取消认领选手
export function unclaimPlayer(data: UnclaimPlayerParams) {
  return request<boolean>({
    url: '/badminton/unclaimPlayer',
    method: 'PUT',
    data,
  });
}

// 17. 历史选手
export function historyPlayer() {
  return request<any>({
    url: '/badminton/historyPlayer',
    method: 'GET',
  });
}

// 18. 每日签到
export function dailySign() {
  return request<any>({
    url: '/badminton/dailySign',
    method: 'POST',
  });
}

// 2. 比赛列表
export function listMatch(params: ListMatchParams) {
  return request<MatchListResult>({
    url: '/badminton/listMatch',
    method: 'GET',
    data: params,
  });
}

// 3. 比赛详情
export function getMatchDetail(id: string) {
  return request<Match>({
    url: `/badminton/match/${id}`,
    method: 'GET',
  });
}

// 4. 修改比赛
export function updateMatch(data: UpdateMatchParams) {
  return request<boolean>({
    url: '/badminton/updateMatch',
    method: 'PUT',
    data,
  });
}

// 5. 删除比赛
export function deleteMatch(id: string) {
  return request<boolean>({
    url: `/badminton/deleteMatch/${id}`,
    method: 'DELETE',
  });
}

// 6. 批量创建对局
export function batchCreateMatchGame(data: BatchCreateMatchGameParams) {
  return request<MatchGame[]>({
    url: '/badminton/batchCreateMatchGame',
    method: 'POST',
    data,
  });
}

// 7. 批量选手对局绑定
export function batchMatchGameBindPlayer(data: BatchMatchGameBindPlayerItem[]) {
  return request<boolean>({
    url: '/badminton/batchMatchGameBindPlayer',
    method: 'POST',
    data,
  });
}

// 8. 选手对局解除绑定
export function unbindMatchGamePlayer(data: UnbindMatchGamePlayerParams) {
  return request<boolean>({
    url: '/badminton/unbindMatchGamePlayer',
    method: 'PUT',
    data,
  });
}

// 9. 选手绑定对局
export function bindMatchGamePlayer(data: BindMatchGamePlayerParams) {
  return request<boolean>({
    url: '/badminton/bindMatchGamePlayer',
    method: 'PUT',
    data,
  });
}

// 10. 比赛对局列表
export function listMatchGame(params: ListMatchGameParams) {
  return request<MatchGameListResult>({
    url: '/badminton/listMatchGame',
    method: 'GET',
    data: params,
  });
}
