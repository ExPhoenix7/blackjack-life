# Blackjack Life

Expo ve React Native ile gelistirilen, cevrimdisi ilerleme destekli mobil blackjack oyunudur.

## Gelistirme

```bash
npm install
npm run start:8082
```

Expo Go ile QR kodunu okutabilir veya Android emulatore baglanabilirsiniz:

```bash
npm run android
```

## Oyun

- Blackjack masasında bahis secip tur oynanir.
- Store ekraninda real estate, cars ve items satin alinabilir.
- Money Machine aktif tiklama, pasif gelir ve offline birikimle para uretir.
- Real estate saatlik rental income biriktirir.
- Accounts sistemi en fazla 3 hesap destekler.
- Achievements ve Profile ekranlari oyuncu ilerlemesini takip eder.

## Dogrulama

Bir degisikligi tamamlamadan once asagidaki kontrolleri calistirin:

```bash
npm run format:check
npm run doctor
npm run security:check
npm run economy:sim
npm audit
```

Native APK/AAB olusturmadan JavaScript ve asset paketini dogrulamak icin:

```bash
npx expo export --platform android
npx expo export --platform ios
```

## Reklam Modu

- Preview ve lokal buildlerde odullu reklamlar Google test reklam ID'siyle calisir.
- `EAS_BUILD_PROFILE=production` oldugunda uygulama gercek AdMob odullu reklam ID'lerine gecer.
- Gerekirse `BLACKJACK_USE_TEST_ADS=false` veya `BLACKJACK_USE_TEST_ADS=true` ile manuel override yapilabilir.

## Yayin

Play Store metinleri, gizlilik politikasi ve yayin kontrol listesi `docs/release` klasorundedir.
Oyuncu ilerlemesi cihazda saklanir; uygulamanin kendi sunucusu veya bulut hesabi yoktur.
