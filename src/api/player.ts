import request from "@/utils/request";

export interface PlayerItem {
  id: string;
  matchId: string;
  userId?: string;
  name: string;
}

const PlayerAPI = {
  batchCreatePlayer(data: Array<{ matchId: string; userId?: string; name: string }>): Promise<boolean> {
    return request<boolean>({ url: "/badminton/batchCreatePlayer", method: "POST", data });
  },
  listPlayer(): Promise<PlayerItem[]> {
    return request<PlayerItem[]>({ url: "/badminton/listPlayer", method: "GET" });
  },
  claimPlayer(data: { matchId: string; playerId: string; userId: string }): Promise<boolean> {
    return request<boolean>({ url: "/badminton/claimPlayer", method: "POST", data });
  },
  unclaimPlayer(data: { matchId: string; playerId: string }): Promise<boolean> {
    return request<boolean>({ url: "/badminton/unclaimPlayer", method: "PUT", data });
  },
  deletePlayer(id: string): Promise<boolean> {
    return request<boolean>({ url: `/badminton/deletePlayer/${id}`, method: "DELETE" });
  },
};

export default PlayerAPI;
