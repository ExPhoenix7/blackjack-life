import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import {
  moneyMachineCapacityStep,
  moneyMachineMaxCapacityLevel,
  moneyMachineMaxTapLevel,
  moneyMachineTapEarnStep,
  moneyMachineUpgradeCost,
  scalePx,
} from "../core/game";
import { styles } from "../styles/styles";

function MoneyMachinePanel({
  stored,
  isTablet,
  moneyMachineScale = 1,
  panelHeight,
  capacity,
  tapEarn,
  passiveEarn,
  tapLevel,
  capacityLevel,
  credit,
  onCollect,
  onTapEarn,
  onUpgradeTap,
  onUpgradeCapacity,
}) {
  const progress = Math.min(1, stored / capacity);
  const machineFull = stored >= capacity;
  const tapAtMax = tapLevel >= moneyMachineMaxTapLevel;
  const capacityAtMax = capacityLevel >= moneyMachineMaxCapacityLevel;
  const tapUpgradeCost = moneyMachineUpgradeCost("tap", tapLevel);
  const capacityUpgradeCost = moneyMachineUpgradeCost("capacity", capacityLevel);
  const [measuredStationHeight, setMeasuredStationHeight] = useState(0);
  const scale = moneyMachineScale;
  const isAndroidPhone = Platform.OS === "android" && !isTablet;
  const tapZoneHeight = isAndroidPhone ? 206 : isTablet ? 244 : 220;
  const upgradesHeight = isAndroidPhone ? 66 : isTablet ? 78 : 68;
  const stationHeight = isAndroidPhone ? 166 : isTablet ? 196 : 174;
  const boxWidth = isAndroidPhone ? 218 : isTablet ? 260 : 220;
  const boxHeight = isAndroidPhone ? 82 : isTablet ? 98 : 84;
  const windowHeight = isAndroidPhone ? 47 : isTablet ? 58 : 48;
  const panelGap = scalePx(isTablet ? 12 : 8, scale);
  const panelPaddingTop = scalePx(isAndroidPhone ? 4 : 8, scale);
  const panelPaddingBottom = scalePx(isAndroidPhone ? 10 : 6, scale);
  const baseTapZoneHeight = scalePx(tapZoneHeight, scale);
  const renderedUpgradesHeight = scalePx(upgradesHeight, scale);
  const renderedStationHeight = scalePx(stationHeight, scale);
  const stationSafetySpace = scalePx(isTablet ? 32 : 24, scale);
  const stationLayoutHeight = Math.max(renderedStationHeight + stationSafetySpace, measuredStationHeight);
  const availableTapZoneHeight =
    (panelHeight || 0) -
    panelPaddingTop -
    panelPaddingBottom -
    renderedUpgradesHeight -
    stationLayoutHeight -
    panelGap * 2;
  const renderedTapZoneHeight = Math.max(
    0,
    Math.min(Math.round(baseTapZoneHeight * (isTablet ? 1.65 : 1.5)), availableTapZoneHeight)
  );

  const content = (
    <>
      <Pressable
        disabled={machineFull}
        onPress={onTapEarn}
        style={({ pressed }) => [
          styles.moneyMachineTapZone,
          isTablet && styles.moneyMachineTapZoneTablet,
          {
            height: renderedTapZoneHeight,
            transform: [{ translateY: 0 }],
          },
          machineFull && styles.moneyMachineTapZoneFull,
          pressed && styles.moneyMachineTapZonePressed,
          pressed && isTablet && styles.moneyMachineTapZonePressedTablet,
          pressed && { transform: [{ scale: isTablet ? 0.99 : 0.985 }] },
        ]}
      >
        <Text
          style={[
            styles.moneyMachineTapText,
            isTablet && styles.moneyMachineTapTextTablet,
            {
              fontSize: scalePx(isAndroidPhone ? 22 : isTablet ? 26 : 23, scale),
              maxWidth: scalePx(isTablet ? 340 : 260, scale),
            },
          ]}
        >
          {machineFull ? "FULL" : "Tap here to make money"}
        </Text>
        {!machineFull && (
          <Text
            style={[
              styles.moneyMachineTapValue,
              isTablet && styles.moneyMachineTapValueTablet,
              { fontSize: scalePx(isTablet ? 21 : 18, scale), marginTop: scalePx(10, scale) },
            ]}
          >
            +${tapEarn}
          </Text>
        )}
      </Pressable>
      <View
        style={[
          styles.moneyMachineUpgrades,
          isTablet && styles.moneyMachineUpgradesTablet,
          {
            gap: scalePx(8, scale),
            height: renderedUpgradesHeight,
            transform: [{ translateY: 0 }],
          },
        ]}
      >
        <Pressable
          disabled={tapAtMax}
          onPress={onUpgradeTap}
          style={({ pressed }) => [
            styles.moneyMachineUpgrade,
            isTablet && styles.moneyMachineUpgradeTablet,
            (tapAtMax || credit < tapUpgradeCost) && styles.moneyMachineUpgradeDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.moneyMachineUpgradeTitle,
              isTablet && styles.moneyMachineUpgradeTitleTablet,
              { fontSize: scalePx(isAndroidPhone ? 13 : isTablet ? 15 : 13, scale) },
            ]}
          >
            Tap Power
          </Text>
          <Text
            style={[
              styles.moneyMachineUpgradeEffect,
              isTablet && styles.moneyMachineUpgradeEffectTablet,
              {
                fontSize: scalePx(isAndroidPhone ? 10 : isTablet ? 11 : 10, scale),
                marginTop: scalePx(2, scale),
              },
            ]}
          >
            {tapAtMax ? `+$${tapEarn} per tap` : `+$${tapEarn}  >  +$${tapEarn + moneyMachineTapEarnStep}`}
          </Text>
          <Text
            style={[
              styles.moneyMachineUpgradeCost,
              isTablet && styles.moneyMachineUpgradeCostTablet,
              {
                fontSize: scalePx(isAndroidPhone ? 10 : isTablet ? 11 : 10, scale),
                marginTop: scalePx(2, scale),
              },
            ]}
          >
            {tapAtMax ? "MAX LEVEL" : `Upgrade  $${tapUpgradeCost}`}
          </Text>
        </Pressable>
        <Pressable
          disabled={capacityAtMax}
          onPress={onUpgradeCapacity}
          style={({ pressed }) => [
            styles.moneyMachineUpgrade,
            isTablet && styles.moneyMachineUpgradeTablet,
            (capacityAtMax || credit < capacityUpgradeCost) && styles.moneyMachineUpgradeDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.moneyMachineUpgradeTitle,
              isTablet && styles.moneyMachineUpgradeTitleTablet,
              { fontSize: scalePx(isAndroidPhone ? 13 : isTablet ? 15 : 13, scale) },
            ]}
          >
            Storage
          </Text>
          <Text
            style={[
              styles.moneyMachineUpgradeEffect,
              isTablet && styles.moneyMachineUpgradeEffectTablet,
              {
                fontSize: scalePx(isAndroidPhone ? 10 : isTablet ? 11 : 10, scale),
                marginTop: scalePx(2, scale),
              },
            ]}
          >
            {capacityAtMax
              ? `$${capacity} capacity`
              : `$${capacity}  >  $${capacity + moneyMachineCapacityStep}`}
          </Text>
          <Text
            style={[
              styles.moneyMachineUpgradeCost,
              isTablet && styles.moneyMachineUpgradeCostTablet,
              {
                fontSize: scalePx(isAndroidPhone ? 10 : isTablet ? 11 : 10, scale),
                marginTop: scalePx(2, scale),
              },
            ]}
          >
            {capacityAtMax ? "MAX LEVEL" : `Upgrade  $${capacityUpgradeCost}`}
          </Text>
        </Pressable>
      </View>
      <View
        onLayout={(event) => {
          const nextHeight = Math.ceil(event.nativeEvent.layout.height);
          setMeasuredStationHeight((currentHeight) =>
            Math.abs(currentHeight - nextHeight) > 1 ? nextHeight : currentHeight
          );
        }}
        style={[
          styles.moneyMachineStation,
          isTablet && styles.moneyMachineStationTablet,
          {
            gap: scalePx(5, scale),
            minHeight: renderedStationHeight,
            paddingHorizontal: scalePx(isTablet ? 18 : 14, scale),
            paddingVertical: scalePx(isAndroidPhone ? 5 : 7, scale),
          },
        ]}
      >
        <Text
          style={[
            styles.moneyMachineStationTitle,
            isTablet && styles.moneyMachineStationTitleTablet,
            { fontSize: scalePx(isAndroidPhone ? 19 : isTablet ? 22 : 19, scale) },
          ]}
        >
          Money Machine
        </Text>
        <View
          style={[
            styles.moneyMachineBox,
            isTablet && styles.moneyMachineBoxTablet,
            {
              gap: scalePx(5, scale),
              minHeight: scalePx(boxHeight, scale),
              paddingHorizontal: scalePx(16, scale),
              paddingVertical: scalePx(isAndroidPhone ? 5 : 6, scale),
              width: scalePx(boxWidth, scale),
            },
          ]}
        >
          <View
            style={[
              styles.moneyMachineTopLight,
              isTablet && styles.moneyMachineTopLightTablet,
              {
                borderRadius: scalePx(6, scale),
                height: scalePx(isTablet ? 10 : 9, scale),
                width: scalePx(isTablet ? 46 : 38, scale),
              },
            ]}
          />
          <View
            style={[
              styles.moneyMachineWindow,
              isTablet && styles.moneyMachineWindowTablet,
              {
                minHeight: scalePx(windowHeight, scale),
                paddingHorizontal: scalePx(10, scale),
                paddingVertical: scalePx(isAndroidPhone ? 4 : isTablet ? 7 : 5, scale),
              },
            ]}
          >
            <View style={styles.moneyMachineAmountRow}>
              <Text
                numberOfLines={1}
                style={[
                  styles.moneyMachineAmount,
                  isTablet && styles.moneyMachineAmountTablet,
                  { fontSize: scalePx(isAndroidPhone ? 21 : isTablet ? 25 : 22, scale) },
                ]}
              >
                ${stored}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.moneyMachinePassiveRate,
                  isTablet && styles.moneyMachinePassiveRateTablet,
                  {
                    fontSize: scalePx(isTablet ? 10 : 9, scale),
                    marginTop: scalePx(isTablet ? 3 : 2, scale),
                  },
                ]}
              >
                +${passiveEarn}/min
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.moneyMachineProgressTrack,
              isTablet && styles.moneyMachineProgressTrackTablet,
              { height: scalePx(isTablet ? 11 : 10, scale) },
            ]}
          >
            <View style={[styles.moneyMachineProgressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text
            style={[
              styles.moneyMachineCapacity,
              isTablet && styles.moneyMachineCapacityTablet,
              { fontSize: scalePx(isTablet ? 11 : 10, scale) },
            ]}
          >
            MAX ${capacity}
          </Text>
        </View>
        <Pressable
          disabled={stored <= 0}
          onPress={onCollect}
          style={({ pressed }) => [
            styles.moneyMachineCollect,
            isTablet && styles.moneyMachineCollectTablet,
            {
              minHeight: scalePx(isAndroidPhone ? 24 : isTablet ? 30 : 25, scale),
              paddingHorizontal: scalePx(isAndroidPhone ? 26 : isTablet ? 34 : 28, scale),
            },
            stored <= 0 && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.moneyMachineCollectText,
              isTablet && styles.moneyMachineCollectTextTablet,
              { fontSize: scalePx(isAndroidPhone ? 14 : isTablet ? 15 : 14, scale) },
            ]}
          >
            Collect
          </Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <View
      style={[
        styles.moneyMachineScreen,
        {
          gap: panelGap,
          justifyContent: "flex-start",
          paddingBottom: panelPaddingBottom,
          paddingTop: panelPaddingTop,
        },
      ]}
    >
      {content}
    </View>
  );
}

export { MoneyMachinePanel };
