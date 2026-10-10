import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/utils/request", () => ({ default: vi.fn() }));
import request from "@/utils/request";
import { api, clearPendingWrites } from "@/api/competition";
import type { MatchInput } from "@/types/competition";
const mocked = vi.mocked(request);
beforeEach(() => { mocked.mockReset(); clearPendingWrites(); vi.stubGlobal("uni", { getStorageSync: () => "session" }); });
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}
const matchInput: MatchInput & { players: string[] } = {
  name: "周末球局", location: "一号球馆", description: "", startsAt: "2026-10-10T10:00:00.000Z", endsAt: "2026-10-10T12:00:00.000Z",
  mode: "rotation", courtCount: 1, gameCount: 6, seed: 1, players: ["小林", "小陈", "小王", "小李"],
};
const createdMatch = { id: "match-1", version: 1, status: "draft" };
describe("match creation requests", () => {
  it("shares an in-flight request for the same session and payload", async () => {
    const response = deferred<typeof createdMatch>();
    mocked.mockReturnValueOnce(response.promise);
    const first = api.create(matchInput);
    const repeated = api.create({ ...matchInput, players: [...matchInput.players] });
    expect(repeated).toBe(first);
    expect(mocked).toHaveBeenCalledTimes(1);
    response.resolve(createdMatch);
    await expect(first).resolves.toEqual(createdMatch);
  });
  it("allows a new intentional creation after the previous one completes", async () => {
    mocked.mockResolvedValue(createdMatch);
    await api.create(matchInput);
    await api.create(matchInput);
    expect(mocked).toHaveBeenCalledTimes(2);
    expect(mocked.mock.calls[0][0].header!["Idempotency-Key"]).not.toBe(mocked.mock.calls[1][0].header!["Idempotency-Key"]);
  });
  it("retries an uncertain creation with the same idempotency key", async () => {
    mocked.mockRejectedValueOnce({ code: 0 }).mockResolvedValueOnce(createdMatch);
    await expect(api.create(matchInput)).rejects.toEqual({ code: 0 });
    await api.create(matchInput);
    expect(mocked).toHaveBeenCalledTimes(2);
    expect(mocked.mock.calls[0][0].header!["Idempotency-Key"]).toBe(mocked.mock.calls[1][0].header!["Idempotency-Key"]);
  });
  it("preserves the creation key when a previous transaction is still pending", async () => {
    mocked.mockRejectedValueOnce({ code: 409 }).mockResolvedValueOnce(createdMatch);
    await expect(api.create(matchInput)).rejects.toEqual({ code: 409 });
    await api.create(matchInput);
    expect(mocked).toHaveBeenCalledTimes(2);
    expect(mocked.mock.calls[0][0].header!["Idempotency-Key"]).toBe(mocked.mock.calls[1][0].header!["Idempotency-Key"]);
  });
  it("preserves the creation key when the success response omits the match id", async () => {
    mocked.mockResolvedValueOnce({ version: 1, status: "draft" }).mockResolvedValueOnce(createdMatch);
    await expect(api.create(matchInput)).rejects.toMatchObject({ code: 0 });
    await api.create(matchInput);
    expect(mocked).toHaveBeenCalledTimes(2);
    expect(mocked.mock.calls[0][0].header!["Idempotency-Key"]).toBe(mocked.mock.calls[1][0].header!["Idempotency-Key"]);
  });
  it("does not share creations across sessions or different payloads", async () => {
    let session = "first-session";
    vi.stubGlobal("uni", { getStorageSync: () => session });
    const response = deferred<typeof createdMatch>();
    mocked.mockReturnValue(response.promise);
    const first = api.create(matchInput);
    const changed = api.create({ ...matchInput, name: "第二场球局" });
    session = "second-session";
    const nextSession = api.create(matchInput);
    expect(first).not.toBe(changed);
    expect(first).not.toBe(nextSession);
    expect(mocked).toHaveBeenCalledTimes(3);
    const keys = mocked.mock.calls.map(([options]) => options.header!["Idempotency-Key"]);
    expect(new Set(keys).size).toBe(3);
    response.resolve(createdMatch);
    await Promise.all([first, changed, nextSession]);
  });
  it("keeps a newer request and its retry key when an old request finishes after clearing", async () => {
    const oldResponse = deferred<typeof createdMatch>();
    const newResponse = deferred<typeof createdMatch>();
    mocked.mockReturnValueOnce(oldResponse.promise).mockReturnValueOnce(newResponse.promise).mockResolvedValueOnce(createdMatch);
    const oldRequest = api.create(matchInput);
    clearPendingWrites();
    const newRequest = api.create(matchInput);
    expect(newRequest).not.toBe(oldRequest);
    const newKey = mocked.mock.calls[1][0].header!["Idempotency-Key"];
    expect(newKey).not.toBe(mocked.mock.calls[0][0].header!["Idempotency-Key"]);
    oldResponse.resolve(createdMatch);
    await oldRequest;
    expect(api.create(matchInput)).toBe(newRequest);
    expect(mocked).toHaveBeenCalledTimes(2);
    const rejection = expect(newRequest).rejects.toEqual({ code: 0 });
    newResponse.reject({ code: 0 });
    await rejection;
    await api.create(matchInput);
    expect(mocked.mock.calls[2][0].header!["Idempotency-Key"]).toBe(newKey);
  });
});
describe("mutation retries", () => {
  it("reuses the idempotency key after an uncertain network result", async () => {
    mocked.mockRejectedValueOnce({ code: 0 }).mockResolvedValueOnce({});
    const body = { version: 1, scoreA: 21, scoreB: 0, reason: "" };
    await expect(api.score("m", "g", body)).rejects.toEqual({ code: 0 });
    await api.score("m", "g", body);
    expect(mocked.mock.calls[0][0].header!["Idempotency-Key"]).toBe(mocked.mock.calls[1][0].header!["Idempotency-Key"]);
  });
  it("never reuses a key for different score data", async () => {
    mocked.mockRejectedValue({ code: 0 });
    await api.score("m", "g", { version: 1, scoreA: 21, scoreB: 0, reason: "" }).catch(() => {});
    await api.score("m", "g", { version: 1, scoreA: 22, scoreB: 0, reason: "" }).catch(() => {});
    expect(mocked.mock.calls[0][0].header!["Idempotency-Key"]).not.toBe(mocked.mock.calls[1][0].header!["Idempotency-Key"]);
  });
  it("sends server-side scope and state filters with pagination", async () => {
    mocked.mockResolvedValue({ list: [], total: 0 });
    await api.list(2, "joined", "active");
    expect(mocked.mock.calls[0][0].data).toEqual({ page: 2, pageSize: 10, scope: "joined", status: "active" });
  });
});
