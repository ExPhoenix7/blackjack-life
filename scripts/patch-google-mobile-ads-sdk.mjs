import fs from "fs";

const packagePath = "node_modules/react-native-google-mobile-ads/package.json";
const googleMobileAdsAndroidVersion = "24.5.0";

if (!fs.existsSync(packagePath)) {
  process.exit(0);
}

const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

if (packageJson.sdkVersions?.android?.googleMobileAds) {
  packageJson.sdkVersions.android.googleMobileAds = googleMobileAdsAndroidVersion;
  fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.log(`Pinned react-native-google-mobile-ads Android SDK to ${googleMobileAdsAndroidVersion}`);
}
