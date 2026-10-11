import request from "@/utils/request";
import type { Account } from "@/types/competition";

// Credentials stay in the form/request only, never in the persistent mutation queue.
export const emailAccount = {
  sendCode: (email: string) => request<{ retryAfter: number; expiresIn: number }>({ url: "/me/email/code", method: "POST", data: { email } }),
  bind: (data: { email: string; password: string; code: string }) => request<Account>({ url: "/me/email", method: "PUT", data }),
  changePassword: (data: { currentPassword: string; password: string }) => request<Account>({ url: "/me/password", method: "PUT", data }),
};
