import { provide, ref, type InjectionKey } from "vue";
import type { CompetitionSummary } from "@/types/competition";
import { openMatch, type MotionRect } from "./useMotion";

export const matchParts = ["surface", "mode", "status", "name", "location", "date", "meta"] as const;
export type MatchPart = typeof matchParts[number];
export interface MatchSnapshot { rects: Record<MatchPart, MotionRect>; hero: boolean }
export interface MatchSource { key: string; measure: () => Promise<MatchSnapshot | null> }
export const hiddenMatchCard = ref("");
let sequence = 0;
export function createMatchShareKey() { return `match-card-${++sequence}`; }
export function matchSnapshot(rows: MotionRect[], hero: boolean): MatchSnapshot | null {
  const rects = {} as Record<MatchPart, MotionRect>;
  for (const part of matchParts) {
    const rect = rows.find(row => row.id === `bm-share-${part}`);
    if (!rect || !Number.isFinite(rect.top) || rect.width <= 0 || rect.height <= 0) return null;
    rects[part] = rect;
  }
  return { rects, hero };
}
export const matchPresentationKey: InjectionKey<(match: CompetitionSummary, source: MatchSource) => Promise<void>> = Symbol("match-presentation");
export function provideMatchPresentation(host: () => { open: (match: CompetitionSummary, source: MatchSource) => Promise<void> } | null) {
  provide(matchPresentationKey, async (match, source) => {
    const target = host();
    if (target) await target.open(match, source);
    else await openMatch(match);
  });
}
export function supportsMatchPresentation() {
  // #ifdef MP-WEIXIN
  return uni.canIUse("page-container");
  // #endif
  return false;
}
