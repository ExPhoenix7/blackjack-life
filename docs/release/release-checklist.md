# Release Checklist

## Current Stable Test Build

- Last known good APK build page: https://expo.dev/accounts/emrechavo/projects/blackjack-life/builds/a87efd5a-958d-400c-9384-6c2b83176316
- Last known good APK commit before release-mode guard: `d1c56db`
- Current release guard commit: `0cc5d73`

## Code And Config

- `npm run doctor` passes.
- `npm run format:check` passes.
- Android export passes.
- iOS export passes.
- `EAS_BUILD_PROFILE=production` resolves `extra.adMob.useTestAds` to `false`.
- Preview/local config resolves `extra.adMob.useTestAds` to `true`.
- `android.permissions` remains minimal in `app.json`.
- No camera, contacts, location, microphone, photo, or file permissions are intentionally requested.

## Advertising

- Preview APK uses Google test rewarded ads.
- Production profile uses real AdMob rewarded ad unit IDs.
- Confirm AdMob account approval before production release.
- Confirm real rewarded ads fill on at least one physical Android device.
- Keep `BLACKJACK_USE_TEST_ADS=true` available only for controlled testing.

## Privacy And Play Console

- Publish privacy policy at a public URL.
- Add privacy policy URL to Play Console.
- Add in-app privacy policy access/text before public Play release.
- Complete Google Play Data safety form.
- Mark "Contains ads" as yes.
- Declare no real-money gambling.
- Complete content rating questionnaire.
- Confirm target audience and child-directed status.

## Store Assets

- Capture phone screenshots from the latest APK.
- Create Play Store feature graphic.
- Confirm launcher icon and adaptive icon look correct on device.
- Confirm splash launch sequence looks clean.

## Final Device Test

- Fresh install, no previous app data.
- Launch from home screen.
- Verify splash transition.
- Verify header safe-area on at least two Android phones.
- Play a full blackjack round.
- Test account create/switch/rename.
- Test Money Machine collect/upgrade.
- Test Store purchase.
- Test achievements/profile.
- Test rewarded ad preload and reward credit.
- Force close and reopen to verify local save restore.

## Known Risk Accepted For Now

`npm audit` reports Expo/Metro `image-size` advisories that require a breaking Expo major upgrade to fully resolve. Do not run `npm audit fix --force` on the release branch without a separate Expo migration test pass.
