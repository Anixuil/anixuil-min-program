import request from "@/utils/request";
import { buildQuery } from "@/utils/query";

export interface MatchCreatePayload {
  name: string;
  description?: string;
  planStartTime: string;
  planEndTime: string;
  status: string;
  type: string;
}

export interface MatchListQuery {
  page: number;
  pageSize: number;
  name?: string;
}

export interface MatchItem {
  id: string;
  name: string;
  description?: string;
  planStartTime?: string;
  planEndTime?: string;
  status?: string;
  createBy?: string;
  user?: {
    userAvatar?: string;
    wxAvatarUrl?: string;
    userAlias?: string;
  };
}

export interface PageResult<T> {
  list: T[];
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface MatchGameItem {
  id: string;
  matchId: string;
  totalOdds?: number;
  status?: string;
  matchGamePlayers?: MatchGamePlayerItem[];
}

export interface MatchGamePlayerItem {
  id: string;
  matchGameId: string;
  playerId: string;
  partnerId?: string;
  odds?: number;
  score?: number;
  player?: { id: string; name: string };
  partner?: { id: string; name: string } | null;
}

export interface BindGamePlayerItem {
  matchGameId: string;
  playerId: string;
  partnerId?: string;
  odds?: number;
}

const BadmintonAPI = {
  createMatch(data: MatchCreatePayload): Promise<boolean> {
    return request<boolean>({ url: "/badminton/createMatch", method: "POST", data });
  },
  listMatch(params: MatchListQuery): Promise<PageResult<MatchItem>> {
    const query = buildQuery({ page: params.page, pageSize: params.pageSize, name: params.name });
    return request<PageResult<MatchItem>>({ url: `/badminton/listMatch${query}`, method: "GET" });
  },
  getMatch(id: string): Promise<MatchItem> {
    return request<MatchItem>({ url: `/badminton/match/${id}`, method: "GET" });
  },
  updateMatch(data: { id: string; status?: string; name?: string; description?: string; planStartTime?: string; mode?: string; type?: string }): Promise<boolean> {
    return request<boolean>({ url: "/badminton/updateMatch", method: "PUT", data });
  },
  deleteMatch(id: string): Promise<boolean> {
    return request<boolean>({ url: `/badminton/deleteMatch/${id}`, method: "DELETE" });
  },

  batchCreateMatchGame(data: { matchId: string; matchGameNum: number }): Promise<MatchGameItem[]> {
    return request<MatchGameItem[]>({ url: "/badminton/batchCreateMatchGame", method: "POST", data });
  },
  listMatchGame(params: { page: number; pageSize: number }): Promise<PageResult<MatchGameItem>> {
    const query = buildQuery({ page: params.page, pageSize: params.pageSize });
    return request<PageResult<MatchGameItem>>({ url: `/badminton/listMatchGame${query}`, method: "GET" });
  },
  createMatchGameByMode(data: { matchId: string }): Promise<boolean> {
    return request<boolean>({ url: "/badminton/createMatchGameByMode", method: "POST", data });
  },
  batchMatchGameBindPlayer(data: BindGamePlayerItem[]): Promise<boolean> {
    return request<boolean>({ url: "/badminton/batchMatchGameBindPlayer", method: "POST", data });
  },
  unbindMatchGamePlayer(data: {
    id: string;
    matchGameId: string;
    playerId?: string;
    partnerId?: string;
  }): Promise<boolean> {
    return request<boolean>({ url: "/badminton/unbindMatchGamePlayer", method: "PUT", data });
  },
  bindMatchGamePlayer(data: {
    id: string;
    matchGameId: string;
    playerId?: string;
    partnerId?: string;
  }): Promise<boolean> {
    return request<boolean>({ url: "/badminton/bindMatchGamePlayer", method: "PUT", data });
  },
  registrationScore(data: { matchGameId: string; matchGamePlayerId: string; score: number }): Promise<number> {
    return request<number>({ url: "/badminton/registrationScore", method: "POST", data });
  },
  historyPlayer(): Promise<any[]> {
    return request<any[]>({ url: "/badminton/historyPlayer", method: "GET" });
  },
};

export default BadmintonAPI;
