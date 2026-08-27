import { useEffect, useRef } from "react";
import { Animated, Image, Platform, Pressable, Text, View } from "react-native";

import { CARD_BACK, CARD_IMAGES } from "../core/game";
import { styles } from "../styles/styles";

function DeckShoe({ isTablet, onPress, onTouchStart }) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      onTouchStart={onTouchStart}
      style={({ pressed }) => [
        styles.deckShoe,
        isTablet && styles.deckShoeTablet,
        pressed && onPress && styles.deckShoePressed,
      ]}
    >
      {[0, 1, 2].map((offset) => (
        <View
          key={offset}
          style={[
            styles.deckCard,
            isTablet && styles.deckCardTablet,
            {
              right: offset * 4,
              top: offset * 3,
            },
          ]}
        >
          <Image fadeDuration={0} resizeMode="stretch" source={CARD_BACK} style={styles.deckCardImage} />
        </View>
      ))}
    </Pressable>
  );
}

function Card({ card, hidden, index, compact, fast, isTablet }) {
  const animated = useRef(new Animated.Value(0)).current;
  const revealProgress = useRef(new Animated.Value(hidden ? 0 : 1)).current;
  const previousHidden = useRef(hidden);
  const rotation = `${index - 1}deg`;
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
  const revealScale = revealProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.04, 1],
  });
  const cardBackStyle = {
    opacity: revealProgress.interpolate({
      inputRange: [0, 0.49, 0.5, 1],
      outputRange: [1, 1, 0, 0],
    }),
    transform: [{ scaleX: revealScale }],
  };
  const cardFaceStyle = {
    opacity: revealProgress.interpolate({
      inputRange: [0, 0.5, 0.51, 1],
      outputRange: [0, 0, 1, 1],
    }),
    transform: [{ scaleX: revealScale }],
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
  }, [animated, card.rank, card.suit, index, fast]);

  useEffect(() => {
    const wasHidden = previousHidden.current;
    previousHidden.current = hidden;
    revealProgress.stopAnimation();

    if (hidden) {
      revealProgress.setValue(0);
      return undefined;
    }

    if (!wasHidden) {
      revealProgress.setValue(1);
      return undefined;
    }

    animated.stopAnimation();
    animated.setValue(1);
    Animated.timing(revealProgress, {
      toValue: 1,
      duration: 240,
      useNativeDriver: Platform.OS !== "ios",
    }).start();

    return () => revealProgress.stopAnimation();
  }, [animated, hidden, revealProgress]);

  return (
    <Animated.View
      style={[
        styles.card,
        isTablet && styles.cardTablet,
        compact && styles.compactCard,
        compact && isTablet && styles.compactCardTablet,
        animatedStyle,
      ]}
    >
      <Animated.Image
        fadeDuration={0}
        resizeMode="stretch"
        source={CARD_BACK}
        style={[styles.cardImage, cardBackStyle]}
      />
      <Animated.Image
        fadeDuration={0}
        resizeMode="stretch"
        source={CARD_IMAGES[`${card.rank}${card.suit}`]}
        style={[styles.cardImage, cardFaceStyle]}
      />
    </Animated.View>
  );
}

function Hand({
  cards,
  score,
  hideDealer,
  isTablet,
  onDeckPress,
  onDeckTouchStart,
  showDeck,
  showScore,
  stacked,
  compactStack,
}) {
  const slotOffset = compactStack ? (isTablet ? 46 : 38) : isTablet ? 64 : 54;
  const cardBaseWidth = compactStack ? (isTablet ? 94 : 82) : isTablet ? 108 : 94;
  const stackWidth = compactStack
    ? Math.max(isTablet ? 236 : 202, cardBaseWidth + Math.max(cards.length - 1, 0) * slotOffset)
    : Math.max(isTablet ? 210 : 178, cardBaseWidth + Math.max(cards.length - 1, 0) * slotOffset);

  return (
    <View style={[styles.hand, isTablet && styles.handTablet]}>
      <View style={styles.handHeader}>
        {showScore && (
          <Text style={[styles.score, isTablet && styles.scoreTablet]}>{hideDealer ? "?" : score}</Text>
        )}
      </View>
      <View style={[styles.dealerRow, isTablet && styles.dealerRowTablet]}>
        {showDeck && <DeckShoe isTablet={isTablet} onPress={onDeckPress} onTouchStart={onDeckTouchStart} />}
        <View
          style={
            stacked
              ? [styles.stackedCards, isTablet && styles.stackedCardsTablet, { width: stackWidth }]
              : styles.cards
          }
        >
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
                isTablet={isTablet}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export { Card, DeckShoe, Hand };
