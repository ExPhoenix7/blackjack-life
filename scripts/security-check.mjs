import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const require = createRequire(import.meta.url);
const createExpoConfig = require(path.join(projectRoot, "app.config.js"));
const appJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "app.json"), "utf8"));
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
const runtimeFiles = [
  "App.js",
  "app.config.js",
  "app.json",
  ...fs
    .readdirSync(path.join(projectRoot, "src", "components"))
    .filter((name) => name.endsWith(".js"))
    .map((name) => path.join("src", "components", name)),
  path.join("src", "core", "game.js"),
];
const failures = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) {
    failures.push(message);
  }
}

function resolvedConfig(profile) {
  const previousProfile = process.env.EAS_BUILD_PROFILE;
  const previousOverride = process.env.BLACKJACK_USE_TEST_ADS;
  process.env.EAS_BUILD_PROFILE = profile;
  delete process.env.BLACKJACK_USE_TEST_ADS;

  try {
    return createExpoConfig({ config: {} });
  } finally {
    if (previousProfile === undefined) {
      delete process.env.EAS_BUILD_PROFILE;
    } else {
      process.env.EAS_BUILD_PROFILE = previousProfile;
    }

    if (previousOverride === undefined) {
      delete process.env.BLACKJACK_USE_TEST_ADS;
    } else {
      process.env.BLACKJACK_USE_TEST_ADS = previousOverride;
    }
  }
}

const productionConfig = resolvedConfig("production");
const previewConfig = resolvedConfig("preview");
const runtimeSource = runtimeFiles
  .map((relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8"))
  .join("\n");
const blockedPermissions = new Set(appJson.expo.android?.blockedPermissions || []);
const requiredBlockedPermissions = [
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.CAMERA",
  "android.permission.READ_CONTACTS",
  "android.permission.RECORD_AUDIO",
];

check(packageJson.private === true, "package.json must remain private to prevent accidental npm publishing.");
check(productionConfig.extra?.adMob?.useTestAds === false, "Production config must disable Google test ads.");
check(previewConfig.extra?.adMob?.useTestAds === true, "Preview config must keep Google test ads enabled.");
check(
  Array.isArray(appJson.expo.android?.permissions) && appJson.expo.android.permissions.length === 0,
  "Android permissions must stay explicitly minimal."
);
for (const permission of requiredBlockedPermissions) {
  check(blockedPermissions.has(permission), `${permission} must stay blocked.`);
}
check(
  runtimeSource.includes("const developerToolsEnabled = __DEV__ && isExpoGo;"),
  "Developer credit tools must remain gated to Expo Go development."
);
check(
  runtimeSource.includes('const privacyPolicyUrl = "https://'),
  "The in-app privacy policy must use HTTPS."
);
check(!/http:\/\//i.test(runtimeSource), "Runtime code must not contain cleartext HTTP URLs.");
check(
  !/\beval\s*\(|new\s+Function\s*\(/.test(runtimeSource),
  "Runtime code must not use dynamic evaluation."
);
check(
  !/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bghp_[A-Za-z0-9]{30,}|\bsk-[A-Za-z0-9_-]{20,}/.test(
    runtimeSource
  ),
  "Runtime files must not contain private keys or service tokens."
);

if (failures.length > 0) {
  console.error(`Security checks failed (${failures.length}/${checks}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Security checks passed (${checks}/${checks}).`);
}
