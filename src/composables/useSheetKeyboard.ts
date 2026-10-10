import { computed, nextTick, onMounted, onUnmounted, provide, ref, watch, type InjectionKey } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import { useMotionClock } from "./useMotionState";
import type { MotionRect } from "./useMotion";
import { viewportLayoutRevision } from "./useViewportLayout";

export interface FieldKeyboardEvent { detail: { height: number; duration?: number } }
export interface SheetField {
  measure: () => Promise<MotionRect | undefined>;
  blur: () => void;
}
interface SheetKeyboardContext {
  focus: (field: SheetField, height?: number) => void;
  blur: (field: SheetField) => void;
  keyboard: (field: SheetField, event: FieldKeyboardEvent) => void;
}
export const sheetKeyboardKey: InjectionKey<SheetKeyboardContext> = Symbol("bm-sheet-keyboard");

// Field measurements run in the field's component scope, including slotted fields.
export function useSheetKeyboard(options: { enabled: () => boolean; layoutChange: () => void }) {
  const clock = useMotionClock();
  const height = ref(0), bottom = ref(0), viewportHeight = ref(uni.getWindowInfo().windowHeight);
  const headerHeight = ref(80), safeBottom = ref(0), scrollTop = ref(0), settling = ref(false), visualKeyboard = ref(false);
  const baselineHeight = ref(viewportHeight.value);
  let baselineBottom = viewportHeight.value, restoringViewport = false;
  let focused: SheetField | undefined;
  let keyboardField: SheetField | undefined;
  let heightSource: "none" | "focus" | "global" | "field" = "none";
  let ownsKeyboard = false, actualScrollTop = 0, scrollVersion = 0, layoutVersion = 0;
  let refreshVersion = 0;
  let scrollTimer: ReturnType<typeof setTimeout> | undefined;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  const enabled = () => options.enabled() && clock.active.value;
  const available = computed(() => Math.max(0, Math.min(baselineHeight.value * .9, viewportHeight.value - bottom.value - 12) - headerHeight.value - safeBottom.value));
  const avoidingKeyboard = computed(() => height.value > 0 || bottom.value > 0 || visualKeyboard.value);
  const style = computed(() => `bottom:${bottom.value}px;${avoidingKeyboard.value ? "padding-bottom:0;" : ""}`);

  async function revealField(version: number) {
    const field = focused;
    if (!enabled() || !field) return;
    await nextTick();
    const [[viewport], rect] = await Promise.all([clock.measure(".bm-sheet-scroll"), field.measure()]);
    if (version !== scrollVersion || focused !== field || !enabled() || !viewport || !rect) return;
    const top = viewport.top + 12, bottomEdge = viewport.bottom - 12;
    const delta = rect.height > bottomEdge - top || rect.top < top ? rect.top - top : Math.max(0, rect.bottom - bottomEdge);
    if (Math.abs(delta) < 1) return;
    // Sync the controlled value after manual scrolling before issuing a new target.
    scrollTop.value = actualScrollTop;
    await nextTick();
    if (version !== scrollVersion || focused !== field || !enabled()) return;
    scrollTop.value = Math.max(0, actualScrollTop + delta);
  }
  function reveal() {
    const version = ++scrollVersion;
    clearTimeout(scrollTimer);
    if (!focused || !enabled()) return;
    // Give the native view layer time to apply keyboard/layout changes.
    scrollTimer = setTimeout(() => { void revealField(version); }, 32);
  }
  async function refresh() {
    const version = ++layoutVersion;
    if (!enabled()) return;
    await nextTick();
    const [modal, header] = await clock.measure(".bm-modal, .bm-sheet-header");
    if (version !== layoutVersion || !enabled() || !modal) return;
    const info = uni.getWindowInfo();
    // Preserve the unshifted page boundary throughout keyboard opening/closing.
    if (!height.value && !ownsKeyboard && !restoringViewport) {
      baselineHeight.value = modal.height;
      baselineBottom = modal.bottom;
    }
    viewportHeight.value = modal.height;
    if (header) headerHeight.value = Math.ceil(header.height);
    safeBottom.value = height.value ? 0 : (info.safeAreaInsets?.bottom || 0);
    // Both boundaries are page-local. Account for native resize/pan once, without
    // mixing screenTop or an assumed native tab-bar height into selector coordinates.
    const hostAvoidance = Math.max(0, baselineBottom - modal.bottom);
    let inset = Math.max(0, height.value - hostAvoidance);
    // #ifdef H5
    const visual = window.visualViewport;
    if (visual) {
      inset = Math.max(0, modal.bottom - (visual.offsetTop + visual.height));
      viewportHeight.value = Math.max(0, modal.bottom - Math.max(modal.top, visual.offsetTop));
      visualKeyboard.value = ownsKeyboard && baselineHeight.value - visual.height > 12;
      safeBottom.value = inset > 0 || visualKeyboard.value ? 0 : safeBottom.value;
    }
    // #endif
    bottom.value = inset;
    options.layoutChange();
    reveal();
  }
  function queueRefresh() {
    const version = ++refreshVersion;
    if (!enabled()) return;
    void refresh();
    // Native chrome and keyboard events can precede the committed view layout.
    clock.later(() => { if (version === refreshVersion) void refresh(); }, 32);
    clock.later(() => { if (version === refreshVersion) void refresh(); }, 280);
  }
  function settleLayout() {
    settling.value = true;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      settling.value = false;
      if (!height.value && !ownsKeyboard) restoringViewport = false;
      void refresh();
    }, 250);
  }
  function updateHeight(value: number) {
    if (!enabled() || !ownsKeyboard || !Number.isFinite(value)) return;
    const next = Math.max(0, value);
    if (height.value === next && next > 0) return;
    settleLayout();
    height.value = next;
    if (!next) {
      ownsKeyboard = false; restoringViewport = true; heightSource = "none";
    }
    queueRefresh();
  }
  function reset() {
    const field = focused, shouldHide = ownsKeyboard;
    focused = keyboardField = undefined; ownsKeyboard = false; heightSource = "none";
    layoutVersion++; scrollVersion++; clearTimeout(scrollTimer);
    refreshVersion++; clock.clear();
    clearTimeout(settleTimer); settling.value = false;
    height.value = bottom.value = 0;
    visualKeyboard.value = false;
    actualScrollTop = scrollTop.value = 0;
    field?.blur();
    if (shouldHide) { restoringViewport = true; uni.hideKeyboard(); settleLayout(); }
  }
  provide(sheetKeyboardKey, {
    focus(field, keyboardHeight) {
      if (!enabled()) return;
      if (keyboardField !== field) heightSource = "none";
      keyboardField = field;
      focused = field; ownsKeyboard = true;
      // Some hosts report zero during a focus hand-off while the keyboard remains open.
      if (heightSource !== "field" && keyboardHeight !== undefined && keyboardHeight > 0) {
        heightSource = "focus"; updateHeight(keyboardHeight);
      }
      queueRefresh();
    },
    blur(field) {
      if (focused !== field) return;
      focused = undefined; scrollVersion++; clearTimeout(scrollTimer);
      // Keep the inset until the keyboard actually closes; blur also precedes button taps.
    },
    keyboard(field, event) {
      if (!enabled() || field !== (focused || keyboardField)) return;
      if (event.detail.height > 0) ownsKeyboard = true;
      heightSource = "field";
      updateHeight(event.detail.height);
    },
  });
  function onKeyboard(event: { height: number }) {
    if (!enabled()) return;
    if (event.height > 0) {
      if (heightSource === "field" || heightSource === "focus") return;
      if (focused) ownsKeyboard = true;
      heightSource = "global";
    }
    updateHeight(event.height);
  }
  function onResize() { if (enabled()) { settleLayout(); queueRefresh(); } }
  function onScroll(event: { detail: { scrollTop: number } }) {
    actualScrollTop = event.detail.scrollTop;
    options.layoutChange();
  }
  function onTouchMove() { scrollVersion++; clearTimeout(scrollTimer); }
  watch(options.enabled, value => {
    if (!value) reset();
    else {
      actualScrollTop = scrollTop.value = 0;
      if (restoringViewport) settleLayout();
      queueRefresh();
    }
  }, { flush: "sync" });
  watch(viewportLayoutRevision, onResize);
  onHide(reset);
  onShow(() => { if (restoringViewport) settleLayout(); queueRefresh(); });
  onMounted(() => {
    uni.onKeyboardHeightChange?.(onKeyboard);
    uni.onWindowResize?.(onResize);
    // #ifdef H5
    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onResize);
    // #endif
    queueRefresh();
  });
  onUnmounted(() => {
    reset();
    clearTimeout(settleTimer);
    uni.offKeyboardHeightChange?.(onKeyboard);
    uni.offWindowResize?.(onResize);
    // #ifdef H5
    window.visualViewport?.removeEventListener("resize", onResize);
    window.visualViewport?.removeEventListener("scroll", onResize);
    // #endif
  });
  return { avoidingKeyboard, settling, style, available, scrollTop, onScroll, onTouchMove, refresh, reveal, reset };
}
