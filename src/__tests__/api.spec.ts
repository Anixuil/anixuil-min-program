import BadmintonAPI from "@/api/badminton";
import DictAPI from "@/api/dict";

export async function runApiSmokeTests() {
  await DictAPI.commonDictType("badminton_match_status");
  await BadmintonAPI.listMatch({ page: 1, pageSize: 10 });
}
