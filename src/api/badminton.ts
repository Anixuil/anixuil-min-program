import request from "@/utils/request";

export interface MatchCreatePayload {
  name: string;
  description?: string;
  planStartTime: string;
  planEndTime: string;
  status: string;
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
    const query = new URLSearchParams({
      page: String(params.page),
      pageSize: String(params.pageSize),
      ...(params.name ? { name: params.name } : {}),
    });
    return request<PageResult<MatchItem>>({ url: `/badminton/listMatch?${query.toString()}`, method: "GET" });
  },
  getMatch(id: string): Promise<MatchItem> {
    return request<MatchItem>({ url: `/badminton/match/${id}`, method: "GET" });
  },
  updateMatch(data: { id: string; status?: string; name?: string }): Promise<boolean> {
    return request<boolean>({ url: "/badminton/updateMatch", method: "PUT", data });
  },
  deleteMatch(id: string): Promise<boolean> {
    return request<boolean>({ url: `/badminton/deleteMatch/${id}`, method: "DELETE" });
  },

  batchCreateMatchGame(data: { matchId: string; matchGameNum: number }): Promise<MatchGameItem[]> {
    return request<MatchGameItem[]>({ url: "/badminton/batchCreateMatchGame", method: "POST", data });
  },
  listMatchGame(params: { page: number; pageSize: number }): Promise<PageResult<MatchGameItem>> {
    const query = new URLSearchParams({ page: String(params.page), pageSize: String(params.pageSize) });
    return request<PageResult<MatchGameItem>>({ url: `/badminton/listMatchGame?${query.toString()}`, method: "GET" });
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
};

export default BadmintonAPI;
