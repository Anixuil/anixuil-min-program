import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { onHide } from "@dcloudio/uni-app";
import { reducedMotion } from "./useMotion";
import { motionDuration, useMotionClock } from "./useMotionState";

const ease = "cubic-bezier(.2,.8,.2,1)";

// Keep sheets and fixed docks outside the transformed page-content wrapper.
// A dock may use dockStyle directly, or on its own non-positioned inner view.
export function useSheetBackground(open: () => boolean, options: {
  selector: string;
  preserveGeometry?: () => boolean;
}) {
  const clock = useMotionClock();
  const blocked = ref(open()), blurred = ref(false), scaled = ref(false);
  const scaling = ref(false), preparing = ref(false);
  const origin = ref("50% 0px");
  let originLocked = false;

  const backgroundBlocked = computed(() => open() || blocked.value);
  // FLIP and shared-element coordinates are safe only at the original scale.
  // A blur-only sheet does not change those coordinates.
  const geometryStable = computed(() => !preparing.value && !scaled.value && !scaling.value);
  function style(transformOrigin: string) {
    const animate = clock.active.value && !reducedMotion.value;
    const transform = scaled.value ? "scale(.965)" : scaling.value ? "scale(1)" : "none";
    const filter = blurred.value ? "blur(2px)" : animate && blocked.value ? "blur(0px)" : "none";
    return `transform:${transform};transform-origin:${transformOrigin};filter:${filter};transition:${animate ? `transform ${motionDuration.sheet}ms ${ease},filter ${motionDuration.sheet}ms ${ease}` : "none"};${backgroundBlocked.value ? "pointer-events:none;" : ""}`;
  }
  const backgroundStyle = computed(() => style(origin.value));
  const dockStyle = computed(() => style("center bottom"));

  function settle() {
    clock.clear();
    blocked.value = open();
    blurred.value = scaled.value = scaling.value = preparing.value = false;
    originLocked = false;
  }

  watch([open, () => Boolean(options.preserveGeometry?.()), reducedMotion, clock.active], async ([isOpen, preserve]) => {
    clock.clear();
    preparing.value = false;
    if (!clock.active.value || reducedMotion.value) { settle(); return; }
    const ticket = clock.ticket();

    if (isOpen) {
      blocked.value = true;
      if (!preserve && !originLocked) {
        preparing.value = true;
        await nextTick();
        if (!clock.valid(ticket)) return;
        const [rect] = await clock.measure(options.selector);
        if (!clock.valid(ticket)) return;
        const viewportAnchor = uni.getWindowInfo().windowHeight * .4;
        // Use viewport-relative pixels, not a percentage of a long page.
        const anchor = rect ? Math.min(rect.height, Math.max(0, viewportAnchor - rect.top)) : viewportAnchor;
        origin.value = `50% ${anchor}px`;
        originLocked = true;
      }
      scaling.value = scaling.value || scaled.value !== !preserve;
      scaled.value = !preserve;
      blurred.value = true;
      preparing.value = false;
      clock.later(() => { scaling.value = false; }, motionDuration.sheet);
      return;
    }

    // Keep the measured origin through exit and an interrupted reopen. Measuring
    // a partially scaled wrapper would otherwise move its next transform origin.
    scaling.value = scaling.value || scaled.value;
    scaled.value = blurred.value = false;
    if (!blocked.value) { originLocked = false; return; }
    clock.later(() => {
      blocked.value = scaling.value = false;
      originLocked = false;
    }, motionDuration.sheet);
  }, { immediate: true, flush: "sync" });

  onHide(settle);
  onUnmounted(settle);
  return { backgroundStyle, dockStyle, backgroundBlocked, geometryStable };
}
