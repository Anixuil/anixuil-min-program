import request from "@/utils/request";
import type { Page } from "@/types/competition";
export interface InboxMessage { id: string; kind: "announcement" | "notification"; title: string; content: string; pinned: boolean; publishedAt: string; expiresAt: string | null; read: boolean }
export interface ServiceInfo { supportContact: string; serviceHours: string; about: string }
export const messagesApi = {
  list: (page: number) => request<Page<InboxMessage>>({ url: "/me/messages", method: "GET", data: { page, pageSize: 20 } }),
  read: (id: string) => request<boolean>({ url: `/me/messages/${id}/read`, method: "POST" }),
  info: () => request<ServiceInfo>({ url: "/me/messages/service-info", method: "GET" }),
};
