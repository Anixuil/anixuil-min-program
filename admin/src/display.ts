import { date, label } from "./api";

export type DisplayNames = Record<string, string>;
type RecordValue = Record<string, unknown>;

export const fieldNames: Record<string, string> = {
  id: "记录", userId: "用户", userIds: "用户", userNickname: "用户昵称", actorId: "操作人", actorName: "操作人",
  ownerId: "组织者", ownerName: "组织者", previousUserId: "原认领账号", createdBy: "创建人", createBy: "创建人", updateBy: "更新人",
  matchId: "球局", badmintonMatchId: "球局", matchName: "球局", gameId: "对局", matchGameId: "对局", recordGameIds: "可录分对局", gameName: "对局",
  playerId: "选手", playerIds: "选手", partnerId: "搭档", name: "名称", nickname: "昵称", title: "标题",
  kind: "类型", delta: "积分变动", balanceAfter: "变动后余额", description: "说明",
  createdAt: "创建时间", updatedAt: "更新时间", publishedAt: "发布时间", expiresAt: "有效截止时间",
  side: "助威方向", points: "投入积分", status: "状态", settledReturn: "已返积分",
  operation: "操作", action: "操作", method: "来源", params: "操作内容", detail: "变更内容",
  target: "操作对象", input: "操作参数", before: "变更前", after: "变更后", reason: "操作原因",
  pointsDate: "签到日期", pointsAwarded: "奖励积分", signDate: "签到时间",
  propId: "道具", propName: "道具", quantity: "数量", unitPrice: "单价", oddsHundredths: "百倍倍率",
  expectedReturn: "预计返还", teamAName: "A 方", teamBName: "B 方", teamA: "A 方", teamB: "B 方",
  gameSequence: "场次", sequence: "场次", round: "轮次", court: "场地", courtCount: "场地数",
  orderId: "助威订单", quoteId: "助威报价", publicationId: "公告或通知", recipientIds: "接收用户",
  roleId: "角色", roleIds: "角色", permissionId: "权限", permissionIds: "权限", code: "编码", alias: "显示名称",
  enabled: "是否启用", disabled: "是否停用", badmintonDisabled: "是否停用", isDeleted: "是否删除",
  mode: "赛制", badmintonMode: "赛制", badmintonStatus: "球局状态", location: "地点", startsAt: "开始时间",
  endsAt: "结束时间", planStartTime: "开始时间", planEndTime: "结束时间", gameCount: "计划对局数",
  pairs: "固定搭档", pairKey: "固定搭档", players: "参赛名单", scoreA: "A 方得分", scoreB: "B 方得分",
  count: "数量", version: "数据版本", marketVersion: "助威版本", ruleVersion: "规则版本", seed: "排赛种子",
  audience: "接收范围", content: "正文", pinned: "是否置顶", supportContact: "联系渠道", serviceHours: "服务时间",
  about: "产品说明", ip: "来源地址", url: "请求地址", requestUrl: "请求地址", userAgent: "客户端",
  executionTime: "执行耗时", duration: "耗时", error: "错误信息", message: "说明", result: "结果",
  readAt: "阅读时间", cheeringClosedAt: "助威截止时间", position: "名单顺序",
};

const dates = new Set(["createdAt", "updatedAt", "signDate", "publishedAt", "expiresAt", "startsAt", "endsAt", "planStartTime", "planEndTime", "readAt", "cheeringClosedAt"]);
const enums = new Set(["status", "kind", "operation", "action", "method", "mode", "badmintonMode", "badmintonStatus", "side", "audience", "ruleVersion", "propId"]);
const hidden = new Set(["displayNames", "operationKey", "revision"]);
const nameFields: Record<string, string> = {
  userId: "userNickname", actorId: "actorName", ownerId: "ownerName", matchId: "matchName",
  badmintonMatchId: "matchName", gameId: "gameName", propId: "propName",
};

function isRecord(value: unknown): value is RecordValue {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function displayNames(record: RecordValue): DisplayNames {
  if (!isRecord(record.displayNames)) return {};
  return Object.fromEntries(Object.entries(record.displayNames).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

function entries(record: RecordValue) {
  return Object.entries(record).filter(([key]) => !hidden.has(key) &&
    !Object.entries(nameFields).some(([idKey, nameKey]) => key === nameKey && record[idKey] != null));
}

function readable(value: unknown, key: string, names: DisplayNames, record: RecordValue = {}): unknown {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.map(item => readable(item, key, names));
  if (isRecord(value)) return Object.fromEntries(entries(value).map(([childKey, item]) => [fieldNames[childKey] || childKey, readable(item, childKey, names, value)]));
  if (typeof value === "boolean") return value ? "是" : "否";
  if (typeof value !== "string") return value;
  const name = record[nameFields[key]];
  if (typeof name === "string" && name.trim()) return name.trim();
  if (names[`${key}:${value}`]?.trim()) return names[`${key}:${value}`];
  if (dates.has(key)) return date(value);
  if (enums.has(key)) return label(value);
  return value;
}

export function displayValue(value: unknown, key: string, record: RecordValue = {}, names = displayNames(record)): string {
  if (key === "params" && typeof value === "string") {
    try { value = JSON.parse(value); } catch { /* Historical plain-text logs remain readable. */ }
  }
  const result = readable(value, key, names, record);
  return typeof result === "object" ? JSON.stringify(result, null, 2) : String(result);
}

export function recordDetails(record: RecordValue) {
  return entries(record).map(([key, value]) => ({ key, name: fieldNames[key] || key, value: displayValue(value, key, record) }));
}
