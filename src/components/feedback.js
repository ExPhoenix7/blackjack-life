import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

import { styles } from "../styles/styles";

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
  const onDoneRef = useRef(onDone);
  const positive = amount > 0;

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    move.setValue(0);
    const animation = Animated.timing(move, {
      toValue: 1,
      duration: 850,
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished) {
        onDoneRef.current();
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

export { BlackjackCelebration, CreditDelta, ResultSplash, RoundLoader };
