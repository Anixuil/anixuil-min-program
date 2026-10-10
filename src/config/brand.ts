export const BRAND_NAME = "一羽成局";
export const BRAND_TAGLINE = "聚好球友，打好每一场。";
export const BRAND_MARK = "/static/brand/yiyu-chengju-mark.png";

export function matchShareTitle(matchName?: string) {
  return matchName ? `${matchName} · ${BRAND_NAME}` : BRAND_NAME;
}
