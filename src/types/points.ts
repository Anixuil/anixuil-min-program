import type { Page } from "@/types/competition";

export type CheerSide = "A" | "B";
export interface CheerProp { id: string; name: string; points: number }
export interface PointsSummary {
  balance: number; available: number; debt: number; checkedIn: boolean; date: string;
  checkInReward: number; perGameLimit: number; props: CheerProp[];
}
export interface PointTransaction {
  id: string; kind: string; delta: number; balanceAfter: number; description: string;
  createdAt: string; matchId?: string | null; gameId?: string | null;
}
export interface CheerTotals { people: number; points: number; oddsHundredths: number }
export interface CheerMarket {
  gameId: string; version: number; closedAt: string | null; open: boolean; historyFrozen: boolean;
  a: CheerTotals; b: CheerTotals; mySupport: { side: CheerSide; points: number } | null;
}
export interface CheerQuote {
  id: string; gameId: string; side: CheerSide; propId: string; propName: string;
  unitPrice: number; quantity: number; points: number; oddsHundredths: number;
  expectedReturn: number; marketVersion: number; expiresAt: string; ruleVersion: string;
}
export interface CheerOrder {
  id: string; quoteId: string; matchId: string; gameId: string; matchName: string; gameSequence: number;
  teamAName: string; teamBName: string; side: CheerSide; propName: string; quantity: number;
  points: number; oddsHundredths: number; expectedReturn: number; settledReturn: number;
  status: "pending" | "won" | "lost" | "refunded"; createdAt: string;
}
export interface CheerPurchase { order: CheerOrder; wallet: PointsSummary }
export type PointTransactionPage = Page<PointTransaction>;
export type CheerOrderPage = Page<CheerOrder>;
