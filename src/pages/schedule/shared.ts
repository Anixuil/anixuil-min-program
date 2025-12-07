export type ScheduleItem = {
  id: string;
  title: string;
  time: string;
  place: string;
  type: string;
};

export function navigateToDetails(id: string) {
  uni.navigateTo({ url: `/pages/matchDetails/index?id=${id}` });
}

export function formatSub(item: ScheduleItem): string {
  return `${item.time} ｜ ${item.place} ｜ ${item.type}`;
}
