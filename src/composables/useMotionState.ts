import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from "vue";
import { onHide, onPageScroll, onResize, onShow } from "@dcloudio/uni-app";
import { reducedMotion, type MotionRect } from "./useMotion";

export const motionDuration = { press: 120, exit: 160, content: 220, sheet: 300 };
const ease = "cubic-bezier(.2,.8,.2,1)";

// All callbacks and selector queries belong to the current visual operation.
export function useMotionClock() {
  const instance = getCurrentInstance();
  const active = ref(true);
  let alive = true, generation = 0;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const measurements = new Set<() => void>();
  function later(callback: () => void, delay: number) {
    const ticket = generation;
    const timer = setTimeout(() => {
      timers.delete(timer);
      if (alive && ticket === generation) callback();
    }, delay);
    timers.add(timer);
  }
  function clear() {
    generation++;
    timers.forEach(clearTimeout);
    timers.clear();
    measurements.forEach(finish => finish());
    measurements.clear();
  }
  function measure(selector?: string): Promise<MotionRect[]> {
    if (!selector || !alive || !active.value) return Promise.resolve([]);
    return new Promise(resolve => {
      let settled = false;
      let timeout: ReturnType<typeof setTimeout>;
      const abort = () => finish([]);
      const finish = (value: MotionRect[]) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        measurements.delete(abort);
        resolve(value);
      };
      measurements.add(abort);
      timeout = setTimeout(abort, 120);
      try {
        uni.createSelectorQuery().in(instance?.proxy).selectAll(selector).boundingClientRect((value: any) => {
          finish((Array.isArray(value) ? value : []).filter(row => row && row.height > 0 && row.width > 0));
        }).exec();
      } catch { finish([]); }
    });
  }
  onShow(() => { active.value = true; });
  onHide(() => { active.value = false; clear(); });
  onUnmounted(() => { alive = false; active.value = false; clear(); });
  return { active, later, clear, measure, ticket: () => generation, valid: (ticket: number) => alive && ticket === generation };
}

export function usePresence<T extends string | boolean>(source: () => T, options: { duration?: number; immediate?: () => boolean } = {}) {
  const clock = useMotionClock();
  const rendered = ref(Boolean(source())), visible = ref(Boolean(source()));
  const displayed = shallowRef<T>(source());
  const duration = options.duration ?? motionDuration.exit;
  const style = computed(() => `animation:none;opacity:${visible.value ? 1 : 0};transition:opacity ${reducedMotion.value || !clock.active.value ? 0 : duration}ms ${ease};${!source() ? "pointer-events:none;" : ""}`);
  function settle() {
    clock.clear();
    rendered.value = visible.value = Boolean(source());
    displayed.value = source();
  }
  watch([source, reducedMotion, clock.active, () => options.immediate?.()], async () => {
    if (reducedMotion.value || !clock.active.value || options.immediate?.()) { settle(); return; }
    clock.clear();
    const ticket = clock.ticket(), value = source();
    if (value) {
      displayed.value = value;
      if (rendered.value) { visible.value = true; return; }
      rendered.value = true;
      visible.value = false;
      await nextTick();
      if (clock.valid(ticket)) clock.later(() => { visible.value = true; }, 32);
    } else {
      visible.value = false;
      clock.later(() => { rendered.value = false; displayed.value = source(); }, duration);
    }
  });
  return { rendered, visible, displayed, style, cancel: settle };
}

type MotionKey = string | number;
export function useSwitchMotion<T extends MotionKey>(source: () => T, options: { order?: () => readonly MotionKey[]; selector?: string } = {}) {
  const clock = useMotionClock();
  const displayed = shallowRef<T>(source());
  const style = ref(""), containerStyle = ref("");
  const phase = ref<"idle" | "leave" | "prepare" | "enter">("idle");
  const interactive = computed(() => (phase.value === "idle" || phase.value === "enter") && displayed.value === source());
  function settle() {
    clock.clear(); displayed.value = source(); style.value = ""; containerStyle.value = ""; phase.value = "idle";
  }
  watch([source, reducedMotion, clock.active], async () => {
    if (reducedMotion.value || !clock.active.value || displayed.value === source()) { settle(); return; }
    clock.clear();
    const ticket = clock.ticket();
    const order = options.order?.() || [];
    const direction = Math.sign(order.indexOf(source()) - order.indexOf(displayed.value));
    phase.value = "leave";
    style.value = `opacity:0;transform:translateX(${-direction * 12}px);pointer-events:none;transition:opacity 100ms ease,transform 100ms ${ease};`;
    void clock.measure(options.selector).then(([rect]) => {
      if (clock.valid(ticket) && phase.value === "leave" && rect) containerStyle.value = `min-height:${rect.height}px;`;
    });
    clock.later(async () => {
      displayed.value = source();
      phase.value = "prepare";
      style.value = `opacity:0;transform:translateX(${direction * 12}px);pointer-events:none;transition:none;`;
      await nextTick();
      if (!clock.valid(ticket)) return;
      clock.later(() => {
        phase.value = "enter";
        style.value = `opacity:1;transform:translateX(0);transition:opacity 120ms ease,transform 120ms ${ease};`;
      }, 32);
      clock.later(() => { style.value = ""; containerStyle.value = ""; phase.value = "idle"; }, 160);
    }, 100);
  });
  return { displayed, style, containerStyle, interactive, phase, cancel: settle };
}

export function useLoadingMotion(loading: () => boolean, hasData: () => boolean, options: { selector?: string } = {}) {
  const clock = useMotionClock();
  const loadingRendered = ref(loading());
  const loadingStyle = ref(""), contentStyle = ref(""), heldHeight = ref(0);
  let skeletonHeight = 0;
  const containerStyle = computed(() => `position:relative;${heldHeight.value ? `min-height:${heldHeight.value}px;` : ""}`);
  function settle() {
    clock.clear(); loadingRendered.value = loading(); loadingStyle.value = ""; contentStyle.value = ""; heldHeight.value = 0; skeletonHeight = 0;
  }
  watch([loading, hasData, reducedMotion, clock.active], async () => {
    if (reducedMotion.value || !clock.active.value) { settle(); return; }
    clock.clear();
    const ticket = clock.ticket();
    if (loading()) {
      contentStyle.value = ""; loadingStyle.value = ""; heldHeight.value = 0;
      // A quick response can skip the skeleton; it never waits for a minimum display time.
      const reveal = async () => {
        if (!loading()) return;
        loadingRendered.value = true;
        await nextTick();
        if (!clock.valid(ticket)) return;
        const [rect] = await clock.measure(options.selector);
        if (clock.valid(ticket) && loading()) skeletonHeight = rect?.height || 0;
      };
      if (!loadingRendered.value) clock.later(() => { void reveal(); }, 80);
      else void reveal();
      return;
    }
    if (!loadingRendered.value) { settle(); return; }
    heldHeight.value = skeletonHeight;
    loadingStyle.value = "position:absolute;top:0;left:0;right:0;opacity:0;pointer-events:none;transition:opacity 160ms ease;";
    contentStyle.value = hasData() ? "opacity:0;transition:none;" : "";
    await nextTick();
    if (!clock.valid(ticket)) return;
    clock.later(() => { contentStyle.value = "opacity:1;transition:opacity 220ms ease;"; }, 32);
    clock.later(() => { loadingRendered.value = false; loadingStyle.value = ""; }, motionDuration.exit);
    clock.later(() => { contentStyle.value = ""; heldHeight.value = 0; }, motionDuration.content + 32);
  });
  return { loadingRendered, loadingStyle, contentStyle, containerStyle, cancel: settle };
}

export interface MotionRow<T> { key: MotionKey; item: T; leaving: boolean; style: string }
export function useMotionList<T>(source: () => readonly T[], keyOf: (item: T) => MotionKey, options: { enabled?: () => boolean; resetKey?: () => unknown; selector?: string; idPrefix?: string } = {}) {
  const clock = useMotionClock();
  const rows = shallowRef<MotionRow<T>[]>(source().map(item => ({ key: keyOf(item), item, leaving: false, style: "" })));
  let rects = new Map<string, MotionRect>(), shown = source().length > 0;
  let resetKey = options.resetKey?.();
  const enabled = () => !reducedMotion.value && clock.active.value && options.enabled?.() !== false;
  const elementId = (key: MotionKey) => `${options.idPrefix || ""}${key}`;
  async function remember(ticket: number) {
    await nextTick();
    if (!clock.valid(ticket)) return;
    const measured = await clock.measure(options.selector);
    if (clock.valid(ticket)) rects = new Map(measured.map(rect => [rect.id, rect]));
  }
  function settle() {
    clock.clear();
    rows.value = source().map(item => ({ key: keyOf(item), item, leaving: false, style: "" }));
    rects.clear();
    shown = source().length > 0;
    if (enabled()) void remember(clock.ticket());
  }
  watch([() => source().map(item => ({ key: keyOf(item), item })), reducedMotion, clock.active, () => options.enabled?.(), () => options.resetKey?.()], async () => {
    const nextReset = options.resetKey?.();
    if (nextReset !== resetKey || !enabled()) { resetKey = nextReset; settle(); return; }
    clock.clear();
    const ticket = clock.ticket(), oldRows = rows.value.filter(row => !row.leaving);
    const oldKeys = new Set(oldRows.map(row => row.key));
    const values = source(), newKeys = new Set(values.map(keyOf));
    const before = new Map(rects);
    const first = !shown;
    shown ||= values.length > 0;
    const next: MotionRow<T>[] = values.map((item, index) => ({
      key: keyOf(item), item, leaving: false,
      style: !oldKeys.has(keyOf(item)) && (!first || index < 4) ? "opacity:0;transform:translateY(6px);transition:none;" : "",
    }));
    const viewport = uni.getWindowInfo().windowHeight;
    oldRows.forEach((row, index) => {
      const rect = before.get(elementId(row.key));
      if (newKeys.has(row.key) || !rect || rect.bottom <= 0 || rect.top >= viewport) return;
      const item = typeof row.item === "object" && row.item !== null ? { ...row.item } : row.item;
      next.splice(Math.min(index, next.length), 0, { key: row.key, item: item as T, leaving: true, style: `box-sizing:border-box;overflow:hidden;height:${rect.height}px;pointer-events:none;opacity:1;` });
    });
    rows.value = next;
    await nextTick();
    if (!clock.valid(ticket)) return;
    const after = await clock.measure(options.selector);
    if (!clock.valid(ticket)) return;
    if (options.selector && !after.length) { settle(); return; }
    const shifts = new Map<MotionKey, string>();
    after.filter(rect => rect.bottom > 0 && rect.top < viewport).slice(0, 18).forEach(rect => {
      const previous = before.get(rect.id);
      const row = rows.value.find(value => elementId(value.key) === rect.id);
      if (!previous || !row || row.leaving || !oldKeys.has(row.key)) return;
      const x = previous.left - rect.left, y = previous.top - rect.top;
      if (Math.abs(x) + Math.abs(y) > 1) shifts.set(row.key, `transform:translate(${x}px,${y}px);transition:none;`);
    });
    rows.value = rows.value.map(row => shifts.has(row.key) ? { ...row, style: shifts.get(row.key)! } : row);
    clock.later(() => {
      rows.value = rows.value.map((row, index) => ({ ...row, style: row.leaving
        ? `box-sizing:border-box;overflow:hidden;height:0;min-height:0;padding-top:0;padding-bottom:0;margin-top:0;margin-bottom:0;border-top-width:0;border-bottom-width:0;opacity:0;pointer-events:none;transform:translateX(-8px);transition:height 160ms ${ease},padding 160ms ${ease},margin 160ms ${ease},opacity 160ms ease,transform 160ms ${ease};`
        : row.style ? `opacity:1;transform:translate(0,0);transition:transform 220ms ${ease},opacity 220ms ease;transition-delay:${first && index < 4 ? index * 30 : 0}ms;` : "" }));
    }, 32);
    clock.later(() => { rows.value = rows.value.filter(row => !row.leaving); }, 192);
    clock.later(() => {
      rows.value = rows.value.map(row => ({ ...row, style: "" }));
      void remember(ticket);
    }, 350);
  });
  function invalidateLayout() {
    clock.clear(); rects.clear();
    rows.value = source().map(item => ({ key: keyOf(item), item, leaving: false, style: "" }));
    const ticket = clock.ticket();
    if (enabled()) clock.later(() => { void remember(ticket); }, 80);
  }
  onPageScroll(invalidateLayout);
  onResize(invalidateLayout);
  onMounted(async () => {
    if (!enabled() || !rows.value.length) return;
    clock.clear();
    const ticket = clock.ticket();
    rows.value = rows.value.map((row, index) => ({ ...row, style: index < 4 ? "opacity:0;transform:translateY(6px);transition:none;" : "" }));
    await nextTick();
    if (!clock.valid(ticket)) return;
    clock.later(() => {
      rows.value = rows.value.map((row, index) => ({ ...row, style: index < 4 ? `opacity:1;transform:translateY(0);transition:opacity 220ms ease,transform 220ms ${ease};transition-delay:${index * 30}ms;` : "" }));
    }, 32);
    clock.later(() => { rows.value = rows.value.map(row => ({ ...row, style: "" })); void remember(ticket); }, 350);
  });
  void remember(clock.ticket());
  return { rows, cancel: settle };
}

// Native navigation owns departure. Each semantic section enters independently,
// including sections mounted after the initial request finishes.
export function usePageMotion() {
  const clock = useMotionClock();
  const cycle = ref(0), entrance = ref(!reducedMotion.value);
  // Compatibility for existing callers; never fade the whole page over its sections.
  const pageStyle = ref("");
  onShow(() => {
    cycle.value = (cycle.value + 1) % 2;
    entrance.value = !reducedMotion.value;
  });
  // A preference change cancels the sequence; enabling motion does not replay
  // the currently visible content until the next page visit.
  watch(reducedMotion, () => { entrance.value = false; }, { flush: "sync" });
  function sectionStyle(order = 0, effect: "rise" | "fade" = "rise") {
    if (!clock.active.value || !entrance.value || reducedMotion.value) return "animation:none;";
    const delay = Math.min(Math.max(Number.isFinite(order) ? order : 0, 0), 4) * 40;
    const name = `bm-section-${effect}-${cycle.value ? "b" : "a"}`;
    // Backwards fill covers the short stagger, then releases transform/opacity
    // so settled sections cannot override later interaction or layout motion.
    return `animation:${name} ${motionDuration.content}ms ${ease} ${delay}ms backwards;`;
  }
  return { active: clock.active, pageStyle, sectionStyle };
}
