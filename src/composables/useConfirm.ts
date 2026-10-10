import { onUnmounted, ref } from "vue";
export function useConfirm() {
  const confirmation = ref("");
  let settle: ((value: boolean) => void) | undefined;
  function answer(value: boolean) { const callback = settle; settle = undefined; confirmation.value = ""; callback?.(value); }
  function ask(message: string) { answer(false); confirmation.value = message; return new Promise<boolean>(resolve => { settle = resolve; }); }
  onUnmounted(() => answer(false));
  return { confirmation, ask, answer };
}
