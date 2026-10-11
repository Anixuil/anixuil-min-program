import { BRAND_MARK, BRAND_NAME } from "@/config/brand";

export function resultSharePayload(name: string, token: string) {
  return {
    title: `${name || "本场球局"} · 战绩 · ${BRAND_NAME}`,
    path: `/pages/matchResults/index?token=${encodeURIComponent(token)}`,
    imageUrl: BRAND_MARK,
  };
}

export function copyResultShare(token: string): Promise<void> {
  // #ifdef H5
  const root = window.location.href.split("#")[0].split("?")[0];
  return new Promise((resolve, reject) => uni.setClipboardData({
    data: `${root}#${resultSharePayload("", token).path}`,
    success: () => resolve(),
    fail: () => reject(new Error("复制失败，请重试")),
  }));
  // #endif
  // #ifndef H5
  return Promise.reject(new Error("请使用微信分享按钮"));
  // #endif
}

export function setResultShareMenu(ready: boolean) {
  // #ifdef MP-WEIXIN
  if (ready) {
    uni.hideShareMenu({ menus: ["shareTimeline"] });
    uni.showShareMenu({ menus: ["shareAppMessage"] });
  } else uni.hideShareMenu({ menus: ["shareAppMessage", "shareTimeline"] });
  // #endif
}
