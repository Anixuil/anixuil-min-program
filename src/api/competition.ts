import request from "@/utils/request";
import type { Account, CompetitionSummary, Detail, MatchInput, Page, PersonalStats, Preview, PublicMatchResult, ResultShareLink } from "@/types/competition";

// Keep the same key when retrying an uncertain write. Different payloads get a new key.
const pending = new Map<string, string>();
type CreatedMatch = { id: string; version: number; status: string };
const creating = new Map<string, Promise<CreatedMatch>>();
export function clearPendingWrites() { pending.clear(); creating.clear(); }
export function newKey() { return `bm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`; }
export async function write<T>(url: string, data: unknown = {}, method: "POST" | "PUT" = "POST"): Promise<T> {
  const identity = `${uni.getStorageSync("token")}:${method}:${url}:${JSON.stringify(data)}`;
  const key = pending.get(identity) || newKey();
  pending.set(identity, key);
  try {
    const result = await request<T>({ url, method, data: data as any, header: { "Idempotency-Key": key } });
    if (url === "/matches" && method === "POST") {
      const created = result as { id?: unknown } | null;
      if (typeof created?.id !== "string" || !created.id.trim()) {
        throw { code: 0, message: "创建结果暂未确认，请重试确认" };
      }
    }
    if (pending.get(identity) === key) pending.delete(identity);
    return result;
  } catch (error: any) {
    // A concurrent creation can conflict before the first transaction commits.
    const creationPending = url === "/matches" && method === "POST" && error.code === 409;
    if (error.code >= 400 && error.code < 500 && !creationPending && pending.get(identity) === key) pending.delete(identity);
    throw error;
  }
}
function createMatch(data: MatchInput & { players: string[] }): Promise<CreatedMatch> {
  const identity = `${uni.getStorageSync("token")}:${JSON.stringify(data)}`;
  const existing = creating.get(identity);
  if (existing) return existing;
  const operation = write<CreatedMatch>("/matches", data).finally(() => {
    // An earlier session's request may finish after the cache has been cleared.
    if (creating.get(identity) === operation) creating.delete(identity);
  });
  creating.set(identity, operation);
  return operation;
}
export const api = {
  login: (data: { email: string; password: string }) => request<{ access_token: string; user: Account }>({ url: "/auth/login", method: "POST", data }),
  register: (data: { email: string; password: string; nickname: string }) => request<{ access_token: string; user: Account }>({ url: "/auth/register", method: "POST", data }),
  wechat: (code: string) => request<{ access_token: string; user: Account }>({ url: "/auth/wechat", method: "POST", data: { code } }),
  me: () => request<Account>({ url: "/me", method: "GET" }),
  logout: () => request({ url: "/auth/logout", method: "POST" }),
  profile: (nickname: string) => request<Account>({ url: "/me", method: "PUT", data: { nickname } }),
  personal: () => request<PersonalStats>({ url: "/me/stats", method: "GET" }),
  list: (page: number, scope: string, status: string) => request<Page<CompetitionSummary>>({ url: "/matches", method: "GET", data: { page, pageSize: 10, scope, ...(status ? { status } : {}) } }),
  create: createMatch,
  detail: (id: string) => request<Detail>({ url: `/matches/${id}`, method: "GET" }),
  update: (id: string, data: MatchInput & { version: number }) => write(`/matches/${id}`, data, "PUT"),
  addPlayer: (id: string, name: string, version: number) => write(`/matches/${id}/players`, { name, version }),
  removePlayer: (id: string, playerId: string, version: number) => write(`/matches/${id}/players/${playerId}/remove`, { version }),
  pairs: (id: string, pairs: string[][], version: number) => write(`/matches/${id}/pairs`, { pairs, version }, "PUT"),
  claim: (id: string, playerId: string, release = false) => write(`/matches/${id}/players/${playerId}/${release ? "release" : "claim"}`),
  invite: (id: string) => write<{ matchId: string; token: string }>(`/matches/${id}/invitation`),
  resultShare: (id: string) => write<ResultShareLink>(`/matches/${id}/result-share`),
  sharedResults: (token: string) => request<PublicMatchResult>({ url: `/result-shares/${encodeURIComponent(token)}`, method: "GET", public: true }),
  redeem: (token: string) => write<{ id: string }>("/invitations/redeem", { token }),
  preview: (id: string) => request<Preview>({ url: `/matches/${id}/schedule-preview`, method: "GET" }),
  generate: (id: string, version: number) => write(`/matches/${id}/schedule`, { version }),
  action: (id: string, action: string, version: number, reason?: string) => write(`/matches/${id}/actions/${action}`, { version, ...(reason ? { reason } : {}) }),
  score: (id: string, gameId: string, data: { version: number; scoreA: number; scoreB: number; reason: string }) => write(`/matches/${id}/games/${gameId}/score`, data, "PUT"),
  cancelGame: (id: string, gameId: string, version: number, reason: string) => write(`/matches/${id}/games/${gameId}/cancel`, { version, reason }),
  audits: (id: string) => request<Array<{ id: string; action: string; actorId: string; actorName: string; detail: any; createdAt: string }>>({ url: `/matches/${id}/audits`, method: "GET" }),
};
