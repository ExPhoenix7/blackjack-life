import { View, Text } from "react-native";

import { chipColors, scalePx } from "../core/game";
import { styles } from "../styles/styles";

const CHIP_TEXT_SIZES = {
  default: {
    normal: { phone: 14, tablet: 18 },
    small: { phone: 11, tablet: 15 },
  },
  wide: {
    normal: { phone: 12, tablet: 15 },
    small: { phone: 9, tablet: 12 },
  },
};

function getChipTextBaseSize(amount, small, isTablet) {
  const sizeGroup = amount >= 1000 ? CHIP_TEXT_SIZES.wide : CHIP_TEXT_SIZES.default;
  const chipMode = small ? sizeGroup.small : sizeGroup.normal;

  return isTablet ? chipMode.tablet : chipMode.phone;
}

function Chip({ amount, chipScale = 1, isTablet, small }) {
  const chipSize = scalePx(small ? (isTablet ? 76 : 54) : isTablet ? 82 : 62, chipScale);
  const chipInnerSize = scalePx(small ? (isTablet ? 50 : 36) : isTablet ? 58 : 44, chipScale);
  const stripeLong = scalePx(isTablet ? 16 : 14, chipScale);
  const stripeShort = scalePx(isTablet ? 13 : 11, chipScale);
  const textBaseSize = getChipTextBaseSize(amount, small, isTablet);
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
  const chipTextDynamicStyle = {
    fontSize: scalePx(textBaseSize, chipScale),
    width: chipInnerSize - scalePx(4, chipScale),
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
      <View
        style={[
          styles.chipStripeTop,
          isTablet && styles.chipStripeTopTablet,
          { height: stripeLong, width: stripeShort },
        ]}
      />
      <View
        style={[
          styles.chipStripeRight,
          isTablet && styles.chipStripeRightTablet,
          { height: stripeShort, width: stripeLong },
        ]}
      />
      <View
        style={[
          styles.chipStripeBottom,
          isTablet && styles.chipStripeBottomTablet,
          { height: stripeLong, width: stripeShort },
        ]}
      />
      <View
        style={[
          styles.chipStripeLeft,
          isTablet && styles.chipStripeLeftTablet,
          { height: stripeShort, width: stripeLong },
        ]}
      />
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
          adjustsFontSizeToFit
          allowFontScaling={false}
          minimumFontScale={0.72}
          numberOfLines={1}
          style={[
            styles.chipText,
            isTablet && styles.chipTextTablet,
            small && styles.chipTextSmall,
            small && isTablet && styles.chipTextSmallTablet,
            amount >= 1000 && (small ? styles.chipTextWideSmall : styles.chipTextWide),
            amount >= 1000 &&
              isTablet &&
              (small ? styles.chipTextWideSmallTablet : styles.chipTextWideTablet),
            chipTextDynamicStyle,
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
