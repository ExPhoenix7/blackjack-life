import { useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import {
  Animated,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const suits = ["S", "H", "D", "C"];
const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const betOptions = [100, 200, 500, 1000];
const startingChips = 1000;
const firstAccountChips = startingChips;
const accountsStorageKey = "blackjack-accounts-v4";
const settingsStorageKey = "blackjack-settings-v1";
const accountCost = 3000;
const developerCheatChips = [100, 200, 500];
const developerCheatReward = 10000;
const chipColors = {
  100: "#0f9f5a",
  200: "#2563eb",
  500: "#d62828",
  1000: "#f4c430",
};

const CARD_BACK = require("./assets/cards/BACK.png");
const TABLE_FELT = require("./assets/table-felt.png");
const FIRST_SCREEN_BACKGROUND = require("./assets/firstscreenbackground.png");
const SOUND_ON_ICON = require("./assets/sound-on.jpg");
const SOUND_OFF_ICON = require("./assets/sound-off.jpg");
const CARD_DEAL_SOUND = require("./assets/sounds/card-deal.mp3");
const CHIP_PLACE_SOUND = require("./assets/sounds/chip-place.mp3");
const CARD_IMAGES = {
  AS: require("./assets/cards/AS.png"),
  "2S": require("./assets/cards/2S.png"),
  "3S": require("./assets/cards/3S.png"),
  "4S": require("./assets/cards/4S.png"),
  "5S": require("./assets/cards/5S.png"),
  "6S": require("./assets/cards/6S.png"),
  "7S": require("./assets/cards/7S.png"),
  "8S": require("./assets/cards/8S.png"),
  "9S": require("./assets/cards/9S.png"),
  "10S": require("./assets/cards/10S.png"),
  JS: require("./assets/cards/JS.png"),
  QS: require("./assets/cards/QS.png"),
  KS: require("./assets/cards/KS.png"),
  AH: require("./assets/cards/AH.png"),
  "2H": require("./assets/cards/2H.png"),
  "3H": require("./assets/cards/3H.png"),
  "4H": require("./assets/cards/4H.png"),
  "5H": require("./assets/cards/5H.png"),
  "6H": require("./assets/cards/6H.png"),
  "7H": require("./assets/cards/7H.png"),
  "8H": require("./assets/cards/8H.png"),
  "9H": require("./assets/cards/9H.png"),
  "10H": require("./assets/cards/10H.png"),
  JH: require("./assets/cards/JH.png"),
  QH: require("./assets/cards/QH.png"),
  KH: require("./assets/cards/KH.png"),
  AD: require("./assets/cards/AD.png"),
  "2D": require("./assets/cards/2D.png"),
  "3D": require("./assets/cards/3D.png"),
  "4D": require("./assets/cards/4D.png"),
  "5D": require("./assets/cards/5D.png"),
  "6D": require("./assets/cards/6D.png"),
  "7D": require("./assets/cards/7D.png"),
  "8D": require("./assets/cards/8D.png"),
  "9D": require("./assets/cards/9D.png"),
  "10D": require("./assets/cards/10D.png"),
  JD: require("./assets/cards/JD.png"),
  QD: require("./assets/cards/QD.png"),
  KD: require("./assets/cards/KD.png"),
  AC: require("./assets/cards/AC.png"),
  "2C": require("./assets/cards/2C.png"),
  "3C": require("./assets/cards/3C.png"),
  "4C": require("./assets/cards/4C.png"),
  "5C": require("./assets/cards/5C.png"),
  "6C": require("./assets/cards/6C.png"),
  "7C": require("./assets/cards/7C.png"),
  "8C": require("./assets/cards/8C.png"),
  "9C": require("./assets/cards/9C.png"),
  "10C": require("./assets/cards/10C.png"),
  JC: require("./assets/cards/JC.png"),
  QC: require("./assets/cards/QC.png"),
  KC: require("./assets/cards/KC.png"),
};

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

function Chip({ amount, small }) {
  return (
    <View
      style={[
        styles.chipOuter,
        small && styles.chipOuterSmall,
        { backgroundColor: chipColors[amount] },
      ]}
    >
      <View style={styles.chipStripeTop} />
      <View style={styles.chipStripeRight} />
      <View style={styles.chipStripeBottom} />
      <View style={styles.chipStripeLeft} />
      <View style={[styles.chipInner, small && styles.chipInnerSmall]}>
        <Text style={[styles.chipText, small && styles.chipTextSmall]}>
          {amount}
        </Text>
      </View>
    </View>
  );
}

function BetStack({ chips }) {
  const visibleChips = chips.slice(-7);

  return (
    <View style={styles.betStack}>
      {visibleChips.map((amount, index) => (
        <View
          key={`${amount}-${index}`}
          style={[
            styles.stackedChip,
            {
              bottom: index * 7,
              transform: [{ translateX: (index % 2) * 4 - 2 }],
            },
          ]}
        >
          <Chip amount={amount} small />
        </View>
      ))}
      {chips.length === 0 && <View style={styles.emptyBetSpace} />}
    </View>
  );
}

function DeckShoe({ onPress, onTouchStart }) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      onTouchStart={onTouchStart}
      style={({ pressed }) => [styles.deckShoe, pressed && onPress && styles.deckShoePressed]}
    >
      {[0, 1, 2].map((offset) => (
        <View
          key={offset}
          style={[
            styles.deckCard,
            {
              right: offset * 4,
              top: offset * 3,
            },
          ]}
        >
          <Image resizeMode="stretch" source={CARD_BACK} style={styles.deckCardImage} />
        </View>
      ))}
    </Pressable>
  );
}

function RoundLoader() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );

    animation.start();
    return () => animation.stop();
  }, [spin]);

  return (
    <View style={styles.roundLoader}>
      <Text style={styles.roundLoaderText}>new round starting</Text>
      <View style={styles.loaderCircle}>
        <Animated.View
          style={[
            styles.loaderRing,
            {
              transform: [
                {
                  rotate: spin.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

function ResultSplash({ delta }) {
  const pop = useRef(new Animated.Value(0)).current;
  const won = delta > 0;
  const lost = delta < 0;

  useEffect(() => {
    pop.setValue(0);
    Animated.spring(pop, {
      toValue: 1,
      friction: 7,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [pop, delta]);

  return (
    <Animated.View
      style={[
        styles.resultSplash,
        {
          opacity: pop,
          transform: [
            { translateY: pop.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
            { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.84, 1] }) },
          ],
        },
      ]}
    >
      <Text style={[styles.resultAmount, won && styles.resultWin, lost && styles.resultLoss]}>
        {won ? "+" : lost ? "-" : ""}${Math.abs(delta)}
      </Text>
      <Text style={styles.resultLabel}>{won ? "Win" : lost ? "Loss" : "Push"}</Text>
    </Animated.View>
  );
}

function BlackjackCelebration() {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entrance.setValue(0);
    const animation = Animated.sequence([
      Animated.spring(entrance, {
        friction: 7,
        tension: 72,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.delay(520),
      Animated.timing(entrance, {
        duration: 240,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [entrance]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blackjackCelebration,
        {
          opacity: entrance,
          transform: [
            { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) },
            { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          ],
        },
      ]}
    >
      <View style={styles.blackjackCelebrationLine} />
      <Text style={styles.blackjackCelebrationText}>BLACKJACK!</Text>
      <Text style={styles.blackjackCelebrationSuits}>♠  ♥  ♦  ♣</Text>
      <View style={styles.blackjackCelebrationLine} />
    </Animated.View>
  );
}

function CreditDelta({ amount, onDone }) {
  const move = useRef(new Animated.Value(0)).current;
  const positive = amount > 0;

  useEffect(() => {
    move.setValue(0);
    const animation = Animated.timing(move, {
      toValue: 1,
      duration: 850,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) {
        onDone();
      }
    });

    return () => animation.stop();
  }, [amount, move]);

  return (
    <Animated.Text
      style={[
        styles.creditDelta,
        positive ? styles.creditDeltaPositive : styles.creditDeltaNegative,
        {
          opacity: move.interpolate({ inputRange: [0, 0.72, 1], outputRange: [1, 1, 0] }),
          transform: [
            { translateY: move.interpolate({ inputRange: [0, 1], outputRange: [16, -12] }) },
            { scale: move.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] }) },
          ],
        },
      ]}
    >
      {positive ? "+" : "-"}${Math.abs(amount)}
    </Animated.Text>
  );
}

function AnimatedPlayButton({ onPress }) {
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    entrance.setValue(0);
    const animation = Animated.timing(entrance, {
      delay: 1000,
      duration: 450,
      toValue: 1,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [entrance]);

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [
          { translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          { scale: entrance.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) },
        ],
      }}
    >
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        <View style={styles.playButtonOuter}>
          <View style={styles.playButtonInner}>
            <Text style={styles.playButtonText}>PLAY</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Card({ card, hidden, index, compact, fast }) {
  const animated = useRef(new Animated.Value(0)).current;
  const rotation = `${index - 1}deg`;
  const cardSource = hidden ? CARD_BACK : CARD_IMAGES[`${card.rank}${card.suit}`];
  const animatedStyle = {
    opacity: animated,
    transform: [
      { translateX: animated.interpolate({ inputRange: [0, 1], outputRange: [-58, 0] }) },
      { translateY: animated.interpolate({ inputRange: [0, 1], outputRange: [-26, 0] }) },
      { scale: animated.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) },
      {
        rotate: animated.interpolate({
          inputRange: [0, 1],
          outputRange: [`${index % 2 === 0 ? -18 : 18}deg`, rotation],
        }),
      },
    ],
  };

  useEffect(() => {
    animated.setValue(0);
    Animated.spring(animated, {
      toValue: 1,
      delay: fast ? 0 : index * 260,
      friction: fast ? 9 : 12,
      tension: fast ? 70 : 32,
      useNativeDriver: true,
    }).start();
  }, [animated, card.rank, card.suit, hidden, index, fast]);

  return (
    <Animated.Image
      resizeMode="stretch"
      source={cardSource}
      style={[styles.card, compact && styles.compactCard, animatedStyle]}
    />
  );
}

function Hand({ cards, score, hideDealer, onDeckPress, onDeckTouchStart, showDeck, showScore, stacked, compactStack }) {
  const slotOffset = compactStack ? 38 : 54;
  const stackWidth = compactStack
    ? Math.max(202, 82 + Math.max(cards.length - 1, 0) * slotOffset)
    : Math.max(178, 94 + Math.max(cards.length - 1, 0) * slotOffset);

  return (
    <View style={styles.hand}>
      <View style={styles.handHeader}>
        {showScore && <Text style={styles.score}>{hideDealer ? "?" : score}</Text>}
      </View>
      <View style={styles.dealerRow}>
        {showDeck && <DeckShoe onPress={onDeckPress} onTouchStart={onDeckTouchStart} />}
        <View style={stacked ? [styles.stackedCards, { width: stackWidth }] : styles.cards}>
          {cards.map((card, index) => (
            <View
              key={`${card.rank}-${card.suit}-${index}`}
              style={stacked && [styles.stackedCardSlot, { left: index * slotOffset, zIndex: index + 1 }]}
            >
              <Card
                card={card}
                hidden={hideDealer && index === 1}
                index={index}
                compact={compactStack}
                fast={!compactStack && index > 1}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function App() {
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
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [hasChosenFirstAccountName, setHasChosenFirstAccountName] = useState(false);
  const [firstAccountName, setFirstAccountName] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [accountMenuMessage, setAccountMenuMessage] = useState("");
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editingAccountName, setEditingAccountName] = useState("");
  const [creditResetOpen, setCreditResetOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [blackjackCelebration, setBlackjackCelebration] = useState(false);
  const resultTimer = useRef(null);
  const nextRoundTimer = useRef(null);
  const developerCheatStep = useRef(0);
  const developerDeckTaps = useRef(0);
  const cardSoundPlayer = useAudioPlayer(CARD_DEAL_SOUND);
  const chipSoundPlayer = useAudioPlayer(CHIP_PLACE_SOUND);

  const playerScore = useMemo(() => handValue(player), [player]);
  const dealerScore = useMemo(() => handValue(dealer), [dealer]);
  const activeAccount = accounts.find((account) => account.id === activeAccountId);
  const accountSwitchLocked =
    inRound || dealing || resolvingDealer || betweenRounds || resultDelta !== null || creditDelta !== null;

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
        let loadedAccounts = [];
        let loadedActiveId = null;
        let loadedHasChosenName = false;

        if (savedAccounts !== null) {
          const parsedSave = JSON.parse(savedAccounts);
          loadedHasChosenName = parsedSave.hasChosenFirstAccountName === true;
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
          loadedAccounts = [{ id: "account-1", name: "Account 1", credit: firstAccountChips }];
          loadedActiveId = "account-1";
        }

        const selectedAccount =
          loadedAccounts.find((account) => account.id === loadedActiveId) || loadedAccounts[0];

        if (active) {
          setAccounts(loadedAccounts);
          setActiveAccountId(selectedAccount.id);
          setChips(selectedAccount.credit);
          setOutOfCredit(selectedAccount.credit <= 0);
          setHasChosenFirstAccountName(loadedHasChosenName);
        }
      } catch {
        const fallbackAccount = { id: "account-1", name: "Account 1", credit: firstAccountChips };
        if (active) {
          setAccounts([fallbackAccount]);
          setActiveAccountId(fallbackAccount.id);
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
        JSON.stringify({ accounts, activeAccountId, hasChosenFirstAccountName })
      );
    }
  }, [accounts, activeAccountId, accountsLoaded, hasChosenFirstAccountName]);

  useEffect(() => {
    return () => {
      if (nextRoundTimer.current) {
        clearTimeout(nextRoundTimer.current);
      }
      if (resultTimer.current) {
        clearTimeout(resultTimer.current);
      }
    };
  }, []);

  function saveActiveAccountCredit(nextCredit) {
    setAccounts((current) =>
      current.map((account) => (account.id === activeAccountId ? { ...account, credit: nextCredit } : account))
    );
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

  function resetActiveCredit() {
    resetTable();
    setChips(startingChips);
    saveActiveAccountCredit(startingChips);
    setOutOfCredit(false);
    setCreditResetOpen(false);
  }

  function finishRound(text, payout, options = {}) {
    const { showResultSplash = true } = options;
    const delta = payout - bet;
    const nextChips = chips + delta;
    saveActiveAccountCredit(nextChips);

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
      finishRound("Blackjack!", Math.floor(bet * 2.5), { showResultSplash: false });
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

  if (!gameStarted) {
    return (
      <ImageBackground
        defaultSource={FIRST_SCREEN_BACKGROUND}
        fadeDuration={0}
        resizeMode="cover"
        source={FIRST_SCREEN_BACKGROUND}
        style={styles.startScreen}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <SafeAreaView style={styles.startScreenSafeArea}>
          <View style={styles.startScreenControls}>
            {accountsLoaded &&
              (!hasChosenFirstAccountName ? (
                <View style={styles.startNameEntry}>
                  <View style={styles.startNameInputOuter}>
                    <TextInput
                      autoCapitalize="words"
                      autoCorrect={false}
                      maxLength={10}
                      onChangeText={setFirstAccountName}
                      onSubmitEditing={saveFirstAccountName}
                      placeholder="ENTER YOUR NAME"
                      placeholderTextColor="rgba(255,255,255,0.64)"
                      returnKeyType="done"
                      style={styles.startNameInput}
                      value={firstAccountName}
                    />
                  </View>
                  <Pressable
                    disabled={!firstAccountName.trim()}
                    onPress={saveFirstAccountName}
                    style={({ pressed }) => [
                      styles.startNameConfirmButton,
                      !firstAccountName.trim() && styles.startNameConfirmButtonDisabled,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.startNameConfirmText}>CONFIRM</Text>
                  </Pressable>
                </View>
              ) : (
                <AnimatedPlayButton onPress={() => setGameStarted(true)} />
              ))}
          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground resizeMode="cover" source={TABLE_FELT} style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <View onTouchStart={resetDeveloperCheat} style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerLeftSlot} />
          <Pressable
            onPress={() => setSettingsOpen(true)}
            style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
          >
            <Text style={styles.settingsIcon}>⚙︎</Text>
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
                disabled={accountSwitchLocked}
                onPress={() => setCreditResetOpen(true)}
                style={({ pressed }) => [
                  styles.creditResetIconButton,
                  accountSwitchLocked && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.creditResetIcon}>↻</Text>
              </Pressable>
              <Pressable
                onPress={handleDeveloperCreditPress}
                onTouchStart={stopDeveloperTouchPropagation}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <Text style={styles.walletLabel}>Credit</Text>
              </Pressable>
            </View>
            <Text style={styles.walletValue}>{chips}</Text>
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

        <View style={styles.table}>
          <Hand
            cards={dealer}
            score={shownDealerScore}
            hideDealer={inRound && !revealDealer}
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

          <View style={styles.centerControls}>
            <Text style={styles.message}>{message}</Text>
            <BetStack chips={betChips} />

            {resultDelta !== null ? (
              <ResultSplash delta={resultDelta} />
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
              <View style={styles.dealingSpace} />
            ) : !inRound ? (
              <>
                <View style={styles.betRow}>
                  {betOptions.map((amount, index) => (
                    <Pressable
                      key={amount}
                      onPress={() => addBetChip(amount)}
                      onTouchStart={stopDeveloperTouchPropagation}
                      style={({ pressed }) => [
                        styles.chipButton,
                        styles[`chipButton${index}`],
                        pressed && styles.pressed,
                      ]}
                    >
                      <Chip amount={amount} />
                    </Pressable>
                  ))}
                </View>
                <View style={styles.betActions}>
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
            ) : (
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
            )}
          </View>

          <Hand cards={player} score={shownPlayerScore} showScore={inRound} stacked />
          {blackjackCelebration && <BlackjackCelebration />}
        </View>
        </View>

        <Modal
          animationType="fade"
          onRequestClose={() => setSettingsOpen(false)}
          transparent
          visible={settingsOpen}
        >
          <Pressable style={styles.settingsBackdrop} onPress={() => setSettingsOpen(false)}>
            <Pressable onPress={() => {}} style={styles.settingsPanel}>
              <Pressable
                onPress={() => setSoundEnabled((current) => !current)}
                style={({ pressed }) => [styles.soundToggleButton, pressed && styles.pressed]}
              >
                <Image
                  resizeMode="contain"
                  source={soundEnabled ? SOUND_ON_ICON : SOUND_OFF_ICON}
                  style={styles.soundToggleIcon}
                />
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          animationType="fade"
          onRequestClose={() => setCreditResetOpen(false)}
          transparent
          visible={creditResetOpen}
        >
          <View style={styles.creditResetBackdrop}>
            <View style={styles.creditResetPanel}>
              <Text style={styles.creditResetTitle}>Reset credit?</Text>
              <Text style={styles.creditResetMessage}>Set this account's credit to $1000?</Text>
              <View style={styles.creditResetActions}>
                <Pressable
                  onPress={() => setCreditResetOpen(false)}
                  style={({ pressed }) => [styles.creditResetCancel, pressed && styles.pressed]}
                >
                  <Text style={styles.creditResetCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={resetActiveCredit}
                  style={({ pressed }) => [styles.creditResetConfirm, pressed && styles.pressed]}
                >
                  <Text style={styles.creditResetConfirmText}>Reset</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

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
                disabled={accountSwitchLocked || chips < accountCost}
                onPress={createAccount}
                style={({ pressed }) => [
                  styles.createAccountButton,
                  (accountSwitchLocked || chips < accountCost) && styles.disabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.createAccountButtonText}>New account</Text>
                <Text style={styles.createAccountCost}>${accountCost}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  startScreen: {
    backgroundColor: "#031f09",
    flex: 1,
  },
  startScreenSafeArea: {
    flex: 1,
  },
  startScreenControls: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  startNameEntry: {
    alignItems: "center",
    gap: 14,
  },
  startNameInputOuter: {
    borderColor: "#35ff20",
    borderRadius: 8,
    borderWidth: 2,
    height: 76,
    padding: 4,
    shadowColor: "#35ff20",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 10,
    width: 270,
  },
  startNameInput: {
    backgroundColor: "rgba(0,16,5,0.7)",
    borderColor: "#35ff20",
    borderRadius: 5,
    borderWidth: 2,
    color: "#ffffff",
    fontSize: 18,
    flex: 1,
    fontWeight: "900",
    paddingHorizontal: 16,
    textAlign: "center",
  },
  startNameConfirmButton: {
    alignItems: "center",
    backgroundColor: "rgba(0,16,5,0.72)",
    borderColor: "#35ff20",
    borderRadius: 7,
    borderWidth: 2,
    height: 50,
    justifyContent: "center",
    shadowColor: "#35ff20",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    width: 180,
  },
  startNameConfirmButtonDisabled: {
    opacity: 0.36,
  },
  startNameConfirmText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
    textShadowColor: "#35ff20",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 7,
  },
  playButtonOuter: {
    borderColor: "#35ff20",
    borderRadius: 8,
    borderWidth: 2,
    height: 76,
    padding: 4,
    shadowColor: "#35ff20",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 10,
    width: 270,
  },
  playButtonInner: {
    alignItems: "center",
    backgroundColor: "rgba(0,16,5,0.68)",
    borderColor: "#35ff20",
    borderRadius: 5,
    borderWidth: 2,
    flex: 1,
    justifyContent: "center",
  },
  playButtonText: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    textShadowColor: "#35ff20",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  background: {
    backgroundColor: "#095c39",
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  screen: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 104,
    position: "relative",
  },
  headerLeftSlot: {
    width: 44,
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: "transparent",
    height: 44,
    justifyContent: "center",
    left: "50%",
    marginLeft: -22,
    position: "absolute",
    top: 0,
    width: 44,
  },
  settingsIcon: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 34,
  },
  settingsBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.52)",
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 86,
  },
  settingsPanel: {
    alignItems: "center",
    backgroundColor: "#f7f9f4",
    borderColor: "#111111",
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 96,
    padding: 16,
    width: 120,
  },
  soundToggleButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderColor: "#111111",
    borderWidth: 2,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  soundToggleIcon: {
    height: 46,
    width: 46,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 2,
  },
  accountMenuButton: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.24)",
    borderRadius: 7,
    flexDirection: "row",
    gap: 6,
    maxWidth: 126,
    minHeight: 34,
    paddingHorizontal: 9,
  },
  menuIcon: {
    gap: 3,
    width: 15,
  },
  menuIconLine: {
    backgroundColor: "#ffffff",
    borderRadius: 2,
    height: 2,
    width: 15,
  },
  accountMenuButtonText: {
    color: "#ffffff",
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "900",
  },
  accountModalBackdrop: {
    backgroundColor: "rgba(0,0,0,0.58)",
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 58,
  },
  accountPanel: {
    alignSelf: "flex-end",
    backgroundColor: "#f7f9f4",
    borderColor: "#111111",
    borderRadius: 8,
    borderWidth: 2,
    maxHeight: "78%",
    padding: 14,
    width: 310,
  },
  accountPanelHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  accountPanelTitle: {
    color: "#17201d",
    fontSize: 22,
    fontWeight: "900",
  },
  accountCloseButton: {
    alignItems: "center",
    backgroundColor: "#d63d3d",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  accountCloseText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  accountListScroll: {
    maxHeight: 360,
  },
  accountList: {
    gap: 8,
  },
  accountRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#cbd5cf",
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  accountSelectArea: {
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  accountRowActions: {
    alignItems: "flex-end",
    gap: 6,
  },
  accountEditButton: {
    alignItems: "center",
    backgroundColor: "#17201d",
    borderRadius: 6,
    justifyContent: "center",
    minHeight: 28,
    minWidth: 48,
    paddingHorizontal: 8,
  },
  accountEditButtonText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
  },
  accountRenameInput: {
    backgroundColor: "#ffffff",
    borderColor: "#0f9f5a",
    borderRadius: 6,
    borderWidth: 2,
    color: "#17201d",
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    minHeight: 42,
    paddingHorizontal: 9,
  },
  accountRenameActions: {
    flexDirection: "row",
    gap: 6,
    marginLeft: 8,
  },
  accountRenameSave: {
    alignItems: "center",
    backgroundColor: "#0f9f5a",
    borderRadius: 6,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 9,
  },
  accountRenameSaveText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900",
  },
  accountRenameCancel: {
    alignItems: "center",
    backgroundColor: "#d63d3d",
    borderRadius: 6,
    justifyContent: "center",
    minHeight: 36,
    width: 32,
  },
  accountRenameCancelText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  accountRowActive: {
    backgroundColor: "#e6fff0",
    borderColor: "#0f9f5a",
  },
  accountRowDisabled: {
    opacity: 0.52,
  },
  accountName: {
    color: "#17201d",
    fontSize: 16,
    fontWeight: "900",
  },
  accountCredit: {
    color: "#68746f",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  activeAccountText: {
    color: "#0b7c45",
    fontSize: 11,
    fontWeight: "900",
  },
  accountMenuMessage: {
    color: "#b32626",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
    textAlign: "center",
  },
  createAccountButton: {
    alignItems: "center",
    backgroundColor: "#fff07a",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  createAccountButtonText: {
    color: "#17201d",
    fontSize: 16,
    fontWeight: "900",
  },
  createAccountCost: {
    color: "#17201d",
    fontSize: 15,
    fontWeight: "900",
  },
  wallet: {
    alignItems: "flex-end",
    paddingVertical: 6,
    position: "relative",
  },
  walletLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  creditResetIconButton: {
    alignItems: "center",
    height: 18,
    justifyContent: "center",
    width: 18,
  },
  creditResetIcon: {
    color: "#d6ffe7",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 17,
  },
  walletLabel: {
    color: "#d6ffe7",
    fontSize: 12,
    fontWeight: "800",
  },
  walletValue: {
    color: "#fff07a",
    fontSize: 24,
    fontWeight: "900",
  },
  creditDelta: {
    fontSize: 14,
    fontWeight: "900",
    position: "absolute",
    right: 0,
    top: 38,
  },
  creditResetBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.64)",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  creditResetPanel: {
    backgroundColor: "#f7f9f4",
    borderColor: "#111111",
    borderRadius: 8,
    borderWidth: 2,
    gap: 10,
    maxWidth: 340,
    padding: 18,
    width: "100%",
  },
  creditResetTitle: {
    color: "#17201d",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  creditResetMessage: {
    color: "#53605a",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  creditResetActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  creditResetCancel: {
    alignItems: "center",
    backgroundColor: "#d8dedb",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  creditResetCancelText: {
    color: "#17201d",
    fontSize: 15,
    fontWeight: "900",
  },
  creditResetConfirm: {
    alignItems: "center",
    backgroundColor: "#d63d3d",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  creditResetConfirmText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  creditDeltaPositive: {
    color: "#fff07a",
  },
  creditDeltaNegative: {
    color: "#ffdddd",
  },
  blackjackCelebration: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.72)",
    borderColor: "#fff07a",
    borderRadius: 8,
    borderWidth: 2,
    left: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    position: "absolute",
    right: 18,
    top: "40%",
    zIndex: 20,
  },
  blackjackCelebrationLine: {
    backgroundColor: "#fff07a",
    height: 2,
    width: "84%",
  },
  blackjackCelebrationText: {
    color: "#fff07a",
    fontSize: 34,
    fontWeight: "900",
    marginVertical: 7,
    textShadowColor: "rgba(255,240,122,0.45)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 9,
  },
  blackjackCelebrationSuits: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 7,
  },
  table: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  hand: {
    alignItems: "center",
    minHeight: 198,
  },
  handHeader: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    minHeight: 34,
  },
  score: {
    minWidth: 42,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.2)",
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },
  dealerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 112,
  },
  deckShoe: {
    height: 113,
    position: "relative",
    width: 72,
  },
  deckShoePressed: {
    opacity: 0.92,
  },
  deckCard: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "#111111",
    borderRadius: 8,
    borderWidth: 2,
    height: 113,
    justifyContent: "center",
    position: "absolute",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    width: 72,
    elevation: 6,
  },
  deckCardImage: {
    borderRadius: 8,
    height: "100%",
    width: "100%",
  },
  deckCardPattern: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(0,0,0,0.24)",
    borderRadius: 6,
    borderWidth: 2,
    height: 58,
    width: 36,
  },
  cards: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    maxWidth: 300,
  },
  stackedCards: {
    height: 147,
    position: "relative",
  },
  stackedCardSlot: {
    position: "absolute",
    top: 0,
  },
  card: {
    width: 94,
    height: 147,
    overflow: "hidden",
    borderColor: "#111111",
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: "transparent",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 6,
  },
  compactCard: {
    width: 82,
    height: 128,
  },
  cardBack: {
    borderColor: "#fff8ec",
    borderWidth: 4,
    backgroundColor: "#8d1f2d",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBackPattern: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderColor: "rgba(0,0,0,0.24)",
    borderRadius: 6,
    borderWidth: 2,
    height: "72%",
    justifyContent: "center",
    width: "64%",
  },
  cardBackPatternInner: {
    borderColor: "rgba(255,255,255,0.42)",
    borderRadius: 4,
    borderWidth: 2,
    height: 42,
    width: 24,
  },
  cardFaceLine: {
    borderColor: "rgba(0,0,0,0.12)",
    borderRadius: 5,
    borderWidth: 1,
    bottom: 5,
    left: 5,
    position: "absolute",
    right: 5,
    top: 5,
  },
  cardTopCorner: {
    alignItems: "center",
    left: 8,
    position: "absolute",
    top: 8,
    width: 22,
  },
  cardRank: {
    color: "#17201d",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 20,
  },
  cardCornerSuit: {
    color: "#17201d",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 14,
  },
  compactCardRank: {
    fontSize: 18,
    lineHeight: 18,
  },
  compactCornerSuit: {
    fontSize: 12,
    lineHeight: 12,
  },
  cardSuit: {
    color: "#17201d",
    fontSize: 38,
    fontWeight: "900",
    left: 0,
    lineHeight: 42,
    position: "absolute",
    right: 0,
    textAlign: "center",
    top: 36,
  },
  compactCardSuit: {
    fontSize: 32,
    lineHeight: 36,
    top: 34,
  },
  cardBottomCorner: {
    alignItems: "center",
    bottom: 8,
    position: "absolute",
    right: 8,
    transform: [{ rotate: "180deg" }],
    width: 22,
  },
  redCard: {
    color: "#d54848",
  },
  centerControls: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 190,
  },
  message: {
    minHeight: 24,
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
    textAlign: "center",
  },
  betStack: {
    alignItems: "center",
    height: 86,
    justifyContent: "flex-end",
    marginBottom: 12,
    width: 96,
  },
  stackedChip: {
    position: "absolute",
  },
  emptyBetSpace: {
    height: 68,
    width: 68,
  },
  betRow: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    marginBottom: 2,
    minHeight: 92,
  },
  chipButton: {
    borderRadius: 38,
  },
  chipButton0: {
    transform: [{ translateY: 18 }, { rotate: "-10deg" }],
  },
  chipButton1: {
    transform: [{ translateY: -8 }, { rotate: "-4deg" }],
  },
  chipButton2: {
    transform: [{ translateY: -8 }, { rotate: "4deg" }],
  },
  chipButton3: {
    transform: [{ translateY: 18 }, { rotate: "10deg" }],
  },
  chipOuter: {
    alignItems: "center",
    borderColor: "#111111",
    borderRadius: 38,
    borderWidth: 3,
    height: 70,
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.28,
    shadowRadius: 7,
    width: 70,
    elevation: 7,
  },
  chipOuterSmall: {
    borderRadius: 34,
    height: 68,
    width: 68,
  },
  chipInner: {
    alignItems: "center",
    backgroundColor: "#f7f9f4",
    borderColor: "#0f2019",
    borderRadius: 25,
    borderWidth: 2,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  chipInnerSmall: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  chipStripeTop: {
    backgroundColor: "#ffffff",
    height: 16,
    position: "absolute",
    top: -1,
    width: 13,
  },
  chipStripeRight: {
    backgroundColor: "#ffffff",
    height: 13,
    position: "absolute",
    right: -1,
    width: 16,
  },
  chipStripeBottom: {
    backgroundColor: "#ffffff",
    bottom: -1,
    height: 16,
    position: "absolute",
    width: 13,
  },
  chipStripeLeft: {
    backgroundColor: "#ffffff",
    height: 13,
    left: -1,
    position: "absolute",
    width: 16,
  },
  chipText: {
    color: "#111111",
    fontSize: 16,
    fontWeight: "900",
  },
  chipTextSmall: {
    fontSize: 14,
  },
  betActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  dealButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 104,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: "#fff07a",
  },
  dealButtonText: {
    color: "#17201d",
    fontSize: 17,
    fontWeight: "900",
  },
  clearButton: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 104,
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.24)",
  },
  clearButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "900",
  },
  totalBetBadge: {
    alignItems: "center",
    backgroundColor: "#21d9d0",
    borderRadius: 34,
    height: 68,
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.18,
    shadowRadius: 7,
    width: 68,
    elevation: 6,
  },
  totalBetText: {
    color: "#063226",
    fontSize: 18,
    fontWeight: "900",
  },
  totalBetTextCompact: {
    fontSize: 14,
  },
  roundLoader: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 118,
  },
  roundLoaderText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 14,
    textTransform: "lowercase",
  },
  loaderCircle: {
    alignItems: "center",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  loaderRing: {
    borderColor: "rgba(255,255,255,0.35)",
    borderRadius: 26,
    borderTopColor: "#ffffff",
    borderWidth: 6,
    height: 52,
    width: 52,
  },
  creditPanel: {
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    minHeight: 120,
  },
  creditTitle: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },
  creditButton: {
    alignItems: "center",
    backgroundColor: "#fff07a",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 54,
    minWidth: 150,
  },
  creditButtonText: {
    color: "#17201d",
    fontSize: 17,
    fontWeight: "900",
  },
  resultSplash: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 122,
  },
  resultAmount: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.24)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  resultWin: {
    color: "#fff07a",
  },
  resultLoss: {
    color: "#ffdddd",
  },
  resultLabel: {
    color: "#eafff3",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 4,
    textTransform: "uppercase",
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
  },
  dealingSpace: {
    minHeight: 80,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
    minWidth: 130,
    borderRadius: 8,
  },
  hitButton: {
    backgroundColor: "#0fce68",
  },
  standButton: {
    backgroundColor: "#d63d3d",
  },
  actionText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.82,
  },
});
