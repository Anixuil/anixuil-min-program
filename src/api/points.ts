import request from "@/utils/request";
import { newKey, write } from "@/api/competition";
import type { Game } from "@/types/competition";
import type { CheerMarket, CheerOrderPage, CheerPurchase, CheerQuote, CheerSide, PointsSummary, PointTransactionPage } from "@/types/points";

export const pointsApi = {
  summary: () => request<PointsSummary>({ url: "/me/points", method: "GET" }),
  checkIn: () => write<{ awarded: boolean; wallet: PointsSummary }>("/me/check-ins"),
  transactions: (page: number) => request<PointTransactionPage>({ url: "/me/point-transactions", method: "GET", data: { page, pageSize: 20 } }),
  orders: (page: number) => request<CheerOrderPage>({ url: "/me/cheers", method: "GET", data: { page, pageSize: 20 } }),
  markets: (matchId: string) => request<CheerMarket[]>({ url: `/matches/${matchId}/cheers`, method: "GET" }),
  quote: (matchId: string, gameId: string, data: { side: CheerSide; propId: string; quantity: number }) =>
    write<CheerQuote>(`/matches/${matchId}/games/${gameId}/cheer-quotes`, data),
  close: (matchId: string, gameId: string, version: number) =>
    write<Game>(`/matches/${matchId}/games/${gameId}/close-cheering`, { version }),
};

export interface PendingCheer { userId: string; matchId: string; gameId: string; quote: CheerQuote; key: string }
const storageKey = (userId: string) => `bm:pending-cheer:${userId}`;
export function pendingCheer(userId: string): PendingCheer | null {
  const value = uni.getStorageSync(storageKey(userId));
  return value && value.userId === userId && value.quote?.id && value.key ? value : null;
}
export function prepareCheer(userId: string, matchId: string, gameId: string, quote: CheerQuote): PendingCheer {
  const previous = pendingCheer(userId);
  if (previous) {
    if (previous.quote.id !== quote.id) throw new Error("还有一笔助威结果待确认，请先恢复原订单");
    return previous;
  }
  const intent = { userId, matchId, gameId, quote, key: newKey() };
  // Persist before sending. Reloading or signing out must not turn an uncertain write into a new purchase.
  uni.setStorageSync(storageKey(userId), intent);
  return intent;
}
export function forgetCheer(intent: PendingCheer) {
  const current = pendingCheer(intent.userId);
  if (current?.quote.id === intent.quote.id && current.key === intent.key) uni.removeStorageSync(storageKey(intent.userId));
}
export async function purchaseCheer(intent: PendingCheer): Promise<CheerPurchase> {
  if (uni.getStorageSync("userId") !== intent.userId) {
    throw { code: 401, message: "账号已切换，请登录原账号后确认这笔助威" };
  }
  try {
    const result = await request<CheerPurchase>({
      url: `/matches/${intent.matchId}/games/${intent.gameId}/cheers`, method: "POST",
      data: { quoteId: intent.quote.id }, header: { "Idempotency-Key": intent.key },
    });
    forgetCheer(intent);
    return result;
  } catch (error: any) {
    // The purchase endpoint replays owned orders under the match lock before access checks.
    // A domain 403 therefore establishes no purchase; transient database conflicts use 503.
    // Authentication, throttling and infrastructure failures keep the original intent.
    if ([400, 403, 404, 409, 422].includes(error?.code)) forgetCheer(intent);
    throw error;
  }
}
