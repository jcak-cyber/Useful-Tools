import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), "");
  const plugins = [vue(), vueJsx()];

  return {
    build: {
      // 输出目录
      outDir: path.resolve(__dirname, env.VITE_CRX_OUTDIR),
    },
    server: {
      // 指定dev sever的端口号，默认为5173
      port: 3000,
      // 自动打开浏览器运行以下页面
      open: "/",
      // 设置反向代理
      proxy: {
        // 以下示例表示：请求URL中含有"/api"，则反向代理到http://localhost
        // 例如: http://localhost:3000/api/login -> http://localhost/api/login
        // 如果反向代理到localhost报错Error: connect ECONNREFUSED ::1:80，
        // 则将localhost改127.0.0.1
        // '/api': {
        //     target: 'http://127.0.0.1/',
        //     changeOrigin: true,
        // },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins,
  };
});
