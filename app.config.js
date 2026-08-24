const { expo } = require("./app.json");

function readBooleanEnv(value) {
  if (value === undefined) {
    return null;
  }

  return !["0", "false", "no", "off"].includes(String(value).trim().toLowerCase());
}

function shouldUseTestAds() {
  const override = readBooleanEnv(process.env.BLACKJACK_USE_TEST_ADS);
  if (override !== null) {
    return override;
  }

  return process.env.EAS_BUILD_PROFILE !== "production";
}

module.exports = ({ config }) => ({
  ...config,
  ...expo,
  extra: {
    ...expo.extra,
    adMob: {
      ...expo.extra.adMob,
      useTestAds: shouldUseTestAds(),
    },
  },
});
