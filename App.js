import { useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Asset } from "expo-asset";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import Constants from "expo-constants";
import * as NavigationBar from "expo-navigation-bar";
import {
  Animated,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import {
  AchievementsModal,
  AchievementToast,
  BetStack,
  BlackjackCelebration,
  BottomTabs,
  CreditDelta,
  Hand,
  MoneyMachinePanel,
  ProfileScreen,
  ResultSplash,
  RoundLoader,
  StorePanel,
} from "./src/components";
import {
  APP_SPLASH,
  CARD_DEAL_SOUND,
  CHIP_PLACE_SOUND,
  PRELOAD_IMAGE_ASSETS,
  SOUND_OFF_ICON,
  SOUND_ON_ICON,
  TABLE_FELT,
  accountCost,
  accountLimit,
  accountsStorageKey,
  achievementDefinitions,
  achievementProgress,
  betOptions,
  createDeck,
  createMoneyMachine,
  createRentalIncome,
  defaultAchievementStats,
  developerCheatChips,
  developerCheatReward,
  draw,
  firstAccountChips,
  formatRentalCountdown,
  getBetChipButtonTransform,
  getGoogleMobileAdsModule,
  getLayoutWidth,
  getResponsiveMetrics,
  getSafeFrameInsets,
  handValue,
  isExpoGo,
  itemListings,
  mainTabIndex,
  mainTabs,
  moneyMachineCapacityForLevel,
  moneyMachineMaxCapacityLevel,
  moneyMachineMaxTapLevel,
  moneyMachinePassiveEarnForBonuses,
  moneyMachineTapEarnForLevel,
  moneyMachineTickMs,
  moneyMachineUpgradeCost,
  normalizeAchievementStats,
  normalizeMoneyMachine,
  normalizeMoneyMachineLevel,
  normalizeRentalIncome,
  realEstateListings,
  rentalIncomeCapacity,
  rentalIncomeTickMs,
  rentalRateForProperties,
  replaySound,
  rewardedAdCredit,
  scalePx,
  settingsStorageKey,
  shuffle,
  startingChips,
  storeBonusesForOwned,
  sumOwnedListingPrices,
  vehicleListings,
  wait,
} from "./src/core/game";
import { styles } from "./src/styles/styles";

export default function App() {
  const windowSize = useWindowDimensions();
  const layoutWidth = getLayoutWidth(windowSize.width);
  const tabPanelWidth = layoutWidth;
  const responsiveMetrics = getResponsiveMetrics(windowSize.width, windowSize.height);
  const chipScale = responsiveMetrics.chipScale;
  const moneyMachineScale = responsiveMetrics.moneyMachineScale;
  const isTabletLayout = responsiveMetrics.isTablet;
  const safeFrameInsets = getSafeFrameInsets(windowSize.width, windowSize.height);
  const [deck, setDeck] = useState(() => shuffle(createDeck()));
  const [dealer, setDealer] = useState([]);
  const [player, setPlayer] = useState([]);
  const [chips, setChips] = useState(firstAccountChips);
  const [bet, setBet] = useState(0);
  const [betChips, setBetChips] = useState([]);
  const [inRound, setInRound] = useState(false);
  const [dealing, setDealing] = useState(false);
  const [revealDealer, setRevealDealer] = useState(false);
  const [resolvingDealer, setResolvingDealer] = useState(false);
  const [message, setMessage] = useState("");
  const [betweenRounds, setBetweenRounds] = useState(false);
  const [outOfCredit, setOutOfCredit] = useState(false);
  const [resultDelta, setResultDelta] = useState(null);
  const [creditDelta, setCreditDelta] = useState(null);
  const [shownPlayerScore, setShownPlayerScore] = useState(0);
  const [shownDealerScore, setShownDealerScore] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [moneyMachine, setMoneyMachine] = useState(() => createMoneyMachine());
  const [rentalIncome, setRentalIncome] = useState(() => createRentalIncome());
  const [achievementStats, setAchievementStats] = useState(() =>
    normalizeAchievementStats(defaultAchievementStats)
  );
  const [ownedItems, setOwnedItems] = useState([]);
  const [ownedRealEstate, setOwnedRealEstate] = useState([]);
  const [ownedVehicles, setOwnedVehicles] = useState([]);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [hasChosenFirstAccountName, setHasChosenFirstAccountName] = useState(false);
  const [firstAccountName, setFirstAccountName] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [accountMenuMessage, setAccountMenuMessage] = useState("");
  const [achievementMenuOpen, setAchievementMenuOpen] = useState(false);
  const [profileScreenOpen, setProfileScreenOpen] = useState(false);
  const [achievementToast, setAchievementToast] = useState(null);
  const [achievementToastQueue, setAchievementToastQueue] = useState([]);
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editingAccountName, setEditingAccountName] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [blackjackCelebration, setBlackjackCelebration] = useState(false);
  const [activeTab, setActiveTab] = useState("blackjack");
  const [rewardedAdLoading, setRewardedAdLoading] = useState(false);
  const [adStatusMessage, setAdStatusMessage] = useState("");
  const [startupSplashVisible, setStartupSplashVisible] = useState(true);
  const resultTimer = useRef(null);
  const nextRoundTimer = useRef(null);
  const adStatusTimer = useRef(null);
  const startupSplashTimer = useRef(null);
  const achievementUnlocksReady = useRef(false);
  const unlockedAchievementIds = useRef(new Set());
  const developerCheatStep = useRef(0);
  const developerDeckTaps = useRef(0);
  const tabSlide = useRef(new Animated.Value(mainTabIndex.blackjack)).current;
  const cardSoundPlayer = useAudioPlayer(CARD_DEAL_SOUND);
  const chipSoundPlayer = useAudioPlayer(CHIP_PLACE_SOUND);

  const playerScore = useMemo(() => handValue(player), [player]);
  const dealerScore = useMemo(() => handValue(dealer), [dealer]);
  const activeAccount = accounts.find((account) => account.id === activeAccountId);
  const totalAccountCredit = useMemo(
    () => accounts.reduce((total, account) => total + Math.max(0, Math.floor(account.credit || 0)), 0),
    [accounts]
  );
  const moneyMachineStored = Math.floor(moneyMachine.stored || 0);
  const moneyMachineTapLevel = normalizeMoneyMachineLevel(moneyMachine.tapLevel, moneyMachineMaxTapLevel);
  const moneyMachineCapacityLevel = normalizeMoneyMachineLevel(
    moneyMachine.capacityLevel,
    moneyMachineMaxCapacityLevel
  );
  const activeStoreBonuses = useMemo(
    () => storeBonusesForOwned(ownedItems, ownedVehicles),
    [ownedItems, ownedVehicles]
  );
  const activeMachinePassiveEarn = moneyMachinePassiveEarnForBonuses(activeStoreBonuses);
  const activeMoneyMachineCapacity = moneyMachineCapacityForLevel(
    moneyMachineCapacityLevel,
    activeStoreBonuses.capacity
  );
  const activeMoneyMachineTapEarn = moneyMachineTapEarnForLevel(moneyMachineTapLevel, activeStoreBonuses.tap);
  const rentalRate = rentalRateForProperties(ownedRealEstate, activeStoreBonuses.rentalPercent);
  const rentalIncomeStored = Math.min(rentalIncomeCapacity, Math.floor(rentalIncome.stored || 0));
  const rentalIncomeFull = rentalIncomeStored >= rentalIncomeCapacity;
  const rentalElapsed = Math.max(0, Date.now() - (rentalIncome.lastUpdated || Date.now()));
  const rentalPayoutProgress =
    rentalRate > 0 ? (rentalIncomeFull ? 1 : Math.min(1, rentalElapsed / rentalIncomeTickMs)) : 0;
  const rentalCountdownText =
    rentalRate <= 0
      ? "Buy real estate"
      : rentalIncomeFull
        ? "FULL"
        : `Next in ${formatRentalCountdown(rentalIncomeTickMs - rentalElapsed)}`;
  const ownedRealEstateValue = useMemo(
    () => sumOwnedListingPrices(ownedRealEstate, realEstateListings),
    [ownedRealEstate]
  );
  const ownedVehiclesValue = useMemo(
    () => sumOwnedListingPrices(ownedVehicles, vehicleListings),
    [ownedVehicles]
  );
  const ownedItemsValue = useMemo(() => sumOwnedListingPrices(ownedItems, itemListings), [ownedItems]);
  const currentWealth =
    totalAccountCredit +
    moneyMachineStored +
    rentalIncomeStored +
    ownedRealEstateValue +
    ownedVehiclesValue +
    ownedItemsValue;
  const achievementDisplayStats = useMemo(
    () => ({
      ...achievementStats,
      ownedRealEstateCount: ownedRealEstate.length,
      ownedVehiclesCount: ownedVehicles.length,
      ownedItemsCount: ownedItems.length,
      totalStoreOwned: ownedRealEstate.length + ownedVehicles.length + ownedItems.length,
      moneyMachineTapLevel,
      moneyMachineCapacityLevel,
    }),
    [
      achievementStats,
      moneyMachineCapacityLevel,
      moneyMachineTapLevel,
      ownedItems.length,
      ownedRealEstate.length,
      ownedVehicles.length,
    ]
  );
  const accountSwitchLocked =
    inRound || dealing || resolvingDealer || betweenRounds || resultDelta !== null || creditDelta !== null;
  const showBottomTabs =
    !inRound &&
    !dealing &&
    !resolvingDealer &&
    !betweenRounds &&
    !outOfCredit &&
    resultDelta === null &&
    !blackjackCelebration;
  const showBlackjackTable =
    activeTab === "blackjack" || inRound || dealing || resolvingDealer || resultDelta !== null || blackjackCelebration;
  const needsFirstAccountName = accountsLoaded && !hasChosenFirstAccountName;

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    StatusBar.setHidden(true, "none");
    StatusBar.setTranslucent(true);
    StatusBar.setBackgroundColor("transparent", true);

    NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    NavigationBar.setButtonStyleAsync("light").catch(() => {});
  }, []);

  useEffect(() => {
    Asset.loadAsync(PRELOAD_IMAGE_ASSETS).catch(() => {});
  }, []);

  useEffect(() => {
    if (!accountsLoaded || currentWealth <= (achievementStats.highestWealth || 0)) {
      return;
    }

    setAchievementBest("highestWealth", currentWealth);
  }, [accountsLoaded, achievementStats.highestWealth, currentWealth]);

  useEffect(() => {
    if (!accountsLoaded) {
      return;
    }

    const nextUnlockedIds = new Set(
      achievementDefinitions
        .filter((achievement) => achievementProgress(achievement, achievementDisplayStats) >= achievement.goal)
        .map((achievement) => achievement.id)
    );

    if (!achievementUnlocksReady.current) {
      unlockedAchievementIds.current = nextUnlockedIds;
      achievementUnlocksReady.current = true;
      return;
    }

    const newUnlocks = achievementDefinitions.filter(
      (achievement) => nextUnlockedIds.has(achievement.id) && !unlockedAchievementIds.current.has(achievement.id)
    );

    unlockedAchievementIds.current = nextUnlockedIds;

    if (newUnlocks.length > 0) {
      const totalReward = newUnlocks.reduce((total, achievement) => total + (achievement.reward || 0), 0);
      if (totalReward > 0 && activeAccountId) {
        setAccounts((current) =>
          current.map((account) =>
            account.id === activeAccountId
              ? { ...account, credit: account.credit + totalReward }
              : account
          )
        );
        setChips((current) => current + totalReward);
        setOutOfCredit(false);
      }
      setAchievementToastQueue((current) => [...current, ...newUnlocks]);
    }
  }, [accountsLoaded, achievementDisplayStats, activeAccountId]);

  useEffect(() => {
    if (achievementToast || achievementToastQueue.length === 0) {
      return;
    }

    const [nextToast, ...remainingToasts] = achievementToastQueue;
    setAchievementToast(nextToast);
    setAchievementToastQueue(remainingToasts);
  }, [achievementToast, achievementToastQueue]);

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    cardSoundPlayer.volume = 0.55;
    chipSoundPlayer.volume = 0.72;
  }, [cardSoundPlayer, chipSoundPlayer]);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      const savedSettings = await AsyncStorage.getItem(settingsStorageKey);
      if (!active || savedSettings === null) {
        return;
      }

      try {
        const parsedSettings = JSON.parse(savedSettings);
        if (typeof parsedSettings.soundEnabled === "boolean") {
          setSoundEnabled(parsedSettings.soundEnabled);
        }
      } catch {
        // Ignore old or broken settings data.
      }
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(settingsStorageKey, JSON.stringify({ soundEnabled }));
  }, [soundEnabled]);

  useEffect(() => {
    let active = true;

    async function loadAccounts() {
      try {
        const savedAccounts = await AsyncStorage.getItem(accountsStorageKey);
        const now = Date.now();
        let loadedAccounts = [];
        let loadedActiveId = null;
        let loadedHasChosenName = false;
        let loadedMoneyMachine = null;
        let loadedRentalIncome = null;
        let loadedAchievementStats = normalizeAchievementStats(defaultAchievementStats);
        let loadedOwnedItems = [];
        let loadedOwnedRealEstate = [];
        let loadedOwnedVehicles = [];

        if (savedAccounts !== null) {
          const parsedSave = JSON.parse(savedAccounts);
          loadedHasChosenName = parsedSave.hasChosenFirstAccountName === true;
          if (parsedSave.moneyMachine) {
            loadedMoneyMachine = parsedSave.moneyMachine;
          }
          if (parsedSave.rentalIncome) {
            loadedRentalIncome = parsedSave.rentalIncome;
          }
          if (parsedSave.achievementStats) {
            loadedAchievementStats = normalizeAchievementStats(parsedSave.achievementStats);
          }
          if (Array.isArray(parsedSave.ownedRealEstate)) {
            loadedOwnedRealEstate = parsedSave.ownedRealEstate.filter((name) =>
              realEstateListings.some((property) => property.name === name)
            );
          }
          if (Array.isArray(parsedSave.ownedItems)) {
            loadedOwnedItems = parsedSave.ownedItems.filter((name) =>
              itemListings.some((item) => item.name === name)
            );
          }
          if (Array.isArray(parsedSave.ownedVehicles)) {
            loadedOwnedVehicles = parsedSave.ownedVehicles.filter((name) =>
              vehicleListings.some((vehicle) => vehicle.name === name)
            );
          }
          if (Array.isArray(parsedSave.accounts) && parsedSave.accounts.length > 0) {
            loadedAccounts = parsedSave.accounts.filter(
              (account) =>
                typeof account.id === "string" &&
                typeof account.name === "string" &&
                Number.isFinite(account.credit) &&
                account.credit >= 0
            );
            loadedActiveId = parsedSave.activeAccountId;
          }
        }

        if (loadedAccounts.length === 0) {
          loadedAccounts = [
            { id: "account-1", name: "Account 1", credit: firstAccountChips },
          ];
          loadedActiveId = "account-1";
        }

        const selectedAccount =
          loadedAccounts.find((account) => account.id === loadedActiveId) || loadedAccounts[0];
        const loadedStoreBonuses = storeBonusesForOwned(loadedOwnedItems, loadedOwnedVehicles);
        loadedMoneyMachine = normalizeMoneyMachine(
          loadedMoneyMachine || selectedAccount.moneyMachine || createMoneyMachine(now),
          now,
          moneyMachinePassiveEarnForBonuses(loadedStoreBonuses),
          loadedStoreBonuses.capacity
        );
        loadedRentalIncome = normalizeRentalIncome(
          loadedRentalIncome || createRentalIncome(now),
          loadedOwnedRealEstate,
          now,
          loadedStoreBonuses.rentalPercent
        );
        loadedAccounts = loadedAccounts.map(({ moneyMachine: legacyMoneyMachine, ...account }) => account);

        if (active) {
          setAccounts(loadedAccounts);
          setActiveAccountId(selectedAccount.id);
          setMoneyMachine(loadedMoneyMachine);
          setRentalIncome(loadedRentalIncome);
          setAchievementStats(loadedAchievementStats);
          setOwnedItems(loadedOwnedItems);
          setOwnedRealEstate(loadedOwnedRealEstate);
          setOwnedVehicles(loadedOwnedVehicles);
          setChips(selectedAccount.credit);
          setOutOfCredit(selectedAccount.credit <= 0);
          setHasChosenFirstAccountName(loadedHasChosenName);
        }
      } catch {
        const fallbackAccount = {
          id: "account-1",
          name: "Account 1",
          credit: firstAccountChips,
        };
        if (active) {
          setAccounts([fallbackAccount]);
          setActiveAccountId(fallbackAccount.id);
          setMoneyMachine(createMoneyMachine());
          setRentalIncome(createRentalIncome());
          setAchievementStats(normalizeAchievementStats(defaultAchievementStats));
          setOwnedItems([]);
          setOwnedRealEstate([]);
          setOwnedVehicles([]);
          setChips(fallbackAccount.credit);
        }
      } finally {
        if (active) {
          setAccountsLoaded(true);
        }
      }
    }

    loadAccounts();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (accountsLoaded && activeAccountId && accounts.length > 0) {
      AsyncStorage.setItem(
        accountsStorageKey,
        JSON.stringify({
          accounts,
          activeAccountId,
          hasChosenFirstAccountName,
          moneyMachine,
          rentalIncome,
          achievementStats,
          ownedItems,
          ownedRealEstate,
          ownedVehicles,
        })
      );
    }
  }, [
    accounts,
    activeAccountId,
    accountsLoaded,
    achievementStats,
    hasChosenFirstAccountName,
    moneyMachine,
    rentalIncome,
    ownedItems,
    ownedRealEstate,
    ownedVehicles,
  ]);

  useEffect(() => {
    if (!accountsLoaded) {
      return undefined;
    }

    const timer = setInterval(() => {
      setMoneyMachine((current) =>
        normalizeMoneyMachine(
          current,
          Date.now(),
          activeMachinePassiveEarn,
          activeStoreBonuses.capacity
        )
      );
      setRentalIncome((current) =>
        normalizeRentalIncome(current, ownedRealEstate, Date.now(), activeStoreBonuses.rentalPercent)
      );
    }, moneyMachineTickMs);

    return () => clearInterval(timer);
  }, [accountsLoaded, activeMachinePassiveEarn, activeStoreBonuses.capacity, activeStoreBonuses.rentalPercent, ownedRealEstate]);

  useEffect(() => {
    startupSplashTimer.current = setTimeout(() => {
      setStartupSplashVisible(false);
      startupSplashTimer.current = null;
    }, 900);

    return () => {
      if (startupSplashTimer.current) {
        clearTimeout(startupSplashTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (nextRoundTimer.current) {
        clearTimeout(nextRoundTimer.current);
      }
      if (resultTimer.current) {
        clearTimeout(resultTimer.current);
      }
      if (adStatusTimer.current) {
        clearTimeout(adStatusTimer.current);
      }
    };
  }, []);

  function saveActiveAccountCredit(nextCredit) {
    setAccounts((current) =>
      current.map((account) => (account.id === activeAccountId ? { ...account, credit: nextCredit } : account))
    );
  }

  function addAchievementStat(key, amount) {
    if (!amount) {
      return;
    }

    setAchievementStats((current) => ({
      ...normalizeAchievementStats(current),
      [key]: Math.max(0, Math.floor((current[key] || 0) + amount)),
    }));
  }

  function setAchievementBest(key, value) {
    setAchievementStats((current) => ({
      ...normalizeAchievementStats(current),
      [key]: Math.max(current[key] || 0, Math.floor(value)),
    }));
  }

  function registerAchievementRoundResult(delta) {
    setAchievementStats((current) => {
      const normalized = normalizeAchievementStats(current);
      if (delta <= 0) {
        return {
          ...normalized,
          currentWinStreak: 0,
        };
      }

      const nextStreak = normalized.currentWinStreak + 1;
      return {
        ...normalized,
        handsWon: normalized.handsWon + 1,
        biggestWin: Math.max(normalized.biggestWin, Math.floor(delta)),
        currentWinStreak: nextStreak,
        bestWinStreak: Math.max(normalized.bestWinStreak, nextStreak),
      };
    });
  }

  function selectTab(tab) {
    if (!showBottomTabs || tab === activeTab) {
      return;
    }

    setActiveTab(tab);
    Animated.spring(tabSlide, {
      toValue: mainTabIndex[tab],
      useNativeDriver: true,
      damping: 18,
      stiffness: 170,
      mass: 0.7,
    }).start();
  }

  function collectMoneyMachine() {
    if (!activeAccount || creditDelta !== null) {
      return;
    }

    const now = Date.now();
    const normalizedMachine = normalizeMoneyMachine(
      moneyMachine,
      now,
      activeMachinePassiveEarn,
      activeStoreBonuses.capacity
    );
    const amount = Math.floor(normalizedMachine.stored);

    if (amount <= 0) {
      return;
    }

    const nextCredit = chips + amount;

    setAccounts((current) =>
      current.map((account) =>
        account.id === activeAccountId ? { ...account, credit: nextCredit } : account
      )
    );
    setMoneyMachine({
      ...normalizedMachine,
      stored: 0,
      lastUpdated: normalizedMachine.lastUpdated,
    });
    setOutOfCredit(false);
    addAchievementStat("moneyMachineCollected", amount);
    setCreditDelta(amount);
  }

  function tapMoneyMachine() {
    if (!activeAccount || moneyMachineStored >= activeMoneyMachineCapacity) {
      return;
    }

    const now = Date.now();

    setMoneyMachine((current) => {
      const normalizedMachine = normalizeMoneyMachine(
        current,
        now,
        activeMachinePassiveEarn,
        activeStoreBonuses.capacity
      );
      const capacity = moneyMachineCapacityForLevel(
        normalizedMachine.capacityLevel,
        activeStoreBonuses.capacity
      );
      const tapEarn = moneyMachineTapEarnForLevel(normalizedMachine.tapLevel, activeStoreBonuses.tap);
      const nextStored = Math.min(capacity, normalizedMachine.stored + tapEarn);

      return {
        ...normalizedMachine,
        stored: nextStored,
        lastUpdated: nextStored >= capacity ? now : normalizedMachine.lastUpdated,
      };
    });
  }

  function upgradeMoneyMachine(type) {
    if (!activeAccount || creditDelta !== null) {
      return;
    }

    const now = Date.now();
    const normalizedMachine = normalizeMoneyMachine(
      moneyMachine,
      now,
      activeMachinePassiveEarn,
      activeStoreBonuses.capacity
    );
    const levelKey = type === "tap" ? "tapLevel" : "capacityLevel";
    const currentLevel = normalizedMachine[levelKey];
    const maxLevel = type === "tap" ? moneyMachineMaxTapLevel : moneyMachineMaxCapacityLevel;
    const cost = moneyMachineUpgradeCost(type, currentLevel);

    if (currentLevel >= maxLevel || chips < cost) {
      return;
    }

    const nextCredit = chips - cost;

    setAccounts((current) =>
      current.map((account) =>
        account.id === activeAccountId
          ? {
              ...account,
              credit: nextCredit,
            }
          : account
      )
    );
    setMoneyMachine({
      ...normalizedMachine,
      [levelKey]: currentLevel + 1,
    });
    setChips(nextCredit);
  }

  function buyRealEstate(property) {
    if (
      !activeAccount ||
      ownedRealEstate.includes(property.name) ||
      chips < property.price ||
      creditDelta !== null
    ) {
      return;
    }

    const now = Date.now();
    const nextCredit = chips - property.price;
    setRentalIncome((current) =>
      normalizeRentalIncome(current, ownedRealEstate, now, activeStoreBonuses.rentalPercent)
    );
    setChips(nextCredit);
    saveActiveAccountCredit(nextCredit);
    setOwnedRealEstate((current) => [...current, property.name]);
    addAchievementStat("storePurchases", 1);
  }

  function collectRentalIncome() {
    if (!activeAccount || creditDelta !== null) {
      return;
    }

    const now = Date.now();
    const normalizedIncome = normalizeRentalIncome(
      rentalIncome,
      ownedRealEstate,
      now,
      activeStoreBonuses.rentalPercent
    );
    const amount = Math.floor(normalizedIncome.stored);

    if (amount <= 0) {
      return;
    }

    const nextCredit = chips + amount;
    setAccounts((current) =>
      current.map((account) =>
        account.id === activeAccountId ? { ...account, credit: nextCredit } : account
      )
    );
    setRentalIncome({
      stored: normalizedIncome.stored - amount,
      lastUpdated: normalizedIncome.lastUpdated,
    });
    setOutOfCredit(false);
    addAchievementStat("rentalCollected", amount);
    setCreditDelta(amount);
  }

  function buyVehicle(vehicle) {
    if (
      !activeAccount ||
      ownedVehicles.includes(vehicle.name) ||
      chips < vehicle.price ||
      creditDelta !== null
    ) {
      return;
    }

    const nextCredit = chips - vehicle.price;
    const now = Date.now();
    setMoneyMachine((current) =>
      normalizeMoneyMachine(current, now, activeMachinePassiveEarn, activeStoreBonuses.capacity)
    );
    setRentalIncome((current) =>
      normalizeRentalIncome(current, ownedRealEstate, now, activeStoreBonuses.rentalPercent)
    );
    setChips(nextCredit);
    saveActiveAccountCredit(nextCredit);
    setOwnedVehicles((current) => [...current, vehicle.name]);
    addAchievementStat("storePurchases", 1);
  }

  function buyItem(item) {
    if (!activeAccount || ownedItems.includes(item.name) || chips < item.price || creditDelta !== null) {
      return;
    }

    const nextCredit = chips - item.price;
    const now = Date.now();
    setMoneyMachine((current) =>
      normalizeMoneyMachine(current, now, activeMachinePassiveEarn, activeStoreBonuses.capacity)
    );
    setRentalIncome((current) =>
      normalizeRentalIncome(current, ownedRealEstate, now, activeStoreBonuses.rentalPercent)
    );
    setChips(nextCredit);
    saveActiveAccountCredit(nextCredit);
    setOwnedItems((current) => [...current, item.name]);
    addAchievementStat("storePurchases", 1);
  }

  function resetDeveloperCheat() {
    developerCheatStep.current = 0;
    developerDeckTaps.current = 0;
  }

  function playSound(player) {
    if (soundEnabled) {
      replaySound(player);
    }
  }

  function registerDeveloperChip(amount) {
    const expectedAmount = developerCheatChips[developerCheatStep.current];

    if (developerDeckTaps.current === 0 && amount === expectedAmount) {
      developerCheatStep.current += 1;
      return;
    }

    resetDeveloperCheat();
  }

  function handleDeveloperDeckPress() {
    if (developerCheatStep.current !== developerCheatChips.length) {
      resetDeveloperCheat();
      return;
    }

    if (developerDeckTaps.current >= 10) {
      resetDeveloperCheat();
      return;
    }

    developerDeckTaps.current += 1;
  }

  function stopDeveloperTouchPropagation(event) {
    event.stopPropagation();
  }

  function handleDeveloperCreditPress() {
    if (
      developerCheatStep.current !== developerCheatChips.length ||
      developerDeckTaps.current !== 10 ||
      creditDelta !== null
    ) {
      resetDeveloperCheat();
      return;
    }

    const nextCredit = chips + developerCheatReward;
    saveActiveAccountCredit(nextCredit);
    setOutOfCredit(false);
    setCreditDelta(developerCheatReward);
    resetDeveloperCheat();
  }

  function awardRewardedAdCredit() {
    const nextCredit = chips + rewardedAdCredit;
    saveActiveAccountCredit(nextCredit);
    setOutOfCredit(false);
    setCreditDelta(rewardedAdCredit);
  }

  function setTemporaryAdStatus(message) {
    if (adStatusTimer.current) {
      clearTimeout(adStatusTimer.current);
    }

    setAdStatusMessage(message);
    adStatusTimer.current = setTimeout(() => {
      setAdStatusMessage("");
      adStatusTimer.current = null;
    }, 2200);
  }

  async function handleRewardedAdPress() {
    if (!activeAccount || creditDelta !== null || rewardedAdLoading) {
      return;
    }

    if (isExpoGo) {
      awardRewardedAdCredit();
      return;
    }

    const ads = getGoogleMobileAdsModule();
    if (!ads?.RewardedAd || !ads?.RewardedAdEventType || !ads?.TestIds) {
      setTemporaryAdStatus("Ad unavailable");
      return;
    }

    const rewardedAdUnitId =
      Platform.select({
        android: Constants.expoConfig?.extra?.adMob?.androidRewardedAdUnitId,
        ios: Constants.expoConfig?.extra?.adMob?.iosRewardedAdUnitId,
        default: null,
      }) || ads.TestIds.REWARDED;

    setRewardedAdLoading(true);

    try {
      if (typeof ads.mobileAds === "function") {
        await ads.mobileAds().initialize();
      }

      const rewardedAd = ads.RewardedAd.createForAdRequest(rewardedAdUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });
      const unsubscribers = [];
      const cleanup = () => {
        while (unsubscribers.length) {
          const unsubscribe = unsubscribers.pop();
          if (typeof unsubscribe === "function") {
            unsubscribe();
          }
        }
      };

      unsubscribers.push(
        rewardedAd.addAdEventListener(ads.RewardedAdEventType.LOADED, () => {
          Promise.resolve(rewardedAd.show()).catch(() => {
            cleanup();
            setTemporaryAdStatus("Ad not ready");
            setRewardedAdLoading(false);
          });
        })
      );
      unsubscribers.push(
        rewardedAd.addAdEventListener(ads.RewardedAdEventType.EARNED_REWARD, () => {
          awardRewardedAdCredit();
        })
      );
      unsubscribers.push(
        rewardedAd.addAdEventListener(ads.AdEventType.CLOSED, () => {
          cleanup();
          setRewardedAdLoading(false);
        })
      );
      unsubscribers.push(
        rewardedAd.addAdEventListener(ads.AdEventType.ERROR, () => {
          cleanup();
          setTemporaryAdStatus("Ad not ready");
          setRewardedAdLoading(false);
        })
      );

      rewardedAd.load();
    } catch (error) {
      setTemporaryAdStatus("Ad unavailable");
      setRewardedAdLoading(false);
    }
  }

  function saveFirstAccountName() {
    const trimmedName = firstAccountName.trim();
    if (!trimmedName) {
      return;
    }

    setAccounts((current) =>
      current.map((account, index) => (index === 0 ? { ...account, name: trimmedName } : account))
    );
    setHasChosenFirstAccountName(true);
    setFirstAccountName("");
  }

  function startRenamingAccount(account) {
    setEditingAccountId(account.id);
    setEditingAccountName(account.name);
    setAccountMenuMessage("");
  }

  function saveAccountName() {
    const trimmedName = editingAccountName.trim();
    if (!trimmedName || !editingAccountId) {
      return;
    }

    setAccounts((current) =>
      current.map((account) => (account.id === editingAccountId ? { ...account, name: trimmedName } : account))
    );
    setEditingAccountId(null);
    setEditingAccountName("");
    setAccountMenuMessage("");
  }

  function cancelRenamingAccount() {
    setEditingAccountId(null);
    setEditingAccountName("");
  }

  function closeAccountMenu() {
    cancelRenamingAccount();
    setAccountMenuOpen(false);
    setAccountMenuMessage("");
  }

  function resetTable() {
    resetDeveloperCheat();

    if (nextRoundTimer.current) {
      clearTimeout(nextRoundTimer.current);
      nextRoundTimer.current = null;
    }
    if (resultTimer.current) {
      clearTimeout(resultTimer.current);
      resultTimer.current = null;
    }

    setDealer([]);
    setPlayer([]);
    setShownDealerScore(0);
    setShownPlayerScore(0);
    setBet(0);
    setBetChips([]);
    setInRound(false);
    setDealing(false);
    setRevealDealer(false);
    setResolvingDealer(false);
    setBetweenRounds(false);
    setResultDelta(null);
    setCreditDelta(null);
    setBlackjackCelebration(false);
    setMessage("");
  }

  function switchAccount(account) {
    if (accountSwitchLocked || account.id === activeAccountId) {
      return;
    }

    resetTable();
    setActiveAccountId(account.id);
    setChips(account.credit);
    setOutOfCredit(account.credit <= 0);
    setAccountMenuMessage("");
    setAccountMenuOpen(false);
  }

  function createAccount() {
    if (accountSwitchLocked) {
      setAccountMenuMessage("Finish the round first.");
      return;
    }
    if (accounts.length >= accountLimit) {
      setAccountMenuMessage(`Max ${accountLimit} accounts.`);
      return;
    }
    if (chips < accountCost) {
      setAccountMenuMessage(`Need $${accountCost} credit.`);
      return;
    }

    const nextAccount = {
      id: `account-${Date.now()}`,
      name: `Account ${accounts.length + 1}`,
      credit: startingChips,
    };
    const remainingCredit = chips - accountCost;

    resetTable();
    setAccounts((current) => [
      ...current.map((account) =>
        account.id === activeAccountId ? { ...account, credit: remainingCredit } : account
      ),
      nextAccount,
    ]);
    setActiveAccountId(nextAccount.id);
    setChips(nextAccount.credit);
    setOutOfCredit(false);
    setAccountMenuMessage("");
    setAccountMenuOpen(false);
  }

  function finishRound(text, payout, options = {}) {
    const { blackjack = false, showResultSplash = true } = options;
    const delta = payout - bet;
    const nextChips = chips + delta;
    saveActiveAccountCredit(nextChips);
    addAchievementStat("roundsPlayed", 1);
    addAchievementStat("totalBet", bet);
    registerAchievementRoundResult(delta);
    if (blackjack) {
      addAchievementStat("blackjackWins", 1);
    }

    setInRound(false);
    setDealing(false);
    setResolvingDealer(false);
    setRevealDealer(true);
    setBet(0);
    setBetChips([]);
    setMessage(showResultSplash ? text : "");
    setBetweenRounds(!showResultSplash);
    setResultDelta(showResultSplash ? delta : null);
    setCreditDelta(delta === 0 ? null : delta);

    if (nextRoundTimer.current) {
      clearTimeout(nextRoundTimer.current);
    }
    if (resultTimer.current) {
      clearTimeout(resultTimer.current);
    }

    const finishResultHold = () => {
      setResultDelta(null);
      setBetweenRounds(true);
      setMessage("");

      nextRoundTimer.current = setTimeout(() => {
        setBetweenRounds(false);
        setDealer([]);
        setPlayer([]);
        setShownDealerScore(0);
        setShownPlayerScore(0);
        setRevealDealer(false);
        if (nextChips <= 0) {
          setOutOfCredit(true);
          setMessage("");
        } else {
          setMessage("");
        }
      }, 3000);
    };

    if (showResultSplash) {
      resultTimer.current = setTimeout(finishResultHold, 2400);
    } else {
      finishResultHold();
    }
  }

  function addBetChip(amount) {
    if (betweenRounds || outOfCredit || resultDelta !== null || dealing) {
      return;
    }

    registerDeveloperChip(amount);

    const availableChips = chips - bet;
    if (amount > availableChips) {
      setMessage("Not enough credit.");
      return;
    }

    playSound(chipSoundPlayer);
    setBet((current) => current + amount);
    setBetChips((current) => [...current, amount]);
    setMessage("");
  }

  function clearBet() {
    if (betweenRounds || outOfCredit || resultDelta !== null || dealing) {
      return;
    }

    setBet(0);
    setBetChips([]);
    setMessage("");
  }

  function buyCredit() {
    setChips(startingChips);
    saveActiveAccountCredit(startingChips);
    setCreditDelta(null);
    setBet(0);
    setBetChips([]);
    setDealer([]);
    setPlayer([]);
    setShownDealerScore(0);
    setShownPlayerScore(0);
    setDealing(false);
    setRevealDealer(false);
    setResolvingDealer(false);
    setOutOfCredit(false);
    setBetweenRounds(false);
    setMessage("");
  }

  async function startRound() {
    resetDeveloperCheat();

    if (nextRoundTimer.current) {
      clearTimeout(nextRoundTimer.current);
      nextRoundTimer.current = null;
    }
    if (resultTimer.current) {
      clearTimeout(resultTimer.current);
      resultTimer.current = null;
    }

    if (betweenRounds || outOfCredit || resultDelta !== null || dealing) {
      return;
    }

    if (bet <= 0) {
      setMessage("Place a bet first.");
      return;
    }

    if (chips < bet) {
      setMessage("Not enough credit.");
      return;
    }

    let nextDeck = shuffle(createDeck());
    const playerCards = [];
    const dealerCards = [];

    setDeck(nextDeck);
    setPlayer([]);
    setDealer([]);
    setShownPlayerScore(0);
    setShownDealerScore(0);
    setInRound(true);
    setDealing(true);
    setResolvingDealer(false);
    setRevealDealer(false);
    setMessage("");

    let result = draw(nextDeck);
    playerCards.push(result.card);
    nextDeck = result.deck;
    setDeck(nextDeck);
    playSound(cardSoundPlayer);
    setPlayer([...playerCards]);
    await wait(400);
    setShownPlayerScore(handValue(playerCards));
    await wait(120);

    result = draw(nextDeck);
    dealerCards.push(result.card);
    nextDeck = result.deck;
    setDeck(nextDeck);
    playSound(cardSoundPlayer);
    setDealer([...dealerCards]);
    await wait(400);
    setShownDealerScore(handValue(dealerCards));
    await wait(120);

    result = draw(nextDeck);
    playerCards.push(result.card);
    nextDeck = result.deck;
    setDeck(nextDeck);
    playSound(cardSoundPlayer);
    setPlayer([...playerCards]);
    await wait(400);
    setShownPlayerScore(handValue(playerCards));
    await wait(120);

    result = draw(nextDeck);
    dealerCards.push(result.card);
    nextDeck = result.deck;
    setDeck(nextDeck);
    playSound(cardSoundPlayer);
    setDealer([...dealerCards]);
    setDealing(false);

    if (handValue(playerCards) === 21) {
      setDealing(true);
      setBlackjackCelebration(true);
      await wait(3000);
      setBlackjackCelebration(false);
      setDealing(false);
      finishRound("Blackjack!", Math.floor(bet * 2.5), { blackjack: true, showResultSplash: false });
      return;
    }

    setMessage("Hit or stand.");
  }

  async function hit() {
    if (resolvingDealer || dealing) {
      return;
    }

    const result = draw(deck.length > 8 ? deck : shuffle(createDeck()));
    const nextPlayer = [...player, result.card];
    setDeck(result.deck);
    playSound(cardSoundPlayer);
    setPlayer(nextPlayer);
    setDealing(true);
    await wait(260);
    setShownPlayerScore(handValue(nextPlayer));
    setDealing(false);

    const score = handValue(nextPlayer);
    if (score > 21) {
      await wait(300);
      finishRound("Bust!", 0);
      return;
    }

    if (score === 21) {
      setMessage("21!");
      setResolvingDealer(true);
      await wait(520);
      resolveDealer(21);
      return;
    }

    setMessage("Keep going?");
  }

  async function resolveDealer(finalPlayerScore) {
    setResolvingDealer(true);
    setMessage("");
    setRevealDealer(true);
    await wait(700);
    setShownDealerScore(handValue(dealer));
    await wait(200);

    let nextDeck = deck;
    let nextDealer = [...dealer];

    while (handValue(nextDealer) < 17) {
      const result = draw(nextDeck.length > 8 ? nextDeck : shuffle(createDeck()));
      nextDealer = [...nextDealer, result.card];
      nextDeck = result.deck;
      setDeck(nextDeck);
      playSound(cardSoundPlayer);
      setDealer(nextDealer);
      await wait(700);
      setShownDealerScore(handValue(nextDealer));
      await wait(200);
    }

    await wait(1000);

    const finalDealerScore = handValue(nextDealer);
    if (finalDealerScore > 21 || finalPlayerScore > finalDealerScore) {
      finishRound("You win!", bet * 2);
    } else if (finalPlayerScore === finalDealerScore) {
      finishRound("", bet);
    } else {
      finishRound("Dealer wins.", 0);
    }
  }

  async function stand() {
    if (resolvingDealer || dealing) {
      return;
    }

    resolveDealer(playerScore);
  }

  const tabTrackTranslateX = tabSlide.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -tabPanelWidth, -tabPanelWidth * 2],
  });
  const blackjackOverlayTranslateX = tabSlide.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [tabPanelWidth, 0, -tabPanelWidth],
  });
  const storeOverlayTranslateX = tabSlide.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -tabPanelWidth, -tabPanelWidth * 2],
  });
  const moneyOverlayTranslateX = tabSlide.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [tabPanelWidth * 2, tabPanelWidth, 0],
  });

  return (
    <ImageBackground fadeDuration={0} resizeMode="cover" source={TABLE_FELT} style={styles.background}>
      <View style={styles.safeArea}>
        <StatusBar hidden barStyle="light-content" backgroundColor="transparent" translucent />
        <View
          onTouchStart={resetDeveloperCheat}
          style={[
            styles.screen,
            {
              paddingBottom: 10 + safeFrameInsets.bottom,
              paddingHorizontal: 12 + safeFrameInsets.horizontal,
              paddingTop: 10 + safeFrameInsets.top,
            },
          ]}
        >
        {needsFirstAccountName ? (
          <View style={[styles.inlineNameOverlay, { width: layoutWidth }]}>
            <View onTouchStart={stopDeveloperTouchPropagation} style={styles.inlineNamePanel}>
              <TextInput
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={10}
                onChangeText={setFirstAccountName}
                onSubmitEditing={saveFirstAccountName}
                placeholder="Enter name"
                placeholderTextColor="rgba(255,255,255,0.62)"
                returnKeyType="done"
                style={styles.inlineNameInput}
                value={firstAccountName}
              />
              <Pressable
                disabled={!firstAccountName.trim()}
                onPress={saveFirstAccountName}
                style={({ pressed }) => [
                  styles.inlineNameConfirm,
                  !firstAccountName.trim() && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.inlineNameConfirmText}>OK</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
        <View style={[styles.header, { width: layoutWidth }]}>
          <View style={styles.headerLeftSlot}>
            <Pressable
              onPress={() => setAchievementMenuOpen(true)}
              onTouchStart={stopDeveloperTouchPropagation}
              style={({ pressed }) => [styles.achievementHeaderButton, pressed && styles.pressed]}
            >
              <Text style={styles.achievementHeaderIcon}>★</Text>
            </Pressable>
            <Pressable
              onPress={() => setProfileScreenOpen(true)}
              onTouchStart={stopDeveloperTouchPropagation}
              style={({ pressed }) => [styles.profileHeaderButton, pressed && styles.pressed]}
            >
              <View style={styles.profileHeaderIcon}>
                <View style={styles.profileHeaderIconHead} />
                <View style={styles.profileHeaderIconBody} />
              </View>
            </Pressable>
          </View>
          <Pressable
            onPress={() => setSoundEnabled((current) => !current)}
            style={({ pressed }) => [styles.soundHeaderButton, pressed && styles.pressed]}
          >
            <Image
              fadeDuration={0}
              resizeMode="contain"
              source={soundEnabled ? SOUND_ON_ICON : SOUND_OFF_ICON}
              style={styles.soundHeaderIcon}
            />
          </Pressable>
          <View style={styles.headerRight}>
          <Pressable
            onPress={() => {
              setAccountMenuMessage(accountSwitchLocked ? "Finish the round first." : "");
              setAccountMenuOpen(true);
            }}
            style={({ pressed }) => [styles.accountMenuButton, pressed && styles.pressed]}
          >
            <View style={styles.menuIcon}>
              <View style={styles.menuIconLine} />
              <View style={styles.menuIconLine} />
              <View style={styles.menuIconLine} />
            </View>
            <Text numberOfLines={1} style={styles.accountMenuButtonText}>
              {activeAccount?.name || "Account"}
            </Text>
          </Pressable>
          <View style={styles.wallet}>
            <View style={styles.walletLabelRow}>
              <Pressable
                onPress={handleDeveloperCreditPress}
                onTouchStart={stopDeveloperTouchPropagation}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <Text style={styles.walletLabel}>Credit</Text>
              </Pressable>
            </View>
            <Text style={styles.walletValue}>{chips}</Text>
            <Pressable
              disabled={creditDelta !== null || rewardedAdLoading}
              onPress={handleRewardedAdPress}
              onTouchStart={stopDeveloperTouchPropagation}
              style={({ pressed }) => [
                styles.rewardedAdButton,
                (creditDelta !== null || rewardedAdLoading) && styles.disabled,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.rewardedAdBadge}>AD</Text>
              <Text style={styles.rewardedAdText}>{rewardedAdLoading ? "..." : "+10K"}</Text>
            </Pressable>
            {adStatusMessage ? <Text style={styles.rewardedAdStatus}>{adStatusMessage}</Text> : null}
            {creditDelta !== null && (
              <CreditDelta
                amount={creditDelta}
                onDone={() => {
                  setChips((current) => current + creditDelta);
                  setCreditDelta(null);
                }}
              />
            )}
          </View>
          </View>
        </View>

        {achievementToast ? (
          <AchievementToast achievement={achievementToast} onDone={() => setAchievementToast(null)} />
        ) : null}

        {profileScreenOpen ? (
          <ProfileScreen
            currentWealth={currentWealth}
            isTablet={isTabletLayout}
            onBack={() => setProfileScreenOpen(false)}
            ownedCounts={{
              realEstate: ownedRealEstate.length,
              vehicles: ownedVehicles.length,
              items: ownedItems.length,
            }}
            safeFrameInsets={safeFrameInsets}
            stats={achievementStats}
            totalCredit={totalAccountCredit}
          />
        ) : null}

        <View style={[styles.table, { width: layoutWidth }]}>
          <View
            pointerEvents={showBlackjackTable ? "auto" : "none"}
            style={[
              styles.blackjackHandClip,
              isTabletLayout && styles.blackjackHandClipTablet,
              { width: tabPanelWidth },
            ]}
          >
            <Animated.View style={{ transform: [{ translateX: blackjackOverlayTranslateX }] }}>
              <Hand
                cards={dealer}
                score={shownDealerScore}
                hideDealer={inRound && !revealDealer}
                isTablet={isTabletLayout}
                onDeckPress={
                  !inRound && !dealing && !betweenRounds && resultDelta === null && !outOfCredit
                    ? handleDeveloperDeckPress
                    : undefined
                }
                onDeckTouchStart={stopDeveloperTouchPropagation}
                showDeck
                showScore={inRound}
                stacked
                compactStack
              />
            </Animated.View>
          </View>

          <View style={styles.centerControls}>
            {showBottomTabs ? (
              <>
                <View
                  style={[
                    styles.tabArea,
                    isTabletLayout && styles.tabAreaTablet,
                    { width: tabPanelWidth },
                  ]}
                >
                  <View
                    style={[
                      styles.tabViewport,
                      isTabletLayout && styles.tabViewportTablet,
                      { width: tabPanelWidth },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.tabTrack,
                        {
                          width: tabPanelWidth * mainTabs.length,
                          transform: [{ translateX: tabTrackTranslateX }],
                        },
                      ]}
                    >
                      <View style={[styles.tabPanel, { width: tabPanelWidth }]} />
                      <View style={[styles.tabPanel, { width: tabPanelWidth }]} />
                      <View style={[styles.tabPanel, { width: tabPanelWidth }]} />
                    </Animated.View>
                  </View>
                  <View
                    pointerEvents={activeTab === "store" ? "auto" : "none"}
                    style={[styles.storeOverlayClip, isTabletLayout && styles.storeOverlayClipTablet, { width: tabPanelWidth }]}
                  >
                    <Animated.View
                      style={[
                        styles.storeOverlay,
                        isTabletLayout && styles.storeOverlayTablet,
                        { transform: [{ translateX: storeOverlayTranslateX }] },
                      ]}
                    >
                      <StorePanel
                        credit={chips}
                        isTablet={isTabletLayout}
                        ownedItems={ownedItems}
                        ownedRealEstate={ownedRealEstate}
                        ownedVehicles={ownedVehicles}
                        rentalIncome={rentalIncomeStored}
                        rentalProgress={rentalPayoutProgress}
                        rentalRate={rentalRate}
                        rentalCountdownText={rentalCountdownText}
                        onBuyRealEstate={buyRealEstate}
                        onBuyVehicle={buyVehicle}
                        onBuyItem={buyItem}
                        onCollectRentalIncome={collectRentalIncome}
                        visible={activeTab === "store"}
                      />
                    </Animated.View>
                  </View>
                  <View
                    pointerEvents={activeTab === "blackjack" ? "box-none" : "none"}
                    style={[styles.blackjackOverlayClip, isTabletLayout && styles.blackjackOverlayClipTablet, { width: tabPanelWidth }]}
                  >
                    <Animated.View
                      style={[
                        styles.blackjackBetOverlay,
                        isTabletLayout && styles.blackjackBetOverlayTablet,
                        { transform: [{ translateX: blackjackOverlayTranslateX }] },
                      ]}
                    >
                        <Text style={styles.message}>{message}</Text>
                        <BetStack chips={betChips} chipScale={chipScale} isTablet={isTabletLayout} />

                        {outOfCredit ? (
                          <View style={styles.creditPanel}>
                            <Text style={styles.creditTitle}>Out of credit</Text>
                            <Pressable onPress={buyCredit} style={({ pressed }) => [styles.creditButton, pressed && styles.pressed]}>
                              <Text style={styles.creditButtonText}>Get credit</Text>
                            </Pressable>
                          </View>
                        ) : betweenRounds ? (
                          <RoundLoader />
                        ) : (
                          <>
                            <View
                              style={[
                                styles.betRow,
                                isTabletLayout && styles.betRowTablet,
                                {
                                  gap: scalePx(isTabletLayout ? 8 : 4, chipScale),
                                  minHeight: scalePx(isTabletLayout ? 108 : 78, chipScale),
                                },
                              ]}
                            >
                              {betOptions.map((amount, index) => (
                                <Pressable
                                  key={amount}
                                  onPress={() => addBetChip(amount)}
                                  onTouchStart={stopDeveloperTouchPropagation}
                                  style={({ pressed }) => [
                                    styles.chipButton,
                                    isTabletLayout && styles.chipButtonTablet,
                                    styles[`chipButton${index}`],
                                    isTabletLayout && styles[`chipButton${index}Tablet`],
                                    {
                                      borderRadius: scalePx(isTabletLayout ? 44 : 31, chipScale),
                                      transform: getBetChipButtonTransform(index, isTabletLayout, chipScale),
                                    },
                                    pressed && styles.pressed,
                                  ]}
                                >
                                  <Chip amount={amount} chipScale={chipScale} isTablet={isTabletLayout} />
                                </Pressable>
                              ))}
                            </View>
                            <View style={[styles.betActions, isTabletLayout && styles.betActionsTablet]}>
                              <Pressable
                                disabled={bet <= 0}
                                onPress={clearBet}
                                style={({ pressed }) => [
                                  styles.clearButton,
                                  bet <= 0 && styles.disabled,
                                  pressed && styles.pressed,
                                ]}
                              >
                                <Text style={styles.clearButtonText}>Clear</Text>
                              </Pressable>
                              <View style={styles.totalBetBadge}>
                                <Text style={[styles.totalBetText, bet >= 10000 && styles.totalBetTextCompact]}>
                                  ${bet}
                                </Text>
                              </View>
                              <Pressable
                                disabled={bet <= 0}
                                onPress={startRound}
                                style={({ pressed }) => [
                                  styles.dealButton,
                                  bet <= 0 && styles.disabled,
                                  pressed && styles.pressed,
                                ]}
                              >
                                <Text style={styles.dealButtonText}>Ready</Text>
                              </Pressable>
                            </View>
                          </>
                      )}
                    </Animated.View>
                  </View>
                  <View
                    pointerEvents={activeTab === "money" ? "auto" : "none"}
                    style={[styles.moneyOverlayClip, isTabletLayout && styles.moneyOverlayClipTablet, { width: tabPanelWidth }]}
                  >
                    <Animated.View
                      style={[
                        styles.moneyOverlay,
                        isTabletLayout && styles.moneyOverlayTablet,
                        { transform: [{ translateX: moneyOverlayTranslateX }] },
                      ]}
                    >
                      <MoneyMachinePanel
                        stored={moneyMachineStored}
                        isTablet={isTabletLayout}
                        moneyMachineScale={moneyMachineScale}
                        capacity={activeMoneyMachineCapacity}
                        tapEarn={activeMoneyMachineTapEarn}
                        passiveEarn={activeMachinePassiveEarn}
                        tapLevel={moneyMachineTapLevel}
                        capacityLevel={moneyMachineCapacityLevel}
                        credit={chips}
                        onCollect={collectMoneyMachine}
                        onTapEarn={tapMoneyMachine}
                        onUpgradeTap={() => upgradeMoneyMachine("tap")}
                        onUpgradeCapacity={() => upgradeMoneyMachine("capacity")}
                      />
                    </Animated.View>
                  </View>
                </View>
                <BottomTabs activeTab={activeTab} isTablet={isTabletLayout} onSelect={selectTab} />
              </>
            ) : resultDelta !== null ? (
              <>
                <BetStack chips={betChips} chipScale={chipScale} isTablet={isTabletLayout} />
                <ResultSplash delta={resultDelta} />
              </>
            ) : outOfCredit ? (
              <View style={styles.creditPanel}>
                <Text style={styles.creditTitle}>Out of credit</Text>
                <Pressable onPress={buyCredit} style={({ pressed }) => [styles.creditButton, pressed && styles.pressed]}>
                  <Text style={styles.creditButtonText}>Get credit</Text>
                </Pressable>
              </View>
            ) : betweenRounds ? (
              <RoundLoader />
            ) : dealing ? (
              <>
                <BetStack chips={betChips} chipScale={chipScale} isTablet={isTabletLayout} />
                <View style={styles.dealingSpace} />
              </>
            ) : (
              <>
                <BetStack chips={betChips} chipScale={chipScale} isTablet={isTabletLayout} />
                <View style={styles.actionRow}>
                  <Pressable
                    disabled={resolvingDealer || dealing}
                    onPress={hit}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.hitButton,
                      (resolvingDealer || dealing) && styles.disabled,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.actionText}>Hit</Text>
                  </Pressable>
                  <Pressable
                    disabled={resolvingDealer || dealing}
                    onPress={stand}
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.standButton,
                      (resolvingDealer || dealing) && styles.disabled,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.actionText}>Stand</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>

          {!showBottomTabs && showBlackjackTable ? (
            <Hand cards={player} isTablet={isTabletLayout} score={shownPlayerScore} showScore={inRound} stacked />
          ) : null}
          {blackjackCelebration && <BlackjackCelebration />}
        </View>

        <Modal
          animationType="fade"
          onRequestClose={closeAccountMenu}
          transparent
          visible={accountMenuOpen}
        >
          <Pressable style={styles.accountModalBackdrop} onPress={closeAccountMenu}>
            <Pressable onPress={() => {}} style={styles.accountPanel}>
              <View style={styles.accountPanelHeader}>
                <Text style={styles.accountPanelTitle}>Accounts</Text>
                <Pressable
                  onPress={closeAccountMenu}
                  style={({ pressed }) => [styles.accountCloseButton, pressed && styles.pressed]}
                >
                  <Text style={styles.accountCloseText}>X</Text>
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.accountList} style={styles.accountListScroll}>
                {accounts.map((account) => {
                  const selected = account.id === activeAccountId;
                  const editing = account.id === editingAccountId;

                  if (editing) {
                    return (
                      <View key={account.id} style={[styles.accountRow, selected && styles.accountRowActive]}>
                        <TextInput
                          autoCapitalize="words"
                          autoCorrect={false}
                          autoFocus
                          maxLength={10}
                          onChangeText={setEditingAccountName}
                          onSubmitEditing={saveAccountName}
                          returnKeyType="done"
                          style={styles.accountRenameInput}
                          value={editingAccountName}
                        />
                        <View style={styles.accountRenameActions}>
                          <Pressable
                            disabled={!editingAccountName.trim()}
                            onPress={saveAccountName}
                            style={({ pressed }) => [
                              styles.accountRenameSave,
                              !editingAccountName.trim() && styles.disabled,
                              pressed && styles.pressed,
                            ]}
                          >
                            <Text style={styles.accountRenameSaveText}>SAVE</Text>
                          </Pressable>
                          <Pressable
                            onPress={cancelRenamingAccount}
                            style={({ pressed }) => [styles.accountRenameCancel, pressed && styles.pressed]}
                          >
                            <Text style={styles.accountRenameCancelText}>X</Text>
                          </Pressable>
                        </View>
                      </View>
                    );
                  }

                  return (
                    <View
                      key={account.id}
                      style={[
                        styles.accountRow,
                        selected && styles.accountRowActive,
                        accountSwitchLocked && !selected && styles.accountRowDisabled,
                      ]}
                    >
                      <Pressable
                        disabled={accountSwitchLocked || selected}
                        onPress={() => switchAccount(account)}
                        style={({ pressed }) => [styles.accountSelectArea, pressed && styles.pressed]}
                      >
                        <View>
                          <Text style={styles.accountName}>{account.name}</Text>
                          <Text style={styles.accountCredit}>${account.credit}</Text>
                        </View>
                      </Pressable>
                      <View style={styles.accountRowActions}>
                        {selected && <Text style={styles.activeAccountText}>ACTIVE</Text>}
                        <Pressable
                          onPress={() => startRenamingAccount(account)}
                          style={({ pressed }) => [styles.accountEditButton, pressed && styles.pressed]}
                        >
                          <Text style={styles.accountEditButtonText}>EDIT</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              {!!accountMenuMessage && <Text style={styles.accountMenuMessage}>{accountMenuMessage}</Text>}

              <Pressable
                disabled={accountSwitchLocked || chips < accountCost || accounts.length >= accountLimit}
                onPress={createAccount}
                style={({ pressed }) => [
                  styles.createAccountButton,
                  (accountSwitchLocked || chips < accountCost || accounts.length >= accountLimit) && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.createAccountButtonText}>New account</Text>
                <Text style={styles.createAccountCost}>
                  {accounts.length >= accountLimit ? "MAX" : `$${accountCost}`}
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        <AchievementsModal
          onClose={() => setAchievementMenuOpen(false)}
          stats={achievementDisplayStats}
          visible={achievementMenuOpen}
        />
          </>
        )}
        </View>

      </View>
      {startupSplashVisible ? (
        <ImageBackground
          fadeDuration={0}
          resizeMode="cover"
          source={APP_SPLASH}
          style={styles.startupSplash}
        />
      ) : null}
    </ImageBackground>
  );
}
