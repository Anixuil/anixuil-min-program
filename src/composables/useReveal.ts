import { computed, inject, nextTick, ref, watch } from "vue";
import { reducedMotion } from "@/composables/useMotion";
import { motionDuration, useMotionClock } from "@/composables/useMotionState";

// Keep the content in its owner's template instead of forwarding it through a slot.
export function useReveal(isOpen: () => boolean, options: { selector?: string; duration?: number } = {}) {
  const fitSheet = inject<() => void>("bm:fit-sheet", () => {});
  const clock = useMotionClock();
  const rendered = ref(isOpen());
  const visible = ref(isOpen());
  const height = ref<number | null>(null), measuring = ref(false);
  const duration = options.duration ?? motionDuration.content;
  const style = computed(() => {
    const ms = reducedMotion.value || !clock.active.value || measuring.value ? 0 : duration;
    return `opacity:${visible.value ? 1 : 0};${height.value === null ? "" : `height:${height.value}px;overflow:hidden;`}`
      + `transition:height ${ms}ms cubic-bezier(.2,.8,.2,1),opacity ${ms}ms ease;${isOpen() && visible.value ? "" : "pointer-events:none;"}`;
  });
  function cancel() {
    clock.clear(); rendered.value = visible.value = isOpen(); height.value = null; measuring.value = false;
    const ticket = clock.ticket();
    void nextTick().then(() => { if (clock.valid(ticket)) fitSheet(); });
  }
  watch([isOpen, reducedMotion, clock.active], async () => {
    if (reducedMotion.value || !clock.active.value) { cancel(); return; }
    clock.clear();
    const ticket = clock.ticket(), open = isOpen();
    if (open) {
      const wasRendered = rendered.value;
      rendered.value = true;
      if (!wasRendered) { visible.value = false; height.value = options.selector ? 0 : null; }
      await nextTick();
      if (!clock.valid(ticket)) return;
      const [rect] = await clock.measure(options.selector);
      if (!clock.valid(ticket)) return;
      if (options.selector && !rect) { cancel(); return; }
      clock.later(() => {
        measuring.value = false; height.value = rect?.height ?? null; visible.value = true; fitSheet();
      }, 32);
      clock.later(() => { height.value = null; fitSheet(); }, duration + 32);
    } else {
      if (options.selector && height.value === null) {
        const [rect] = await clock.measure(options.selector);
        if (!clock.valid(ticket)) return;
        if (!rect) { cancel(); return; }
        measuring.value = true; height.value = rect.height;
        await nextTick();
        if (!clock.valid(ticket)) return;
      }
      clock.later(() => { measuring.value = false; visible.value = false; if (options.selector) height.value = 0; fitSheet(); }, 32);
      clock.later(async () => {
        rendered.value = false; height.value = null;
        await nextTick();
        if (clock.valid(ticket)) fitSheet();
      }, duration + 32);
    }
  });
  return { rendered, visible, style, cancel };
}
