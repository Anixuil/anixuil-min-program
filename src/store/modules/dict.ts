import { defineStore } from "pinia";
import DictAPI, { type DictItem } from "@/api/dict";

export const useDictStore = defineStore("dict", () => {
  const matchStatus = ref<DictItem[]>([]);

  const loadMatchStatus = async () => {
    matchStatus.value = await DictAPI.commonDictType("badminton_match_status");
  };

  const findLabel = (value: string) => {
    const item = matchStatus.value.find((i) => i.value === value);
    return item ? item.label : value;
  };

  return { matchStatus, loadMatchStatus, findLabel };
});
