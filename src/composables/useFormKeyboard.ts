import { onMounted, onUnmounted, ref, watch } from "vue";
import { onHide, onShow } from "@dcloudio/uni-app";
import type { FieldKeyboardEvent } from "./useSheetKeyboard";

// Page fields keep native keyboard avoidance; only the fixed action bar is hidden.
export function useFormKeyboard(enabled: () => boolean) {
  const dockHidden = ref(false);
  let pageVisible = true, focusedField = "", keyboardField = "", keyboardOpen = false;
  let version = 0;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;
  // #ifdef H5
  let visualBaseline = 0, visualKeyboardOpen = false;
  // #endif
  const active = () => pageVisible && enabled();

  function cancelClose() {
    version++;
    clearTimeout(closeTimer);
    closeTimer = undefined;
  }
  function closeAfterHandoff(allowFocused: boolean) {
    cancelClose();
    const ticket = version;
    closeTimer = setTimeout(() => {
      if (ticket !== version || !active() || keyboardOpen || (!allowFocused && focusedField)) return;
      dockHidden.value = false;
      if (!focusedField) keyboardField = "";
    }, 120);
  }
  function updateKeyboard(height: number) {
    if (!active() || !keyboardField || !Number.isFinite(height)) return;
    keyboardOpen = height > 0;
    if (keyboardOpen) {
      cancelClose();
      dockHidden.value = true;
    } else {
      // Blur and focus can surround a zero-height event while changing fields.
      closeAfterHandoff(true);
    }
  }
  function focus(field: string, event: { detail: { height?: number } }) {
    if (!active()) return;
    cancelClose();
    focusedField = keyboardField = field;
    dockHidden.value = true;
    if (event.detail.height && event.detail.height > 0) keyboardOpen = true;
    // #ifdef H5
    const visual = window.visualViewport;
    if (visual && !visualKeyboardOpen) visualBaseline = Math.max(visualBaseline, visual.height);
    // #endif
  }
  function blur(field: string) {
    if (!active() || focusedField !== field) return;
    focusedField = "";
    // A visible keyboard owns the hidden state until a real close event arrives.
    if (!keyboardOpen) closeAfterHandoff(false);
  }
  function keyboard(field: string, event: FieldKeyboardEvent) {
    if (field !== keyboardField) return;
    updateKeyboard(event.detail.height);
  }
  function reset() {
    const hadInput = !!focusedField || dockHidden.value;
    cancelClose();
    focusedField = keyboardField = "";
    keyboardOpen = false;
    dockHidden.value = false;
    // #ifdef H5
    visualKeyboardOpen = false;
    if (hadInput) (document.activeElement as HTMLElement | null)?.blur?.();
    // #endif
    if (hadInput) uni.hideKeyboard();
  }
  function globalKeyboard(event: { height: number }) { updateKeyboard(event.height); }
  // #ifdef H5
  function visualResize() {
    const visual = window.visualViewport;
    if (!active() || !visual || Math.abs(visual.scale - 1) > .01) return;
    if (!keyboardField) {
      visualBaseline = visual.height;
      visualKeyboardOpen = false;
      return;
    }
    const shrunk = visualBaseline - visual.height > 80;
    if (shrunk) {
      visualKeyboardOpen = true;
      updateKeyboard(visualBaseline - visual.height);
    } else if (visualKeyboardOpen) {
      visualKeyboardOpen = false;
      visualBaseline = visual.height;
      updateKeyboard(0);
    }
  }
  // #endif
  watch(enabled, value => { if (!value) reset(); }, { flush: "sync" });
  onHide(() => { pageVisible = false; reset(); });
  onShow(() => {
    pageVisible = true;
    // #ifdef H5
    visualBaseline = window.visualViewport?.height || 0;
    // #endif
  });
  onMounted(() => {
    uni.onKeyboardHeightChange?.(globalKeyboard);
    // #ifdef H5
    visualBaseline = window.visualViewport?.height || 0;
    window.visualViewport?.addEventListener("resize", visualResize);
    // #endif
  });
  onUnmounted(() => {
    pageVisible = false;
    reset();
    uni.offKeyboardHeightChange?.(globalKeyboard);
    // #ifdef H5
    window.visualViewport?.removeEventListener("resize", visualResize);
    // #endif
  });
  return { dockHidden, focus, blur, keyboard, reset };
}
