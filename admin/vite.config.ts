import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return { plugins: [vue()], base: env.ADMIN_BASE || "/", server: { port: 5174, strictPort: true, proxy: { "/ani-server": { target: env.ADMIN_API_TARGET || "http://127.0.0.1:3000", changeOrigin: true } } }, build: { outDir: "dist" } };
});
