import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { onHide } from "@dcloudio/uni-app";
import type { CompetitionSummary } from "@/types/competition";

const systemReduced = ref(false);
// #ifdef H5
if (typeof window !== "undefined" && window.matchMedia) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  systemReduced.value = media.matches;
  media.addEventListener?.("change", event => { systemReduced.value = event.matches; });
}
// #endif
// No app-level motion switch or persisted override. Honor the H5 system preference.
export const reducedMotion = computed(() => systemReduced.value);
export function useMotion() { return { reducedMotion }; }
export function useKeyboard() {
  const keyboardHeight = ref(0);
  const update = (event: { height: number }) => { keyboardHeight.value = event.height; };
  onMounted(() => uni.onKeyboardHeightChange?.(update));
  onUnmounted(() => uni.offKeyboardHeightChange?.(update));
  return keyboardHeight;
}
export interface MotionRect { id: string; left: number; top: number; width: number; height: number; bottom: number }
export function useLayoutMotion() {
  const instance = getCurrentInstance();
  const styles = ref<Record<string, string>>({});
  let generation = 0;
  let alive = true;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const pendingMeasurements = new Set<() => void>();
  function later(callback: () => void, ms: number) { const timer = setTimeout(() => { timers.delete(timer); if (alive) callback(); }, ms); timers.add(timer); }
  function measure(selector: string): Promise<MotionRect[]> {
    if (!alive) return Promise.resolve([]);
    return new Promise(resolve => {
      let settled = false;
      let timeout: ReturnType<typeof setTimeout>;
      const abort = () => finish([]);
      const finish = (value: MotionRect[]) => { if (!settled) { settled = true; clearTimeout(timeout); pendingMeasurements.delete(abort); resolve(value); } };
      // Measurement must never block a business state update.
      pendingMeasurements.add(abort);
      timeout = setTimeout(abort, 120);
      try {
        const query = uni.createSelectorQuery().in(instance?.proxy);
        query.selectAll(selector).boundingClientRect((rows: any) => finish((Array.isArray(rows) ? rows : []).filter(r => r && r.width > 0 && r.height > 0))).exec();
      } catch { finish([]); }
    });
  }
  function cancel() { generation++; styles.value = {}; timers.forEach(clearTimeout); timers.clear(); pendingMeasurements.forEach(finish => finish()); pendingMeasurements.clear(); }
  async function scrollIntoView(selector: string) {
    const [rect] = await measure(selector); if (!rect || !alive) return;
    uni.createSelectorQuery().selectViewport().scrollOffset((offset: any) => {
      if (alive) uni.pageScrollTo({ scrollTop: Math.max(0, rect.top + (offset?.scrollTop || 0) - 24), duration: reducedMotion.value ? 0 : 180 });
    }).exec();
  }
  async function flip(update: () => void) {
    cancel(); const ticket = generation;
    if (!alive) return;
    if (reducedMotion.value) { update(); return; }
    const before = await measure(".bm-flip");
    if (!alive || ticket !== generation) return;
    update(); await nextTick();
    if (!alive || ticket !== generation || reducedMotion.value) return;
    const after = await measure(".bm-flip");
    if (ticket !== generation || reducedMotion.value) return;
    const height = uni.getWindowInfo().windowHeight;
    const old = new Map(before.map(rect => [rect.id, rect]));
    const next: Record<string, string> = {};
    after.filter(rect => rect.bottom > 0 && rect.top < height).slice(0, 18).forEach(rect => {
      const previous = old.get(rect.id);
      if (previous && previous.bottom > 0 && previous.top < height) {
        const x = previous.left - rect.left, y = previous.top - rect.top;
        if (Math.abs(x) + Math.abs(y) > 1) next[rect.id] = `transform:translate(${x}px,${y}px);transition:none;`;
      } else next[rect.id] = "opacity:0;transform:translateY(8px);transition:none;";
    });
    styles.value = next;
    later(() => { if (ticket === generation) styles.value = Object.fromEntries(Object.keys(next).map(id => [id, "transform:translate(0,0);opacity:1;transition:transform 240ms cubic-bezier(.2,.8,.2,1),opacity 180ms ease;"])); }, 32);
    later(() => { if (ticket === generation) styles.value = {}; }, 300);
  }
  watch(reducedMotion, cancel);
  onHide(cancel);
  onMounted(() => uni.onWindowResize?.(cancel));
  onUnmounted(() => { alive = false; cancel(); uni.offWindowResize?.(cancel); });
  return { styles, measure, flip, cancel, scrollIntoView };
}

export const sharedMatch = ref<CompetitionSummary | null>(null);
export const transitioningMatch = ref("");
let destinationReady: ((id: string) => void) | undefined;
export function markMatchReady(id: string) { destinationReady?.(id); }
let navigating = false;
export async function openMatch(match: CompetitionSummary) {
  if (navigating) return;
  navigating = true; sharedMatch.value = match;
  let performed: Promise<void> | undefined;
  const ready = new Promise<void>(resolve => { destinationReady = id => { if (id === match.id) resolve(); }; });
  const navigate = () => performed ||= new Promise<void>((resolve, reject) => uni.navigateTo({
    url: `/pages/matchDetails/index?id=${match.id}`,
    success: () => { transitioningMatch.value = ""; Promise.race([ready, new Promise<void>(done => setTimeout(done, 500))]).then(() => nextTick()).then(resolve); }, fail: reject,
  }));
  try {
    // #ifdef H5
    const doc = document as Document & { startViewTransition?: (update: () => Promise<void>) => { finished: Promise<void>; updateCallbackDone: Promise<void>; ready: Promise<void> } };
    if (!reducedMotion.value && doc.startViewTransition) {
      transitioningMatch.value = match.id; await nextTick();
      try {
        const transition = doc.startViewTransition(navigate);
        transition.ready.catch(() => {}); transition.finished.catch(() => {});
        await transition.updateCallbackDone;
      } catch { await navigate(); }
      return;
    }
    // #endif
    await navigate();
  } catch { uni.showToast({ title: "页面打开失败，请重试", icon: "none" }); }
  finally { navigating = false; transitioningMatch.value = ""; destinationReady = undefined; }
}
