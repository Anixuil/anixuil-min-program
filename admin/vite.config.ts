import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

const adminDir = fileURLToPath(new URL(".", import.meta.url));
const sharedEnvDir = fileURLToPath(new URL("..", import.meta.url));

export default defineConfig(({ mode }) => {
  const sharedEnv = loadEnv(mode, sharedEnvDir, "VITE_");
  const adminEnv = loadEnv(mode, adminDir, "ADMIN_");
  return {
    plugins: [vue()],
    envDir: sharedEnvDir,
    base: adminEnv.ADMIN_BASE || "/",
    server: {
      port: 5174,
      strictPort: true,
      proxy: {
        "/ani-server": {
          target: adminEnv.ADMIN_API_TARGET || sharedEnv.VITE_BADMINTON_ORIGIN || "http://127.0.0.1:3000",
          changeOrigin: true,
        },
      },
    },
    build: { outDir: "dist" },
  };
});
