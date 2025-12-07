import { describe, it, expect, vi } from "vitest";
vi.mock("@/utils/request", () => ({
  default: (opts: any) => {
    if (String(opts.url).startsWith("/badminton/listMatch")) {
      return Promise.resolve({ list: [], total: 0, page: 1, pageSize: 10 });
    }
    if (String(opts.url).startsWith("/sys-dict/commonDictType")) {
      return Promise.resolve({ list: [] });
    }
    return Promise.resolve(true);
  },
}));

import BadmintonAPI from "@/api/badminton";
import DictAPI from "@/api/dict";

describe("api smoke", () => {
  it("dict common type", async () => {
    const res: any = await DictAPI.commonDictType("badminton_match_status");
    expect(res.list).toBeDefined();
  });
  it("list match", async () => {
    const res = await BadmintonAPI.listMatch({ page: 1, pageSize: 10 });
    expect(res.list).toBeDefined();
  });
});
