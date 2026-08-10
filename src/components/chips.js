import { View, Text } from "react-native";

import { chipColors, scalePx } from "../core/game";
import { styles } from "../styles/styles";

function Chip({ amount, chipScale = 1, isTablet, small }) {
  const chipSize = scalePx(small ? (isTablet ? 76 : 54) : isTablet ? 82 : 62, chipScale);
  const chipInnerSize = scalePx(small ? (isTablet ? 50 : 36) : isTablet ? 58 : 44, chipScale);
  const stripeLong = scalePx(isTablet ? 16 : 14, chipScale);
  const stripeShort = scalePx(isTablet ? 13 : 11, chipScale);
  const textBaseSize =
    amount === 5000
      ? small
        ? isTablet
          ? 12
          : 9
        : isTablet
          ? 15
          : 12
      : small
        ? isTablet
          ? 15
          : 11
        : isTablet
          ? 18
          : 14;
  const chipDynamicStyle = {
    borderRadius: chipSize / 2,
    height: chipSize,
    width: chipSize,
  };
  const chipInnerDynamicStyle = {
    borderRadius: chipInnerSize / 2,
    height: chipInnerSize,
    width: chipInnerSize,
  };

  return (
    <View
      style={[
        styles.chipOuter,
        isTablet && styles.chipOuterTablet,
        small && styles.chipOuterSmall,
        small && isTablet && styles.chipOuterSmallTablet,
        chipDynamicStyle,
        { backgroundColor: chipColors[amount] },
      ]}
    >
      <View style={[styles.chipStripeTop, isTablet && styles.chipStripeTopTablet, { height: stripeLong, width: stripeShort }]} />
      <View style={[styles.chipStripeRight, isTablet && styles.chipStripeRightTablet, { height: stripeShort, width: stripeLong }]} />
      <View style={[styles.chipStripeBottom, isTablet && styles.chipStripeBottomTablet, { height: stripeLong, width: stripeShort }]} />
      <View style={[styles.chipStripeLeft, isTablet && styles.chipStripeLeftTablet, { height: stripeShort, width: stripeLong }]} />
      <View
        style={[
          styles.chipInner,
          isTablet && styles.chipInnerTablet,
          small && styles.chipInnerSmall,
          small && isTablet && styles.chipInnerSmallTablet,
          chipInnerDynamicStyle,
        ]}
      >
        <Text
          style={[
            styles.chipText,
            isTablet && styles.chipTextTablet,
            small && styles.chipTextSmall,
            small && isTablet && styles.chipTextSmallTablet,
            amount === 5000 && (small ? styles.chipText5000Small : styles.chipText5000),
            amount === 5000 && isTablet && (small ? styles.chipText5000SmallTablet : styles.chipText5000Tablet),
            { fontSize: scalePx(textBaseSize, chipScale) },
          ]}
        >
          {amount}
        </Text>
      </View>
    </View>
  );
}

function BetStack({ chips, chipScale = 1, isTablet }) {
  const visibleChips = chips.slice(-7);
  const stackStep = scalePx(isTablet ? 7 : 6, chipScale);
  const stackNudge = scalePx(isTablet ? 4 : 3, chipScale);

  return (
    <View
      style={[
        styles.betStack,
        isTablet && styles.betStackTablet,
        {
          height: scalePx(isTablet ? 98 : 74, chipScale),
          width: scalePx(isTablet ? 108 : 84, chipScale),
        },
      ]}
    >
      {visibleChips.map((amount, index) => (
        <View
          key={`${amount}-${index}`}
          style={[
            styles.stackedChip,
            {
              bottom: index * stackStep,
              transform: [{ translateX: (index % 2) * stackNudge - stackNudge / 2 }],
            },
          ]}
        >
          <Chip amount={amount} chipScale={chipScale} isTablet={isTablet} small />
        </View>
      ))}
      {chips.length === 0 && (
        <View
          style={[
            styles.emptyBetSpace,
            isTablet && styles.emptyBetSpaceTablet,
            {
              height: scalePx(isTablet ? 80 : 54, chipScale),
              width: scalePx(isTablet ? 80 : 54, chipScale),
            },
          ]}
        />
      )}
    </View>
  );
}

export { BetStack, Chip };
