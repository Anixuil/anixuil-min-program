import { ref } from "vue";

// Native chrome changes do not consistently trigger a window-resize callback.
export const viewportLayoutRevision = ref(0);
export function notifyViewportLayoutChange() { viewportLayoutRevision.value++; }
