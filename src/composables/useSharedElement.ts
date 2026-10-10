import { nextTick, onUnmounted, ref, watch } from "vue";
import { onHide } from "@dcloudio/uni-app";
import { reducedMotion, type MotionRect } from "./useMotion";
export function useSharedElement() {
  const proxyStyle = ref(""), flying = ref(false);
  let ticket = 0, alive = true;
  let finish: (() => void) | undefined;
  let frame: ReturnType<typeof setTimeout> | undefined, timer: ReturnType<typeof setTimeout> | undefined;
  function cancel() { ticket++; clearTimeout(frame); clearTimeout(timer); flying.value = false; proxyStyle.value = ""; finish?.(); finish = undefined; }
  async function fly(from?: MotionRect, to?: MotionRect) {
    cancel(); if (!from || !to || reducedMotion.value || !alive) return;
    const height = uni.getWindowInfo().windowHeight;
    if (from.top < 0 || from.bottom > height || to.top < 0 || to.bottom > height) return;
    const current = ticket;
    const base = `left:${to.left}px;top:${to.top}px;width:${to.width}px;height:${to.height}px;`;
    proxyStyle.value = `${base}transform:translate(${from.left - to.left}px,${from.top - to.top}px) scale(${from.width / to.width},${from.height / to.height});transition:none;`;
    flying.value = true; await nextTick();
    if (!alive || current !== ticket) return;
    await new Promise<void>(resolve => {
      finish = resolve;
      frame = setTimeout(() => { if (current === ticket) proxyStyle.value = `${base}transform:translate(0,0) scale(1);transition:transform 240ms cubic-bezier(.2,.8,.2,1);`; }, 32);
      timer = setTimeout(() => { if (current === ticket) { flying.value = false; finish = undefined; resolve(); } }, 280);
    });
  }
  watch(reducedMotion, cancel);
  onHide(cancel);
  onUnmounted(() => { alive = false; cancel(); });
  return { proxyStyle, flying, fly, cancel };
}
