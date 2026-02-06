import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import fs from "fs";

// 插件：将 options.html 移动到根目录
const moveOptionsHtmlPlugin = () => {
  return {
    name: "move-options-html",
    writeBundle(options, bundle) {
      const outDir = options.dir || options.file?.replace(/\/[^/]+$/, "");
      if (!outDir) return;

      const srcOptionsPath = path.join(outDir, "src/options/options.html");
      const destOptionsPath = path.join(outDir, "options.html");

      // 如果存在 src/options/options.html，移动到根目录
      if (fs.existsSync(srcOptionsPath)) {
        // 读取文件内容并更新资源路径
        let content = fs.readFileSync(srcOptionsPath, "utf-8");
        // 更新资源路径：从 /assets/ 改为 ./assets/（相对路径）
        content = content.replace(/href="\/assets\//g, 'href="./assets/');
        content = content.replace(/src="\/assets\//g, 'src="./assets/');

        // 写入到根目录
        fs.writeFileSync(destOptionsPath, content, "utf-8");

        // 删除原文件
        fs.unlinkSync(srcOptionsPath);

        // 删除空的目录
        const srcOptionsDir = path.join(outDir, "src/options");
        const srcDir = path.join(outDir, "src");
        try {
          if (fs.existsSync(srcOptionsDir) && fs.readdirSync(srcOptionsDir).length === 0) {
            fs.rmdirSync(srcOptionsDir);
          }
          if (fs.existsSync(srcDir) && fs.readdirSync(srcDir).length === 0) {
            fs.rmdirSync(srcDir);
          }
        } catch (e) {
          // 忽略删除目录的错误
        }
      }
    },
  };
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), "");
  const plugins = [vue(), vueJsx(), moveOptionsHtmlPlugin()];

  return {
    build: {
      // 输出目录（临时目录）
      outDir: path.resolve(__dirname, env.VITE_CRX_OPTIONS_OUTDIR),
      // 指定入口文件
      rollupOptions: {
        input: {
          options: path.resolve(__dirname, "src/options/options.html"),
        },
        output: {
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash].[ext]",
        },
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
