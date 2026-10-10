import { defineConfig, loadEnv, normalizePath, type Plugin } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import AutoImport from "unplugin-auto-import/vite";

// uni-app 3.0.0-4030620241128001 uses the deprecated API for locale and upx2px internally.
// Keep this scoped to its WeChat runtime until the pinned uni-app version is upgraded.
function wechatSystemInfoCompat(): Plugin {
  return {
    name: "wechat-system-info-compat",
    enforce: "pre",
    transform(code, id) {
      const path = normalizePath(id).split("?")[0];
      if (!/\/@dcloudio\/uni-mp-weixin\/dist\/uni\.(api|mp)\.esm\.js$/.test(path)) return null;
      const updated = code
        .replaceAll("wx.getSystemInfoSync().language", "(wx.getAppBaseInfo ? wx.getAppBaseInfo() : wx.getSystemInfoSync()).language")
        .replace(
          /(function getBaseSystemInfo\(\) \{\s*)return wx\.getSystemInfoSync\(\);/,
          "$1return wx.getWindowInfo && wx.getDeviceInfo ? { ...wx.getWindowInfo(), platform: wx.getDeviceInfo().platform } : wx.getSystemInfoSync();",
        );
      return updated === code ? null : { code: updated, map: null };
    },
  };
}

export default defineConfig(async ({ mode }) => {
  const UnoCss = await import("unocss/vite").then(m => m.default);
  const env = loadEnv(mode, process.cwd());
  return {
    server: { host: "0.0.0.0", port: 5173, strictPort: true, proxy: { "/ani-server": { target: env.VITE_BADMINTON_ORIGIN || "http://127.0.0.1:3000", changeOrigin: true } } },
    plugins: [wechatSystemInfoCompat(), uni(), UnoCss(), AutoImport({ imports: ["vue", "uni-app"], dts: "src/types/auto-imports.d.ts", eslintrc: { enabled: true, filepath: "./.eslintrc-auto-import.json" } })],
  };
});
