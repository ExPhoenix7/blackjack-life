# Release Checklist

## Current Preview Candidate

- EAS build page: https://expo.dev/accounts/emrechavo/projects/blackjack-life/builds/43ddb083-08d5-4f31-8619-b0cd641d5b07
- Status: finished successfully on September 18, 2026.
- Platform: Android APK, Expo SDK 57, app version `1.0.0`, version code `2`.
- Local verification copy: `artifacts/blackjack-life-preview-sdk57-admob.apk` (excluded from Git).
- SHA-256: `474A9CCD2D7F3C288A32F29D81A1AEAC27191A231602BD185E3B286185B74AB7`.

## Historical Test Build Reference

- Last known good APK build page: https://expo.dev/accounts/emrechavo/projects/blackjack-life/builds/a87efd5a-958d-400c-9384-6c2b83176316
- Last known good APK commit before release-mode guard: `d1c56db`
- Current release guard commit: `0cc5d73`
- These are historical references only. Build the next candidate from the current reviewed Git HEAD.

## Code And Config

- `npm run doctor` passes.
- `npm run format:check` passes.
- `npm run security:check` passes.
- `npm run economy:sim` passes.
- Android export passes.
- iOS export passes.
- `EAS_BUILD_PROFILE=production` resolves `extra.adMob.useTestAds` to `false`.
- Preview/local config resolves `extra.adMob.useTestAds` to `true`.
- `android.permissions` remains minimal in `app.json`.
- Unused camera, location, contacts, storage, recording, and system alert window permissions remain blocked.
- Developer credit tools remain available only in Expo Go development mode.
- No camera, contacts, location, microphone, photo, or file permissions are intentionally requested.
- Inspect the final production AAB merged manifest and confirm `SYSTEM_ALERT_WINDOW` is absent.
- Confirm any `AD_ID` permission in the final AAB matches the advertising and Data safety declarations.

## Advertising

- Preview APK uses Google test rewarded ads.
- Production profile uses real AdMob rewarded ad unit IDs.
- Confirm AdMob account approval before production release.
- Confirm real rewarded ads fill on at least one physical Android device.
- Keep `BLACKJACK_USE_TEST_ADS=true` available only for controlled testing.
- Create and publish the appropriate messages in AdMob > Privacy & messaging.
- Test UMP with EEA debug geography in a native preview build.
- Confirm ads are not requested until UMP reports `canRequestAds`.
- Confirm Profile > Privacy Choices appears whenever UMP requires an entry point.
- In AdMob blocking controls, block Gambling & Betting (18+) and Social Casino Games.
- Keep the maximum ad content rating at `T` or stricter.

## Privacy And Play Console

- Developer name: Couzeens.
- Privacy contact: `couzeensdev@gmail.com`.
- Publish privacy policy at a public URL: `https://exphoenix7.github.io/blackjack-life/release/privacy-policy.html`.
- Add privacy policy URL to Play Console.
- Confirm the in-app Profile > Privacy Policy link opens the published policy.
- Complete Google Play Data safety form.
- Mark "Contains ads" as yes.
- Declare no real-money gambling.
- Declare simulated gambling accurately in the content-rating questionnaire.
- Complete content rating questionnaire.
- Set the recommended target audience to 18 and over and enable Restrict Minor Access.
- Do not enroll the app in Designed for Families.
- App access: no login, registration, membership, or special reviewer credentials are required.
- Describe the in-game profile system as local player profiles, not user accounts.
- Exclude South Korea unless the required GRAC process has been completed.
- Keep the default Play Store language and all public listing text in English.
- Verify the GitHub README, About description, release notes, and support text are English.

## Store Assets

- Phone screenshots captured from latest APK:
  - `docs/release/store-assets/phone-screenshots/01-blackjack-bet.jpg`
  - `docs/release/store-assets/phone-screenshots/02-blackjack-win.jpg`
  - `docs/release/store-assets/phone-screenshots/03-store-real-estate.jpg`
  - `docs/release/store-assets/phone-screenshots/04-money-machine.jpg`
- Play Store feature graphic created:
  - `docs/release/store-assets/feature-graphic-1024x500-v2.png`
  - `docs/release/store-assets/feature-graphic-1024x500-v2.jpg`
- Optional: capture Profile/Achievements and Profiles menu screenshots.
- Confirm launcher icon and adaptive icon look correct on device.
- Confirm splash launch sequence looks clean.

## Final Device Test

- Fresh install, no previous app data.
- Launch from home screen.
- Verify splash transition.
- Verify header safe-area on at least two Android phones.
- Play a full blackjack round.
- Test local profile create/switch/rename.
- Test Money Machine collect/upgrade.
- Test Store purchase.
- Test achievements/profile.
- Test rewarded ad preload and reward credit.
- Force close and reopen to verify local save restore.
- Run the Play Console pre-launch report and review every crash, ANR, permission, and accessibility warning.
- For qualifying new personal developer accounts, keep at least 12 testers continuously opted in to
  closed testing for at least 14 days before applying for production access.
- After launch, monitor user-perceived crash rate, ANR rate, SDK notices, and device-specific clusters
  in Android vitals.

## Dependency Audit

As of September 18, 2026, the project uses Expo SDK 57 and `npm audit` reports zero known
vulnerabilities. Run `npm audit`, `npm run doctor`, and a native preview build again immediately
before the production release.
