import { defineStore } from "pinia";
import BadmintonAPI, { type MatchGameItem } from "@/api/badminton";

export const useGameStore = defineStore("game", () => {
  const list = ref<MatchGameItem[]>([]);
  const page = ref(1);
  const pageSize = ref(10);

  const fetchList = async () => {
    const res = await BadmintonAPI.listMatchGame({ page: page.value, pageSize: pageSize.value });
    list.value = res.list || [];
  };

  const batchCreate = async (matchId: string, matchGameNum: number) => {
    return BadmintonAPI.batchCreateMatchGame({ matchId, matchGameNum });
  };

  const batchBind = async (
    items: Array<{ matchGameId: string; playerId: string; partnerId?: string; odds?: number }>,
  ) => {
    return BadmintonAPI.batchMatchGameBindPlayer(items);
  };

  const unbind = async (data: { id: string; matchGameId: string; playerId?: string; partnerId?: string }) => {
    return BadmintonAPI.unbindMatchGamePlayer(data);
  };

  const bind = async (data: { id: string; matchGameId: string; playerId?: string; partnerId?: string }) => {
    return BadmintonAPI.bindMatchGamePlayer(data);
  };

  return { list, page, pageSize, fetchList, batchCreate, batchBind, unbind, bind };
});
