import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { join } from "path";
import ora from "ora";
import fs from "fs";
import inquirer from "inquirer";
import createZip from "./createZip.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const spinner = ora("Building...");
const distName = "extensions";

function build() {
  spinner.start();
  let progress = 0;
  // 使用生产构建命令，确保热更新代码被排除
  const build = spawn("pnpm", ["build:prod"], { shell: true });

  build.stdout.on("data", (data) => {
    const output = data.toString();
    spinner.text = `Building... ${output.trim()}`;

    if (output.includes("vite")) progress += 20;
    if (output.includes("building")) progress += 30;
    if (output.includes("built in")) progress += 50;

    progress = Math.min(progress, 100);
    spinner.text = `Building... ${progress}%`;
  });

  // 暂时屏蔽警告
  build.stderr.on("data", (data) => {
    spinner.warn(`Error: ${data.toString()}`);
  });

  build.on("close", async (code) => {
    if (code === 0) {
      spinner.succeed("Build completed successfully!");

      // 运行后处理脚本移除 export 语句
      spinner.start("Removing export statements...");
      const removeExportsProcess = spawn(
        "node",
        ["scripts/remove-exports.js"],
        {
          cwd: rootDir,
          shell: true,
        }
      );

      removeExportsProcess.on("close", async (removeCode) => {
        if (removeCode === 0) {
          spinner.succeed("Export statements removed successfully!");
        } else {
          spinner.warn("Failed to remove export statements");
        }

        const choices = ["压缩文件", "退出"];
        const answer = await inquirer.prompt([
          {
            type: "list",
            name: "action",
            message: "请选择操作:",
            choices: choices,
          },
        ]);

        if (answer.action === "压缩文件") {
          spinner.start("Creating ZIP file...");
          createZip(rootDir, spinner);
        }
      });
      return;
    } else {
      spinner.fail(`Build failed with code ${code}`);
    }
  });
}

async function start() {
  const distExist = fs.existsSync(join(rootDir, distName));

  if (distExist) {
    const choices = ["重新打包", "压缩文件", "退出"];
    const answer = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "检测到extensions目录已存在，请选择操作:",
        choices: choices,
      },
    ]);
    switch (answer.action) {
      case "压缩文件":
        createZip(rootDir, spinner);
        break;
      case "重新打包":
        build();
        break;

      default:
        break;
    }
  } else {
    build();
  }
}

start();
