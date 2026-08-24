# Blackjack Mobile

Expo / React Native ile gelistirilen mobil blackjack ve para yonetimi oyunu.

## Calistirma

```bash
npm install
npm start
```

Telefonda Expo Go ile QR kodu okutabilir veya Android emulator varsa:

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

## Reklam Modu

- Preview ve lokal buildlerde odullu reklamlar Google test reklam ID'siyle calisir.
- `EAS_BUILD_PROFILE=production` oldugunda uygulama gercek AdMob odullu reklam ID'lerine gecer.
- Gerekirse `BLACKJACK_USE_TEST_ADS=false` veya `BLACKJACK_USE_TEST_ADS=true` ile manuel override yapilabilir.
