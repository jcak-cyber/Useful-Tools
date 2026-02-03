import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { program } from "commander";
import https from "https";
import semver from "semver";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());

const repositoryInfo = {
  owner: packageJson.repository.owner,
  repo: packageJson.repository.repo,
};

/**
 * @typedef {Object} IterationVersionOptions
 * @property {string} [major] 主版本号
 * @property {string} [minor] 次版本号
 */

/**
 * 迭代版本号
 * 指定主版本号和次版本号，自动迭代修订版本号
 */

program
  .version("1.0.0")
  .description("迭代版本号")
  .option("-m, --major <major>", "主版本号")
  .option("-n, --minor <minor>", "次版本号")
  .action(() => {
    iterationVersion(program.opts());
  })
  .parse(process.argv);

/**
 * @param {IterationVersionOptions} options
 */
async function iterationVersion(options) {
  let { major = "1", minor = "0" } = options;

  major = parseInt(major.trim()).toString();
  minor = parseInt(minor.trim()).toString();

  const remoteVersions = await getRemoteVersions();

  const remoteMaxVersion = semver.maxSatisfying(remoteVersions, `*`) || "1.0.0";

  console.log("remoteMaxVersion:", remoteMaxVersion);

  if (semver.lt(`${major}.${Number(minor) + 1}.0`, remoteMaxVersion)) {
    throw new Error(
      `主版本号 ${major} 和次版本号 ${minor} 落后于远程最高版本号 ${remoteMaxVersion}`
    );
  }

  const newVersion = semver.inc(
    semver.maxSatisfying([remoteMaxVersion, `${major}.${minor}.0`], `*`) ||
      "1.0.0",
    "patch"
  );

  console.log(`版本号迭代为: ${newVersion}`);

  packageJson.version = newVersion;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n"
  );
}

async function getRemoteVersions() {
  /** @type {{name: string}[] | {status: string}} */
  const tagList = await new Promise((resolve, reject) => {
    https.get(
      `https://api.github.com/repos/${repositoryInfo.owner}/${repositoryInfo.repo}/tags`,
      {
        headers: {
          "User-Agent": "nodejs",
        },
      },
      (res) => {
        /** @type {Buffer[]} */
        let data = [];
        res.on("data", (chunk) => {
          data.push(chunk);
        });
        res.on("end", () => {
          resolve(JSON.parse(Buffer.concat(data).toString()));
        });
        res.on("error", (err) => {
          reject(err);
        });
      }
    );
  });

  if ("status" in tagList) {
    return [];
  }

  return tagList
    .map((tag) => tag.name)
    .filter((v) => /^v/i.test(v))
    .map((v) => v.replace(/^v/, ""))
    .filter((v) => !!semver.valid(v));
}
