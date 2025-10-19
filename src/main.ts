import { createSSRApp } from "vue";
import App from "./App.vue";
import "uno.css";
import { setupStore } from "@/store";
import uViews from "uview-plus";
export function createApp() {
  const app = createSSRApp(App);
  // 全局注册 store
  setupStore(app);
  app.use(uViews); // 全局注册 uView 组件
  return {
    app,
  };
}
