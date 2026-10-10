import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/request", () => ({ default: vi.fn() }));
vi.mock("@/api/competition", () => ({ newKey: vi.fn(), write: vi.fn() }));

import request from "@/utils/request";
import { newKey } from "@/api/competition";
import { forgetCheer, pendingCheer, prepareCheer, purchaseCheer } from "@/api/points";
import type { CheerPurchase, CheerQuote } from "@/types/points";

const mockedRequest = vi.mocked(request);
const mockedNewKey = vi.mocked(newKey);
let storage: Map<string, unknown>;
let setStorage: ReturnType<typeof vi.fn>;

function quote(id = "quote-1"): CheerQuote {
  return {
    id, gameId: "game-1", side: "A", propId: "flag", propName: "应援旗",
    unitPrice: 50, quantity: 1, points: 50, oddsHundredths: 230,
    expectedReturn: 115, marketVersion: 4, expiresAt: "2026-10-07T01:00:30.000Z",
    ruleVersion: "v1",
  };
}

function purchaseResult(quoteId = "quote-1"): CheerPurchase {
  return {
    order: {
      id: "order-1", quoteId, matchId: "match-1", gameId: "game-1", matchName: "周末球局",
      gameSequence: 1, teamAName: "甲", teamBName: "乙", side: "A", propName: "应援旗",
      quantity: 1, points: 50, oddsHundredths: 230, expectedReturn: 115,
      settledReturn: 0, status: "pending", createdAt: "2026-10-07T01:00:01.000Z",
    },
    wallet: {
      balance: 50, available: 50, debt: 0, checkedIn: true, date: "2026-10-07",
      checkInReward: 100, perGameLimit: 500, props: [],
    },
  };
}

beforeEach(() => {
  storage = new Map();
  storage.set("userId", "user-1");
  mockedRequest.mockReset();
  mockedNewKey.mockReset();
  let sequence = 0;
  mockedNewKey.mockImplementation(() => `purchase-key-${++sequence}`);
  // Serializing storage values models restoring an intent after the page or app closes.
  setStorage = vi.fn((key: string, value: unknown) => storage.set(key, JSON.parse(JSON.stringify(value))));
  vi.stubGlobal("uni", {
    getStorageSync: (key: string) => {
      const value = storage.get(key);
      return value === undefined ? "" : JSON.parse(JSON.stringify(value));
    },
    setStorageSync: setStorage,
    removeStorageSync: (key: string) => storage.delete(key),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("助威购买的持久化与恢复", () => {
  it("先持久化报价与请求标识，再发送购买请求", async () => {
    const proposed = quote();
    const intent = prepareCheer("user-1", "match-1", "game-1", proposed);
    expect(mockedRequest).not.toHaveBeenCalled();
    expect(pendingCheer("user-1")).toEqual(intent);
    expect(pendingCheer("user-1")).not.toBe(intent);
    mockedRequest.mockImplementationOnce(async () => {
      expect(pendingCheer("user-1")).toEqual(intent);
      return purchaseResult();
    });

    await purchaseCheer(intent);

    expect(mockedRequest).toHaveBeenCalledWith({
      url: "/matches/match-1/games/game-1/cheers", method: "POST",
      data: { quoteId: proposed.id }, header: { "Idempotency-Key": intent.key },
    });
    expect(pendingCheer("user-1")).toBeNull();
  });

  it("存储失败时不返回可提交意图，不发送购买请求", () => {
    setStorage.mockImplementationOnce(() => { throw new Error("storage full"); });

    expect(() => prepareCheer("user-1", "match-1", "game-1", quote())).toThrow("storage full");
    expect(mockedRequest).not.toHaveBeenCalled();
    expect(pendingCheer("user-1")).toBeNull();
  });

  it("同一报价重复确认保持原请求标识及原报价", () => {
    const original = prepareCheer("user-1", "match-1", "game-1", quote());
    const restored = prepareCheer("user-1", "match-1", "game-1", { ...quote(), oddsHundredths: 180 });

    expect(restored).toEqual(original);
    expect(mockedNewKey).toHaveBeenCalledTimes(1);
    expect(setStorage).toHaveBeenCalledTimes(1);
  });

  it("原单结果未知时禁止提交另一报价，即使属于另一局", async () => {
    mockedRequest.mockRejectedValueOnce({ code: 0, message: "请求超时" });
    const original = prepareCheer("user-1", "match-1", "game-1", quote());
    await expect(purchaseCheer(original)).rejects.toMatchObject({ code: 0 });

    expect(() => prepareCheer("user-1", "match-2", "game-2", { ...quote("quote-2"), gameId: "game-2" }))
      .toThrow("还有一笔助威结果待确认");
    expect(pendingCheer("user-1")).toEqual(original);
    expect(mockedRequest).toHaveBeenCalledTimes(1);
  });

  it("超时后从存储恢复原单，多次失败保持原 key，仅成功才清除", async () => {
    mockedRequest.mockRejectedValueOnce({ code: 0 }).mockRejectedValueOnce({ code: 503 }).mockResolvedValueOnce(purchaseResult());
    const original = prepareCheer("user-1", "match-1", "game-1", quote());

    await expect(purchaseCheer(original)).rejects.toEqual({ code: 0 });
    const restored = pendingCheer("user-1")!;
    expect(restored).toEqual(original);
    await expect(purchaseCheer(restored)).rejects.toEqual({ code: 503 });
    expect(pendingCheer("user-1")).toEqual(original);
    await expect(purchaseCheer(pendingCheer("user-1")!)).resolves.toEqual(purchaseResult());

    expect(mockedRequest.mock.calls.map(([options]) => options.header!["Idempotency-Key"]))
      .toEqual([original.key, original.key, original.key]);
    expect(mockedRequest.mock.calls.map(([options]) => options.data))
      .toEqual([{ quoteId: original.quote.id }, { quoteId: original.quote.id }, { quoteId: original.quote.id }]);
    expect(pendingCheer("user-1")).toBeNull();
  });

  it.each([400, 403, 404, 409, 422])("已知业务失败 %i 清理该意图，允许重新确认报价", async code => {
    mockedRequest.mockRejectedValueOnce({ code });
    const original = prepareCheer("user-1", "match-1", "game-1", quote());

    await expect(purchaseCheer(original)).rejects.toEqual({ code });

    expect(pendingCheer("user-1")).toBeNull();
    const next = prepareCheer("user-1", "match-1", "game-1", quote("quote-2"));
    expect(next.key).not.toBe(original.key);
    expect(pendingCheer("user-1")).toEqual(next);
  });

  it.each([0, 401, 429, 500, 502, 503, 504])("结果不确定的错误 %i 保留原单和原 key", async code => {
    mockedRequest.mockRejectedValueOnce({ code });
    const intent = prepareCheer("user-1", "match-1", "game-1", quote());

    await expect(purchaseCheer(intent)).rejects.toEqual({ code });

    expect(pendingCheer("user-1")).toEqual(intent);
    expect(prepareCheer("user-1", "match-1", "game-1", quote()).key).toBe(intent.key);
  });

  it("未知异常原样传递且保留待恢复订单", async () => {
    const error = new Error("network disconnected");
    mockedRequest.mockRejectedValueOnce(error);
    const intent = prepareCheer("user-1", "match-1", "game-1", quote());

    await expect(purchaseCheer(intent)).rejects.toBe(error);
    expect(pendingCheer("user-1")).toEqual(intent);
  });

  it("按账号保存与恢复，完成一个账号的购买不清除另一个账号", async () => {
    const first = prepareCheer("user-1", "match-1", "game-1", quote());
    const second = prepareCheer("user-2", "match-1", "game-1", quote("quote-2"));
    expect(first.key).not.toBe(second.key);
    expect(pendingCheer("user-1")).toEqual(first);
    expect(pendingCheer("user-2")).toEqual(second);
    expect(pendingCheer("user-3")).toBeNull();
    mockedRequest.mockResolvedValueOnce(purchaseResult());

    await purchaseCheer(first);

    expect(pendingCheer("user-1")).toBeNull();
    expect(pendingCheer("user-2")).toEqual(second);
  });

  it("存储中的登录账号已切换时不发送旧账号订单，也不丢弃原意图", async () => {
    const intent = prepareCheer("user-1", "match-1", "game-1", quote());
    storage.set("userId", "user-2");
    await expect(purchaseCheer(intent)).rejects.toMatchObject({ code: 401 });
    expect(mockedRequest).not.toHaveBeenCalled();
    expect(pendingCheer("user-1")).toEqual(intent);
  });

  it.each(["different quote", "same quote with new key"])("旧成功响应不能删除较新的意图：%s", async variant => {
    let complete!: (value: CheerPurchase) => void;
    mockedRequest.mockImplementationOnce(() => new Promise<CheerPurchase>(resolve => { complete = resolve; }));
    const original = prepareCheer("user-1", "match-1", "game-1", quote());
    const inFlight = purchaseCheer(original);
    forgetCheer(original);
    const next = prepareCheer("user-1", "match-1", "game-1", quote(variant === "different quote" ? "quote-2" : "quote-1"));
    expect(next.key).not.toBe(original.key);

    complete(purchaseResult());
    await inFlight;

    expect(pendingCheer("user-1")).toEqual(next);
  });

  it("旧业务失败响应不能删除较新的意图", async () => {
    let fail!: (reason: unknown) => void;
    mockedRequest.mockImplementationOnce(() => new Promise<CheerPurchase>((_resolve, reject) => { fail = reject; }));
    const original = prepareCheer("user-1", "match-1", "game-1", quote());
    const inFlight = purchaseCheer(original);
    forgetCheer(original);
    const next = prepareCheer("user-1", "match-1", "game-1", quote());

    fail({ code: 409 });
    await expect(inFlight).rejects.toEqual({ code: 409 });

    expect(pendingCheer("user-1")).toEqual(next);
  });
});
