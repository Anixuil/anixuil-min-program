import { defineStore } from "pinia";
import PlayerAPI, { type PlayerItem } from "@/api/player";

export const usePlayerStore = defineStore("player", () => {
  const list = ref<PlayerItem[]>([]);

  const fetchList = async () => {
    list.value = await PlayerAPI.listPlayer();
  };

  const batchCreate = async (items: Array<{ matchId: string; userId?: string; name: string }>) => {
    return PlayerAPI.batchCreatePlayer(items);
  };

  const claim = async (data: { matchId: string; playerId: string; userId: string }) => {
    return PlayerAPI.claimPlayer(data);
  };

  const unclaim = async (data: { matchId: string; playerId: string }) => {
    return PlayerAPI.unclaimPlayer(data);
  };

  return { list, fetchList, batchCreate, claim, unclaim };
});
