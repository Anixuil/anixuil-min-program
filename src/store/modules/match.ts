import { defineStore } from "pinia";
import BadmintonAPI, { type MatchItem } from "@/api/badminton";

export const useMatchStore = defineStore("match", () => {
  const list = ref<MatchItem[]>([]);
  const total = ref(0);
  const page = ref(1);
  const pageSize = ref(10);
  const current = ref<MatchItem | null>(null);

  const fetchList = async (name?: string) => {
    const res = await BadmintonAPI.listMatch({ page: page.value, pageSize: pageSize.value, name });
    list.value = res.list || [];
    total.value = res.total || 0;
  };

  const fetchDetail = async (id: string) => {
    current.value = await BadmintonAPI.getMatch(id);
    return current.value;
  };

  const createMatch = async (payload: {
    name: string;
    description?: string;
    planStartTime: string;
    planEndTime: string;
    status: string;
  }) => {
    return BadmintonAPI.createMatch(payload);
  };

  const updateStatus = async (id: string, status: string) => {
    return BadmintonAPI.updateMatch({ id, status });
  };

  const removeMatch = async (id: string) => {
    return BadmintonAPI.deleteMatch(id);
  };

  return { list, total, page, pageSize, current, fetchList, fetchDetail, createMatch, updateStatus, removeMatch };
});
