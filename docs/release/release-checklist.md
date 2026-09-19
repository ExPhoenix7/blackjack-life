# Release Checklist

## Current Preview Candidate

- EAS build page: https://expo.dev/accounts/emrechavo/projects/blackjack-life/builds/02cdb63e-20c1-4fe3-a094-e3a66d90277d
- Status: finished successfully on September 19, 2026 from Git commit `ab93f63`.
- Platform: Android APK, Expo SDK 57, app version `1.0.0`, version code `2`.
- Local verification copy: `artifacts/blackjack-life-preview-sdk57-release.apk` (excluded from Git).
- SHA-256: `6A408E7E39254ADB74500DA9EA7EE1B0615316F13F47C91F67A8C4C38536C07C`.

## Historical Test Build Reference

- Last known good APK build page: https://expo.dev/accounts/emrechavo/projects/blackjack-life/builds/a87efd5a-958d-400c-9384-6c2b83176316
- Last known good APK commit before release-mode guard: `d1c56db`
- These are historical references only. Use the current preview candidate above for testing.

## Code And Config

- `npm run doctor` passes.
- `npm run format:check` passes.
- `npm run security:check` passes all 22 checks.
- `npm run economy:sim` passes.
- Android export passes.
- iOS export passes.
- `EAS_BUILD_PROFILE=production` resolves `extra.adMob.useTestAds` to `false`.
- Preview/local config resolves `extra.adMob.useTestAds` to `true`.
- `android.permissions` remains minimal in `app.json`.
- Unused camera, location, contacts, storage, recording, system alert window, and foreground-service
  permissions remain blocked.
- Background audio playback and recording remain explicitly disabled.
- Developer credit tools remain available only in Expo Go development mode.
- No camera, contacts, location, microphone, photo, or file permissions are intentionally requested.
- The preview APK manifest has been inspected and contains no camera, location, contacts, storage,
  microphone, system alert window, or foreground-service permission.
- Inspect the final production AAB merged manifest and confirm the same minimal permission set.
- Confirm any `AD_ID` permission in the final AAB matches the advertising and Data safety declarations.

## Advertising

Account-side setup verified on September 19, 2026:

- The Couzeens AdMob account is approved and its payment profile is complete.
- The public privacy policy URL is assigned to both Android and iOS app entries.
- `Blackjack Life EU Consent` is published in English for both app entries with consent, refusal,
  and preference-management choices.
- Social Casino Games and Gambling & Betting (18+) are blocked at account level.
- The maximum ad content rating is set to `T`, which blocks `MA` ads.

- Preview APK uses Google test rewarded ads.
- Production profile uses real AdMob rewarded ad unit IDs.
- Confirm real rewarded ads fill on at least one physical Android device.
- Keep `BLACKJACK_USE_TEST_ADS=true` available only for controlled testing.
- Test UMP with EEA debug geography in a native preview build.
- Confirm ads are not requested until UMP reports `canRequestAds`.
- Confirm Profile > Privacy Choices appears whenever UMP requires an entry point.

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
