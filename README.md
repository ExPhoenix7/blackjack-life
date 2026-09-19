# Blackjack Life

Blackjack Life is a mobile blackjack game built with Expo and React Native. Players use virtual
credit to play blackjack, unlock achievements, collect lifestyle items, buy properties, and upgrade
an idle Money Machine.

Blackjack Life does not offer real-money gambling, cash prizes, cash-out, cryptocurrency rewards,
or anything with real-world monetary value.

## Features

- Classic single-player blackjack with hit and stand controls
- Virtual-credit betting and progression
- Up to three local player profiles with no registration or sign-in
- Properties, vehicles, and collectible lifestyle items
- Rental income and Money Machine upgrades
- Achievements and profile statistics
- Optional rewarded ads for virtual credit
- Offline local progress storage

## Development

Requirements:

- Node.js 20.19 or newer
- npm
- An Android or iOS development environment, or Expo Go for JavaScript-only previewing

Install dependencies and start Expo:

```bash
npm install
npm run start:8082
```

Open the Android development target:

```bash
npm run android
```

Expo Go does not include the native Google Mobile Ads module. Rewarded ads are simulated in Expo Go
and must be tested in a preview or production build.

## Validation

Run these checks before completing a change:

```bash
npm run format:check
npm run doctor
npm run security:check
npm run economy:sim
npm audit
```

Validate the JavaScript and asset bundles without producing a native binary:

```bash
npx expo export --platform android
npx expo export --platform ios
```

## Advertising And Privacy

- Preview and local native builds use Google's rewarded-ad test unit.
- Production builds use the configured AdMob rewarded-ad unit.
- The app checks Google UMP consent status before initializing or requesting ads.
- A Privacy Choices entry is shown when UMP requires an in-app privacy-options entry point.
- Rewarded ads are optional and grant virtual credit only.
- Game progress and local profile names remain on the device.
- The app has no developer-operated backend, cloud account, or sign-in system.

Privacy policy:
[https://exphoenix7.github.io/blackjack-life/release/privacy-policy.html](https://exphoenix7.github.io/blackjack-life/release/privacy-policy.html)

## Release

Release material is maintained in [`docs/release`](docs/release):

- [`release-checklist.md`](docs/release/release-checklist.md)
- [`play-store-listing.md`](docs/release/play-store-listing.md)
- [`privacy-policy.md`](docs/release/privacy-policy.md)

Production Android builds are Android App Bundles created with the EAS `production` profile. Review
the final merged manifest, Play Console pre-launch report, Data safety form, and advertising consent
configuration before rollout.

## Technology

- Expo SDK 57
- React Native 0.86
- React 19.2
- Google Mobile Ads and UMP through `react-native-google-mobile-ads`
- AsyncStorage for local progress

## Developer

Blackjack Life is published by Couzeens.

Privacy and support contact: `couzeensdev@gmail.com`
