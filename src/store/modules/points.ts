import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { pointsApi } from "@/api/points";
import { useUserStore } from "@/store/modules/user";
import type { PointsSummary } from "@/types/points";

export const usePointsStore = defineStore("points", () => {
  const user = useUserStore();
  const summary = ref<PointsSummary | null>(null);
  const loading = ref(false), busy = ref(false), error = ref(""), notice = ref("");
  let revision = 0, sessionRevision = 0;

  function clear() {
    revision++; sessionRevision++;
    summary.value = null; loading.value = false; busy.value = false;
    error.value = ""; notice.value = "";
  }
  watch(() => user.token, clear, { flush: "sync" });

  function accept(value: PointsSummary) {
    if (!user.token) return;
    // An earlier read must never overwrite a wallet returned by a successful write.
    revision++; loading.value = false; summary.value = value; error.value = "";
  }

  async function load(): Promise<void> {
    if (!user.token) { clear(); return; }
    if (busy.value) return;
    const current = ++revision, session = user.token;
    loading.value = true; error.value = "";
    try {
      const result = await pointsApi.summary();
      if (current === revision && session === user.token) {
        if (summary.value?.date !== result.date) notice.value = "";
        summary.value = result;
      }
    } catch (cause: any) {
      if (current === revision && session === user.token) error.value = cause.message || "积分暂时无法读取，请重试";
      throw cause;
    } finally {
      if (current === revision && session === user.token) loading.value = false;
    }
  }

  async function checkIn(): Promise<void> {
    if (!user.token || busy.value || loading.value) return;
    if (summary.value?.checkedIn) { notice.value = "今日已签到，明天再来领取"; return; }
    const currentSession = sessionRevision, session = user.token;
    revision++; loading.value = false; busy.value = true; error.value = ""; notice.value = "";
    try {
      const result = await pointsApi.checkIn();
      if (currentSession !== sessionRevision || session !== user.token) return;
      accept(result.wallet);
      notice.value = result.awarded ? `签到成功，获得 ${result.wallet.checkInReward} 积分` : "今日已签到，明天再来领取";
      // The write already returns the authoritative wallet. Follow-up list failures only retry reads.
    } catch (cause: any) {
      if (currentSession === sessionRevision && session === user.token) error.value = cause.message || "签到结果暂未确认，请重试确认";
      throw cause;
    } finally {
      if (currentSession === sessionRevision && session === user.token) busy.value = false;
    }
    // A recovered idempotent response can belong to yesterday. Refresh the server's current business day.
    // Failure here must leave the successful write confirmed and only offer a read retry.
    if (currentSession === sessionRevision && session === user.token) {
      try { await load(); }
      catch { if (session === user.token) error.value = "签到已确认，最新积分状态读取失败，请重新读取"; }
    }
  }

  return { summary, loading, busy, error, notice, load, checkIn, accept, clear };
});
