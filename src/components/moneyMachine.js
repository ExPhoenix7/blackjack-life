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
  const scale = moneyMachineScale;
  const isAndroidPhone = Platform.OS === "android" && !isTablet;
  const tapZoneTranslateY = scalePx(isAndroidPhone ? -12 : -23, scale);
  const upgradesTranslateY = scalePx(isAndroidPhone ? -8 : -12, scale);

  const content = (
    <>
      <Pressable
        disabled={machineFull}
        onPress={onTapEarn}
        style={({ pressed }) => [
          styles.moneyMachineTapZone,
          isTablet && styles.moneyMachineTapZoneTablet,
          {
            height: scalePx(isTablet ? 244 : 220, scale),
            transform: [{ translateY: tapZoneTranslateY }],
          },
          machineFull && styles.moneyMachineTapZoneFull,
          pressed && styles.moneyMachineTapZonePressed,
          pressed && isTablet && styles.moneyMachineTapZonePressedTablet,
          pressed && { transform: [{ translateY: tapZoneTranslateY }, { scale: isTablet ? 0.99 : 0.985 }] },
        ]}
      >
        <Text
          style={[
            styles.moneyMachineTapText,
            isTablet && styles.moneyMachineTapTextTablet,
            {
              fontSize: scalePx(isTablet ? 26 : 23, scale),
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
            height: scalePx(isTablet ? 78 : 68, scale),
            transform: [{ translateY: upgradesTranslateY }],
          },
        ]}
      >
        <Pressable
          disabled={tapAtMax || credit < tapUpgradeCost}
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
              { fontSize: scalePx(isTablet ? 15 : 13, scale) },
            ]}
          >
            Tap Power
          </Text>
          <Text
            style={[
              styles.moneyMachineUpgradeEffect,
              isTablet && styles.moneyMachineUpgradeEffectTablet,
              { fontSize: scalePx(isTablet ? 11 : 10, scale), marginTop: scalePx(2, scale) },
            ]}
          >
            {tapAtMax
              ? `+$${tapEarn} per tap`
              : `+$${tapEarn}  >  +$${tapEarn + moneyMachineTapEarnStep}`}
          </Text>
          <Text
            style={[
              styles.moneyMachineUpgradeCost,
              isTablet && styles.moneyMachineUpgradeCostTablet,
              { fontSize: scalePx(isTablet ? 11 : 10, scale), marginTop: scalePx(2, scale) },
            ]}
          >
            {tapAtMax ? "MAX LEVEL" : `Upgrade  $${tapUpgradeCost}`}
          </Text>
        </Pressable>
        <Pressable
          disabled={capacityAtMax || credit < capacityUpgradeCost}
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
              { fontSize: scalePx(isTablet ? 15 : 13, scale) },
            ]}
          >
            Storage
          </Text>
          <Text
            style={[
              styles.moneyMachineUpgradeEffect,
              isTablet && styles.moneyMachineUpgradeEffectTablet,
              { fontSize: scalePx(isTablet ? 11 : 10, scale), marginTop: scalePx(2, scale) },
            ]}
          >
            {capacityAtMax ? `$${capacity} capacity` : `$${capacity}  >  $${capacity + moneyMachineCapacityStep}`}
          </Text>
          <Text
            style={[
              styles.moneyMachineUpgradeCost,
              isTablet && styles.moneyMachineUpgradeCostTablet,
              { fontSize: scalePx(isTablet ? 11 : 10, scale), marginTop: scalePx(2, scale) },
            ]}
          >
            {capacityAtMax ? "MAX LEVEL" : `Upgrade  $${capacityUpgradeCost}`}
          </Text>
        </Pressable>
      </View>
      <View
        style={[
          styles.moneyMachineStation,
          isTablet && styles.moneyMachineStationTablet,
          {
            gap: scalePx(5, scale),
            minHeight: scalePx(isTablet ? 196 : 174, scale),
            paddingHorizontal: scalePx(isTablet ? 18 : 14, scale),
            paddingVertical: scalePx(7, scale),
          },
        ]}
      >
        <Text
          style={[
            styles.moneyMachineStationTitle,
            isTablet && styles.moneyMachineStationTitleTablet,
            { fontSize: scalePx(isTablet ? 22 : 19, scale) },
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
              minHeight: scalePx(isTablet ? 98 : 84, scale),
              paddingHorizontal: scalePx(16, scale),
              paddingVertical: scalePx(6, scale),
              width: scalePx(isTablet ? 260 : 220, scale),
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
                minHeight: scalePx(isTablet ? 58 : 48, scale),
                paddingHorizontal: scalePx(10, scale),
                paddingVertical: scalePx(isTablet ? 7 : 5, scale),
              },
            ]}
          >
            <View style={styles.moneyMachineAmountRow}>
              <Text
                numberOfLines={1}
                style={[
                  styles.moneyMachineAmount,
                  isTablet && styles.moneyMachineAmountTablet,
                  { fontSize: scalePx(isTablet ? 25 : 22, scale) },
                ]}
              >
                ${stored}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.moneyMachinePassiveRate,
                  isTablet && styles.moneyMachinePassiveRateTablet,
                  { fontSize: scalePx(isTablet ? 10 : 9, scale), marginTop: scalePx(isTablet ? 3 : 2, scale) },
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
              minHeight: scalePx(isTablet ? 30 : 25, scale),
              paddingHorizontal: scalePx(isTablet ? 34 : 28, scale),
            },
            stored <= 0 && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.moneyMachineCollectText,
              isTablet && styles.moneyMachineCollectTextTablet,
              { fontSize: scalePx(isTablet ? 15 : 14, scale) },
            ]}
          >
            Collect
          </Text>
        </Pressable>
      </View>
    </>
  );

  return (
    <View style={[styles.moneyMachineScreen, Platform.OS === "ios" && !isTablet && { transform: [{ translateY: -5 }] }]}>
      {content}
    </View>
  );
}

export { MoneyMachinePanel };
