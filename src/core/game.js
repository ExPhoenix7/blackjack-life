import Constants from "expo-constants";
import { Platform, StatusBar } from "react-native";

const suits = ["S", "H", "D", "C"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const betOptions = [100, 200, 500, 1000, 5000];
const startingChips = 1000;
const firstAccountChips = startingChips;
// Keep this key stable. Changing it intentionally resets every saved account/progress.
const accountsStorageKey = "blackjack-accounts-v6";
const settingsStorageKey = "blackjack-settings-v1";
const accountCost = 3000;
const accountLimit = 3;
const developerCheatChips = [100, 200, 500];
const developerCheatReward = 50000;
const rewardedAdCredit = 10000;
const rewardedAdMidCredit = 30000;
const rewardedAdHighCredit = 50000;
const rewardedAdMidWealth = 200000;
const rewardedAdHighWealth = 400000;
const isExpoGo = Constants.appOwnership === "expo";
let googleMobileAdsModule = null;
const mainTabs = ["store", "blackjack", "money"];
const mainTabIndex = { store: 0, blackjack: 1, money: 2 };

function getGoogleMobileAdsModule() {
  if (googleMobileAdsModule !== null) {
    return googleMobileAdsModule;
  }

  try {
    googleMobileAdsModule = {
      AdEventType: require("react-native-google-mobile-ads/lib/commonjs/AdEventType").AdEventType,
      RewardedAd: require("react-native-google-mobile-ads/lib/commonjs/ads/RewardedAd").RewardedAd,
      RewardedAdEventType: require("react-native-google-mobile-ads/lib/commonjs/RewardedAdEventType")
        .RewardedAdEventType,
      TestIds: require("react-native-google-mobile-ads/lib/commonjs/TestIds").TestIds,
      mobileAds: require("react-native-google-mobile-ads/lib/commonjs/MobileAds").default,
    };
  } catch (error) {
    googleMobileAdsModule = false;
  }

  return googleMobileAdsModule || null;
}
const realEstateListings = [
  { name: "Studio Apartment", price: 5000, rentPerHour: 200 },
  { name: "Bungalow", price: 10000, rentPerHour: 400 },
  { name: "Luxury Apartment", price: 20000, rentPerHour: 750 },
  { name: "Duplex", price: 35000, rentPerHour: 1200 },
  { name: "Penthouse", price: 55000, rentPerHour: 1900 },
  { name: "Farmhouse", price: 80000, rentPerHour: 2700 },
  { name: "Beach House", price: 110000, rentPerHour: 3700 },
  { name: "Luxury Villa", price: 150000, rentPerHour: 4800 },
  { name: "Mansion", price: 200000, rentPerHour: 6300 },
  { name: "Hotel", price: 250000, rentPerHour: 8000 },
];
const vehicleListings = [
  { name: "Bicycle", price: 500, bonus: { tap: 10 } },
  { name: "Motorcycle", price: 3000, bonus: { capacity: 500 } },
  { name: "Hatchback", price: 10000, bonus: { rentalPercent: 2 } },
  { name: "Sedan", price: 20000, bonus: { passive: 10 } },
  { name: "SUV", price: 30000, bonus: { capacity: 1500 } },
  { name: "Sports Car", price: 50000, bonus: { tap: 30 } },
  { name: "Limousine", price: 75000, bonus: { rentalPercent: 4 } },
  { name: "Supercar", price: 110000, bonus: { tap: 50 } },
  { name: "Yacht", price: 150000, bonus: { rentalPercent: 8 } },
  { name: "Private Jet", price: 200000, bonus: { passive: 30 } },
];
const itemListings = [
  { name: "Headphones", price: 500, bonus: { passive: 10 } },
  { name: "Smartphone", price: 1500, bonus: { tap: 10 } },
  { name: "Gaming Console", price: 2500, bonus: { passive: 13 } },
  { name: "Tablet", price: 3000, bonus: { rentalPercent: 3 } },
  { name: "Watch", price: 6000, bonus: { tap: 20 } },
  { name: "Laptop", price: 8000, bonus: { capacity: 2000 } },
  { name: "Necklace", price: 8000, bonus: { rentalPercent: 4 } },
  { name: "Ring", price: 10000, bonus: { rentalPercent: 5 } },
  { name: "Pool Table", price: 8000, bonus: { capacity: 1500 } },
  { name: "Home Theater", price: 6000, bonus: { passive: 17 } },
];
function getLayoutWidth(windowWidth) {
  const availableWidth = Math.max(320, windowWidth - 24);

  if (windowWidth >= 700) {
    return Math.min(availableWidth, 700);
  }

  if (windowWidth >= 520) {
    return Math.min(availableWidth, 520);
  }

  return Math.min(availableWidth, 390);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function scalePx(value, scale) {
  return Math.round(value * scale);
}

function getResponsiveMetrics(windowWidth, windowHeight) {
  const shortSide = Math.min(windowWidth, windowHeight);
  const longSide = Math.max(windowWidth, windowHeight);
  const isTablet = shortSide >= 650;
  const phoneScale = clamp(shortSide / 390, 0.86, 1.08);
  const phoneHeightScale = clamp(longSide / 844, 0.82, 1.08);
  const tabletScale = clamp(shortSide / 768, 1, 1.08);
  const tabletMoneyScale = clamp(Math.min(shortSide / 768, longSide / 1024), 0.92, 1.08);

  return {
    chipScale: isTablet ? tabletScale : phoneScale,
    isTablet,
    moneyMachineScale: isTablet
      ? tabletMoneyScale
      : clamp(Math.min(phoneScale, phoneHeightScale), 0.82, 1.06),
  };
}

function getResponsiveLayout(windowWidth, windowHeight, layoutWidth, safeFrameInsets) {
  const shortSide = Math.min(windowWidth, windowHeight);
  const longSide = Math.max(windowWidth, windowHeight);
  const isTablet = shortSide >= 650;
  const usableHeight = Math.max(1, windowHeight - safeFrameInsets.top - safeFrameInsets.bottom - 20);
  const referenceWidth = isTablet ? 640 : 369;
  const referenceHeight = isTablet ? 900 : 768;
  const minScale = isTablet ? 0.86 : 0.78;
  const maxScale = isTablet ? 1.12 : 1;
  const uiScale = clamp(
    Math.min(layoutWidth / referenceWidth, usableHeight / referenceHeight),
    minScale,
    maxScale
  );
  const phoneScale = clamp(shortSide / 390, 0.86, 1.08);
  const tabletScale = clamp(shortSide / 768, 1, 1.08);
  const controlScale = Math.min(isTablet ? tabletScale : phoneScale, uiScale);
  const isAndroidPhone = Platform.OS === "android" && !isTablet;
  const moneyMachineScale = isAndroidPhone ? Math.min(controlScale, uiScale * 0.96) : controlScale;

  return {
    blackjackClipHeight: scalePx(isTablet ? 426 : 378, uiScale),
    blackjackClipTop: scalePx(isTablet ? -100 : -92, uiScale),
    blackjackOverlayTop: scalePx(isTablet ? 24 : 34, uiScale),
    centerControlsMinHeight: scalePx(isTablet ? 176 : 190, uiScale),
    centerControlsTranslateY: scalePx(isTablet ? -82 : 0, uiScale),
    chipScale: controlScale,
    handClipMinHeight: scalePx(isTablet ? 168 : 198, uiScale),
    headerMinHeight: scalePx(isTablet ? 86 : 104, uiScale),
    moneyMachineScale,
    moneyOverlayClipHeight: scalePx(isTablet ? 612 : 507, uiScale),
    moneyOverlayClipTop: scalePx(isTablet ? -282 : -221, uiScale),
    moneyOverlayHeight: scalePx(isTablet ? 548 : 484, uiScale),
    moneyOverlayTop: scalePx(23, uiScale),
    storeOverlayClipHeight: scalePx(isTablet ? 610 : 532, uiScale),
    storeOverlayClipTop: scalePx(isTablet ? -278 : -246, uiScale),
    storeOverlayHeight: scalePx(isTablet ? 584 : 509, uiScale),
    storeOverlayTop: scalePx(3, uiScale),
    tabAreaHeight: scalePx(isTablet ? 326 : 286, uiScale),
    tablePaddingBottom: scalePx(10, uiScale),
    uiScale,
  };
}

function getBetChipButtonTransform(index, isTablet, scale) {
  const yOffsets = isTablet ? [22, 1, -9, 1, 22] : [18, 1, -7, 1, 18];
  const rotations = ["-12deg", "-6deg", null, "6deg", "12deg"];
  const transform = [{ translateY: scalePx(yOffsets[index] || 0, scale) }];

  if (rotations[index]) {
    transform.push({ rotate: rotations[index] });
  }

  return transform;
}

function getSafeFrameInsets(windowWidth, windowHeight) {
  const shortSide = Math.min(windowWidth, windowHeight);
  const longSide = Math.max(windowWidth, windowHeight);

  if (Platform.OS === "android") {
    const hasModernSafeArea = longSide / shortSide > 1.9;
    const statusBarHeight = StatusBar.currentHeight || (hasModernSafeArea ? 28 : 18);
    return {
      bottom: isExpoGo ? 38 : hasModernSafeArea ? 20 : 10,
      horizontal: 0,
      top: statusBarHeight + 8,
    };
  }

  if (Platform.OS !== "ios") {
    return { bottom: 0, horizontal: 0, top: 0 };
  }

  const hasModernSafeArea = longSide / shortSide > 1.9;

  return {
    bottom: hasModernSafeArea ? 26 : 10,
    horizontal: 8,
    top: hasModernSafeArea ? 38 : 20,
  };
}

const moneyMachineBaseCapacity = 1000;
const moneyMachineCapacityStep = 1000;
const moneyMachineBaseTapEarn = 10;
const moneyMachineTapEarnStep = 2;
const moneyMachineMaxTapEarn = 100;
const moneyMachineTapUpgradeBaseCost = 1000;
const moneyMachineCapacityUpgradeBaseCost = 2000;
const moneyMachineTapUpgradeCostStep = 200;
const moneyMachineCapacityUpgradeCostStep = 100;
const moneyMachineMaxTapLevel = 46;
const moneyMachineMaxCapacityLevel = 50;
const moneyMachineTickMs = 60000;
const moneyMachineEarnPerTick = 100;
const rentalIncomeCapacity = 50000;
const rentalIncomeTickMs = 3600000;
const defaultAchievementStats = {
  roundsPlayed: 0,
  handsWon: 0,
  blackjackWins: 0,
  currentWinStreak: 0,
  bestWinStreak: 0,
  totalBet: 0,
  biggestWin: 0,
  storePurchases: 0,
  moneyMachineCollected: 0,
  rentalCollected: 0,
  highestWealth: 0,
};
const achievementDefinitions = [
  {
    id: "first_round",
    title: "First Hand",
    description: "Play your first blackjack hand.",
    goal: 1,
    reward: 250,
    stat: "roundsPlayed",
  },
  {
    id: "first_win",
    title: "First Win",
    description: "Win a blackjack hand.",
    goal: 1,
    reward: 500,
    stat: "handsWon",
  },
  {
    id: "blackjack",
    title: "Natural 21",
    description: "Hit blackjack from the first two cards.",
    goal: 1,
    reward: 1500,
    stat: "blackjackWins",
  },
  {
    id: "five_wins",
    title: "Hot Table",
    description: "Win 5 blackjack hands.",
    goal: 5,
    reward: 2500,
    stat: "handsWon",
  },
  {
    id: "five_win_streak",
    title: "On Fire",
    description: "Win 5 hands in a row.",
    goal: 5,
    reward: 5000,
    stat: "bestWinStreak",
  },
  {
    id: "high_roller",
    title: "High Roller",
    description: "Place $25,000 total bets.",
    goal: 25000,
    reward: 3000,
    stat: "totalBet",
    money: true,
  },
  {
    id: "big_win",
    title: "Big Swing",
    description: "Win $5,000 from one hand.",
    goal: 5000,
    reward: 4000,
    stat: "biggestWin",
    money: true,
  },
  {
    id: "collector",
    title: "Collector",
    description: "Buy 5 store items, cars, or properties.",
    goal: 5,
    reward: 2500,
    stat: "storePurchases",
  },
  {
    id: "machine_cash",
    title: "Machine Cash",
    description: "Collect $10,000 from the money machine.",
    goal: 10000,
    reward: 3500,
    stat: "moneyMachineCollected",
    money: true,
  },
  {
    id: "max_tap_power",
    title: "Max Tap Power",
    description: "Upgrade tap power to max level.",
    goal: moneyMachineMaxTapLevel,
    reward: 20000,
    stat: "moneyMachineTapLevel",
  },
  {
    id: "max_storage",
    title: "Max Storage",
    description: "Upgrade money machine storage to max level.",
    goal: moneyMachineMaxCapacityLevel,
    reward: 20000,
    stat: "moneyMachineCapacityLevel",
  },
  {
    id: "landlord",
    title: "Landlord",
    description: "Collect $25,000 rental income.",
    goal: 25000,
    reward: 6000,
    stat: "rentalCollected",
    money: true,
  },
  {
    id: "all_real_estate",
    title: "Property Empire",
    description: "Buy every real estate property.",
    goal: realEstateListings.length,
    reward: 50000,
    stat: "ownedRealEstateCount",
  },
  {
    id: "all_cars",
    title: "Full Garage",
    description: "Buy every car and vehicle.",
    goal: vehicleListings.length,
    reward: 40000,
    stat: "ownedVehiclesCount",
  },
  {
    id: "all_items",
    title: "Luxury Shelf",
    description: "Buy every item.",
    goal: itemListings.length,
    reward: 25000,
    stat: "ownedItemsCount",
  },
  {
    id: "whole_store",
    title: "Own The Store",
    description: "Buy everything in the store.",
    goal: realEstateListings.length + vehicleListings.length + itemListings.length,
    reward: 100000,
    stat: "totalStoreOwned",
  },
];
const chipColors = {
  100: "#0f9f5a",
  200: "#2563eb",
  500: "#d62828",
  1000: "#f4c430",
  5000: "#8b3fc6",
};

const CARD_BACK = require("../../assets/cards/BACK.png");
const TABLE_FELT = require("../../assets/table-felt.png");
const APP_SPLASH = require("../../assets/splash.png");
const SOUND_ON_ICON = require("../../assets/sound-on.png");
const SOUND_OFF_ICON = require("../../assets/sound-off.png");
const TAB_BLACKJACK_ICON = require("../../assets/tab-blackjack.png");
const TAB_STORE_ICON = require("../../assets/tab-store.png");
const TAB_MONEY_ICON = require("../../assets/tab-money.png");
const CARD_DEAL_SOUND = require("../../assets/sounds/card-deal.mp3");
const CHIP_PLACE_SOUND = require("../../assets/sounds/chip-place.mp3");
const PROPERTY_IMAGES = {
  "Studio Apartment": require("../../assets/store/properties/studio-apartment.png"),
  Bungalow: require("../../assets/store/properties/bungalow.png"),
  "Luxury Apartment": require("../../assets/store/properties/luxury-apartment.png"),
  Duplex: require("../../assets/store/properties/duplex.png"),
  Penthouse: require("../../assets/store/properties/penthouse.png"),
  Farmhouse: require("../../assets/store/properties/farmhouse.png"),
  "Beach House": require("../../assets/store/properties/beach-house.png"),
  "Luxury Villa": require("../../assets/store/properties/luxury-villa.png"),
  Mansion: require("../../assets/store/properties/mansion.png"),
  Hotel: require("../../assets/store/properties/hotel.png"),
};
const VEHICLE_IMAGES = {
  Bicycle: require("../../assets/store/vehicles/bicycle.png"),
  Motorcycle: require("../../assets/store/vehicles/motorcycle.png"),
  Hatchback: require("../../assets/store/vehicles/hatchback.png"),
  Sedan: require("../../assets/store/vehicles/sedan.png"),
  SUV: require("../../assets/store/vehicles/suv.png"),
  "Sports Car": require("../../assets/store/vehicles/sports-car.png"),
  Limousine: require("../../assets/store/vehicles/limousine.png"),
  Supercar: require("../../assets/store/vehicles/supercar.png"),
  Yacht: require("../../assets/store/vehicles/yacht.png"),
  "Private Jet": require("../../assets/store/vehicles/private-jet.png"),
};
const ITEM_IMAGES = {
  Headphones: require("../../assets/store/items/headphones.png"),
  Smartphone: require("../../assets/store/items/smartphone.png"),
  "Gaming Console": require("../../assets/store/items/gaming-console.png"),
  Tablet: require("../../assets/store/items/tablet.png"),
  Watch: require("../../assets/store/items/watch.png"),
  Laptop: require("../../assets/store/items/laptop.png"),
  Necklace: require("../../assets/store/items/necklace.png"),
  Ring: require("../../assets/store/items/ring.png"),
  "Pool Table": require("../../assets/store/items/pool-table.png"),
  "Home Theater": require("../../assets/store/items/home-theater.png"),
};
const CARD_IMAGES = {
  AS: require("../../assets/cards/AS.png"),
  "2S": require("../../assets/cards/2S.png"),
  "3S": require("../../assets/cards/3S.png"),
  "4S": require("../../assets/cards/4S.png"),
  "5S": require("../../assets/cards/5S.png"),
  "6S": require("../../assets/cards/6S.png"),
  "7S": require("../../assets/cards/7S.png"),
  "8S": require("../../assets/cards/8S.png"),
  "9S": require("../../assets/cards/9S.png"),
  "10S": require("../../assets/cards/10S.png"),
  JS: require("../../assets/cards/JS.png"),
  QS: require("../../assets/cards/QS.png"),
  KS: require("../../assets/cards/KS.png"),
  AH: require("../../assets/cards/AH.png"),
  "2H": require("../../assets/cards/2H.png"),
  "3H": require("../../assets/cards/3H.png"),
  "4H": require("../../assets/cards/4H.png"),
  "5H": require("../../assets/cards/5H.png"),
  "6H": require("../../assets/cards/6H.png"),
  "7H": require("../../assets/cards/7H.png"),
  "8H": require("../../assets/cards/8H.png"),
  "9H": require("../../assets/cards/9H.png"),
  "10H": require("../../assets/cards/10H.png"),
  JH: require("../../assets/cards/JH.png"),
  QH: require("../../assets/cards/QH.png"),
  KH: require("../../assets/cards/KH.png"),
  AD: require("../../assets/cards/AD.png"),
  "2D": require("../../assets/cards/2D.png"),
  "3D": require("../../assets/cards/3D.png"),
  "4D": require("../../assets/cards/4D.png"),
  "5D": require("../../assets/cards/5D.png"),
  "6D": require("../../assets/cards/6D.png"),
  "7D": require("../../assets/cards/7D.png"),
  "8D": require("../../assets/cards/8D.png"),
  "9D": require("../../assets/cards/9D.png"),
  "10D": require("../../assets/cards/10D.png"),
  JD: require("../../assets/cards/JD.png"),
  QD: require("../../assets/cards/QD.png"),
  KD: require("../../assets/cards/KD.png"),
  AC: require("../../assets/cards/AC.png"),
  "2C": require("../../assets/cards/2C.png"),
  "3C": require("../../assets/cards/3C.png"),
  "4C": require("../../assets/cards/4C.png"),
  "5C": require("../../assets/cards/5C.png"),
  "6C": require("../../assets/cards/6C.png"),
  "7C": require("../../assets/cards/7C.png"),
  "8C": require("../../assets/cards/8C.png"),
  "9C": require("../../assets/cards/9C.png"),
  "10C": require("../../assets/cards/10C.png"),
  JC: require("../../assets/cards/JC.png"),
  QC: require("../../assets/cards/QC.png"),
  KC: require("../../assets/cards/KC.png"),
};
const PRELOAD_IMAGE_ASSETS = [
  APP_SPLASH,
  TABLE_FELT,
  SOUND_ON_ICON,
  SOUND_OFF_ICON,
  TAB_BLACKJACK_ICON,
  TAB_STORE_ICON,
  TAB_MONEY_ICON,
  CARD_BACK,
  ...Object.values(CARD_IMAGES),
  ...Object.values(PROPERTY_IMAGES),
  ...Object.values(VEHICLE_IMAGES),
  ...Object.values(ITEM_IMAGES),
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function replaySound(player) {
  try {
    player.seekTo(0);
    player.play();
  } catch {
    // Ignore a tap that happens before the short sound asset has loaded.
  }
}

function createDeck() {
  return suits.flatMap((suit) => ranks.map((rank) => ({ rank, suit })));
}

function shuffle(cards) {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function valueOf(card) {
  if (card.rank === "A") return 11;
  if (["J", "Q", "K"].includes(card.rank)) return 10;
  return Number(card.rank);
}

function handValue(hand) {
  let total = hand.reduce((sum, card) => sum + valueOf(card), 0);
  let aces = hand.filter((card) => card.rank === "A").length;

  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }

  return total;
}

function draw(deck) {
  return {
    card: deck[deck.length - 1],
    deck: deck.slice(0, -1),
  };
}

function suitLabel(suit) {
  return {
    S: "\u2660",
    H: "\u2665",
    D: "\u2666",
    C: "\u2663",
  }[suit];
}

function createMoneyMachine(now = Date.now()) {
  return {
    stored: 0,
    lastUpdated: now,
    tapLevel: 1,
    capacityLevel: 1,
  };
}

function normalizeMoneyMachineLevel(level, maxLevel) {
  return Number.isFinite(level) ? Math.max(1, Math.min(maxLevel, Math.floor(level))) : 1;
}

function bonusLabel(bonus) {
  if (!bonus) return "";
  if (bonus.tap) return `Tap +$${bonus.tap}`;
  if (bonus.passive) return `Machine +$${bonus.passive}/min`;
  if (bonus.capacity) return `Storage +$${bonus.capacity.toLocaleString("en-US")}`;
  if (bonus.rentalPercent) return `Rental +${bonus.rentalPercent}%`;
  return "";
}

function storeBonusesForOwned(ownedItems = [], ownedVehicles = []) {
  return [...itemListings, ...vehicleListings].reduce(
    (total, listing) => {
      const owned = itemListings.includes(listing)
        ? ownedItems.includes(listing.name)
        : ownedVehicles.includes(listing.name);

      if (!owned || !listing.bonus) {
        return total;
      }

      return {
        tap: total.tap + (listing.bonus.tap || 0),
        passive: total.passive + (listing.bonus.passive || 0),
        capacity: total.capacity + (listing.bonus.capacity || 0),
        rentalPercent: total.rentalPercent + (listing.bonus.rentalPercent || 0),
      };
    },
    { tap: 0, passive: 0, capacity: 0, rentalPercent: 0 }
  );
}

function moneyMachinePassiveEarnForBonuses(bonuses) {
  return moneyMachineEarnPerTick + (bonuses?.passive || 0);
}

function moneyMachineCapacityForLevel(level, capacityBonus = 0) {
  return (
    moneyMachineBaseCapacity +
    (normalizeMoneyMachineLevel(level, moneyMachineMaxCapacityLevel) - 1) * moneyMachineCapacityStep +
    capacityBonus
  );
}

function moneyMachineTapEarnForLevel(level, tapBonus = 0) {
  return (
    Math.min(
      moneyMachineMaxTapEarn,
      moneyMachineBaseTapEarn +
        (normalizeMoneyMachineLevel(level, moneyMachineMaxTapLevel) - 1) * moneyMachineTapEarnStep
    ) + tapBonus
  );
}

function moneyMachineUpgradeCost(type, level) {
  const maxLevel = type === "tap" ? moneyMachineMaxTapLevel : moneyMachineMaxCapacityLevel;
  const normalizedLevel = normalizeMoneyMachineLevel(level, maxLevel);
  const baseCost = type === "tap" ? moneyMachineTapUpgradeBaseCost : moneyMachineCapacityUpgradeBaseCost;
  const costStep = type === "tap" ? moneyMachineTapUpgradeCostStep : moneyMachineCapacityUpgradeCostStep;
  return baseCost + (normalizedLevel - 1) * costStep;
}

function normalizeMoneyMachine(
  machine,
  now = Date.now(),
  passiveEarn = moneyMachineEarnPerTick,
  capacityBonus = 0
) {
  const tapLevel = normalizeMoneyMachineLevel(machine?.tapLevel, moneyMachineMaxTapLevel);
  const capacityLevel = normalizeMoneyMachineLevel(machine?.capacityLevel, moneyMachineMaxCapacityLevel);
  const capacity = moneyMachineCapacityForLevel(capacityLevel, capacityBonus);
  const currentStored = Number.isFinite(machine?.stored)
    ? Math.max(0, Math.min(capacity, Math.floor(machine.stored)))
    : 0;
  const currentLastUpdated = Number.isFinite(machine?.lastUpdated) ? machine.lastUpdated : now;
  const elapsed = Math.max(0, now - currentLastUpdated);
  const ticks = Math.floor(elapsed / moneyMachineTickMs);
  const earned = ticks * passiveEarn;
  const nextStored = Math.min(capacity, currentStored + earned);
  const reachedCapacity = nextStored >= capacity;

  return {
    stored: nextStored,
    lastUpdated: reachedCapacity ? now : currentLastUpdated + ticks * moneyMachineTickMs,
    tapLevel,
    capacityLevel,
  };
}

function createRentalIncome(now = Date.now()) {
  return {
    stored: 0,
    lastUpdated: now,
  };
}

function rentalRateForProperties(ownedRealEstate, rentalPercentBonus = 0) {
  const baseRate = realEstateListings.reduce(
    (total, property) => total + (ownedRealEstate.includes(property.name) ? property.rentPerHour : 0),
    0
  );
  return Math.floor(baseRate * (1 + rentalPercentBonus / 100));
}

function normalizeRentalIncome(income, ownedRealEstate = [], now = Date.now(), rentalPercentBonus = 0) {
  const stored = Number.isFinite(income?.stored) ? Math.max(0, Math.floor(income.stored)) : 0;
  const lastUpdated = Number.isFinite(income?.lastUpdated) ? income.lastUpdated : now;
  const elapsed = Math.max(0, now - lastUpdated);
  const hourlyRate = rentalRateForProperties(ownedRealEstate, rentalPercentBonus);
  const completedHours = Math.floor(elapsed / rentalIncomeTickMs);

  if (hourlyRate <= 0) {
    return {
      stored: Math.min(rentalIncomeCapacity, stored),
      lastUpdated: now,
    };
  }

  const nextStored = Math.min(rentalIncomeCapacity, stored + completedHours * hourlyRate);

  return {
    stored: nextStored,
    lastUpdated: nextStored >= rentalIncomeCapacity ? now : lastUpdated + completedHours * rentalIncomeTickMs,
  };
}

function formatRentalCountdown(ms) {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

function normalizeAchievementStats(stats) {
  return Object.keys(defaultAchievementStats).reduce((normalized, key) => {
    const value = Number(stats?.[key]);
    return {
      ...normalized,
      [key]: Number.isFinite(value) && value > 0 ? Math.floor(value) : defaultAchievementStats[key],
    };
  }, {});
}

function achievementProgress(achievement, stats) {
  return Math.min(achievement.goal, stats[achievement.stat] || 0);
}

function formatAchievementValue(value, achievement) {
  return achievement.money ? `$${value.toLocaleString("en-US")}` : value.toLocaleString("en-US");
}

function sumOwnedListingPrices(ownedNames, listings) {
  return listings.reduce(
    (total, listing) => total + (ownedNames.includes(listing.name) ? listing.price : 0),
    0
  );
}

function rewardedAdCreditForWealth(wealth) {
  if (wealth >= rewardedAdHighWealth) {
    return rewardedAdHighCredit;
  }

  if (wealth >= rewardedAdMidWealth) {
    return rewardedAdMidCredit;
  }

  return rewardedAdCredit;
}

export {
  APP_SPLASH,
  CARD_BACK,
  CARD_DEAL_SOUND,
  CARD_IMAGES,
  CHIP_PLACE_SOUND,
  ITEM_IMAGES,
  PRELOAD_IMAGE_ASSETS,
  PROPERTY_IMAGES,
  SOUND_OFF_ICON,
  SOUND_ON_ICON,
  TABLE_FELT,
  TAB_BLACKJACK_ICON,
  TAB_MONEY_ICON,
  TAB_STORE_ICON,
  VEHICLE_IMAGES,
  accountCost,
  accountLimit,
  accountsStorageKey,
  achievementDefinitions,
  achievementProgress,
  betOptions,
  bonusLabel,
  chipColors,
  clamp,
  createDeck,
  createMoneyMachine,
  createRentalIncome,
  defaultAchievementStats,
  developerCheatChips,
  developerCheatReward,
  draw,
  firstAccountChips,
  formatAchievementValue,
  formatRentalCountdown,
  getBetChipButtonTransform,
  getGoogleMobileAdsModule,
  getLayoutWidth,
  getResponsiveLayout,
  getResponsiveMetrics,
  getSafeFrameInsets,
  handValue,
  isExpoGo,
  itemListings,
  mainTabIndex,
  mainTabs,
  moneyMachineBaseCapacity,
  moneyMachineBaseTapEarn,
  moneyMachineCapacityForLevel,
  moneyMachineCapacityStep,
  moneyMachineCapacityUpgradeBaseCost,
  moneyMachineCapacityUpgradeCostStep,
  moneyMachineEarnPerTick,
  moneyMachineMaxCapacityLevel,
  moneyMachineMaxTapEarn,
  moneyMachineMaxTapLevel,
  moneyMachinePassiveEarnForBonuses,
  moneyMachineTapEarnForLevel,
  moneyMachineTapEarnStep,
  moneyMachineTapUpgradeBaseCost,
  moneyMachineTapUpgradeCostStep,
  moneyMachineTickMs,
  moneyMachineUpgradeCost,
  normalizeAchievementStats,
  normalizeMoneyMachine,
  normalizeMoneyMachineLevel,
  normalizeRentalIncome,
  ranks,
  realEstateListings,
  rentalIncomeCapacity,
  rentalIncomeTickMs,
  rentalRateForProperties,
  replaySound,
  rewardedAdCreditForWealth,
  scalePx,
  settingsStorageKey,
  shuffle,
  startingChips,
  storeBonusesForOwned,
  suitLabel,
  suits,
  sumOwnedListingPrices,
  valueOf,
  vehicleListings,
  wait,
};
