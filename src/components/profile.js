import { Pressable, ScrollView, Text, View } from "react-native";

import { itemListings, realEstateListings, vehicleListings } from "../core/game";
import { styles } from "../styles/styles";

function ProfileScreen({
  accountName,
  activeCredit,
  achievementsUnlocked,
  stats,
  currentWealth,
  machineCapacity,
  machinePassiveEarn,
  machineStored,
  machineTapEarn,
  totalAchievements,
  totalCredit,
  ownedCounts,
  ownedValues,
  rentalRate,
  isTablet,
  onBack,
  onOpenPrivacyPolicy,
  safeFrameInsets,
  version,
}) {
  const roundsPlayed = stats.roundsPlayed || 0;
  const handsWon = stats.handsWon || 0;
  const winRate = roundsPlayed > 0 ? Math.round((handsWon / roundsPlayed) * 100) : 0;
  const totalOwned = ownedCounts.realEstate + ownedCounts.vehicles + ownedCounts.items;
  const totalStoreItems = realEstateListings.length + vehicleListings.length + itemListings.length;
  const storeCompletion = totalStoreItems > 0 ? Math.round((totalOwned / totalStoreItems) * 100) : 0;
  const assetValue = ownedValues.realEstate + ownedValues.vehicles + ownedValues.items;
  const machineFill =
    machineCapacity > 0 ? Math.round((Math.min(machineStored, machineCapacity) / machineCapacity) * 100) : 0;
  const headlineStats = [
    { label: "Credit", value: `$${activeCredit.toLocaleString("en-US")}` },
    { label: "Assets", value: `$${assetValue.toLocaleString("en-US")}` },
    { label: "Store", value: `${storeCompletion}%` },
    { label: "Achievements", value: `${achievementsUnlocked}/${totalAchievements}` },
  ];
  const profileStats = [
    { label: "Total Credit", value: `$${totalCredit.toLocaleString("en-US")}` },
    { label: "Net Worth", value: `$${currentWealth.toLocaleString("en-US")}` },
    { label: "Highest Wealth", value: `$${(stats.highestWealth || currentWealth).toLocaleString("en-US")}` },
    { label: "Biggest Round Win", value: `$${(stats.biggestWin || 0).toLocaleString("en-US")}` },
    { label: "Rounds Played", value: roundsPlayed.toLocaleString("en-US") },
    { label: "Rounds Won", value: handsWon.toLocaleString("en-US") },
    { label: "Win Rate", value: `${winRate}%` },
    { label: "Blackjacks", value: (stats.blackjackWins || 0).toLocaleString("en-US") },
    { label: "Best Win Streak", value: (stats.bestWinStreak || 0).toLocaleString("en-US") },
    { label: "Total Bets", value: `$${(stats.totalBet || 0).toLocaleString("en-US")}` },
    { label: "Machine Collected", value: `$${(stats.moneyMachineCollected || 0).toLocaleString("en-US")}` },
    { label: "Rent Collected", value: `$${(stats.rentalCollected || 0).toLocaleString("en-US")}` },
    {
      label: "Store Owned",
      value: `${totalOwned}/${totalStoreItems}`,
    },
    { label: "Real Estate Value", value: `$${ownedValues.realEstate.toLocaleString("en-US")}` },
    { label: "Vehicle Value", value: `$${ownedValues.vehicles.toLocaleString("en-US")}` },
    { label: "Item Value", value: `$${ownedValues.items.toLocaleString("en-US")}` },
    { label: "Rental Rate", value: `$${rentalRate.toLocaleString("en-US")}/hr` },
    { label: "Machine Tap", value: `$${machineTapEarn.toLocaleString("en-US")}` },
    { label: "Machine Passive", value: `$${machinePassiveEarn.toLocaleString("en-US")}/min` },
    { label: "Machine Storage", value: `${machineFill}%` },
  ];

  return (
    <View
      style={[
        styles.profileScreen,
        {
          paddingBottom: 18 + safeFrameInsets.bottom,
          paddingHorizontal: (isTablet ? 20 : 12) + safeFrameInsets.horizontal,
          paddingTop: 8 + safeFrameInsets.top,
        },
      ]}
    >
      <View style={[styles.profileTopBar, isTablet && styles.profileTopBarTablet]}>
        <Pressable
          accessibilityLabel="Back to game"
          accessibilityRole="button"
          onPress={onBack}
          style={({ pressed }) => [
            styles.profileBackButton,
            isTablet && styles.profileBackButtonTablet,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.profileBackText, isTablet && styles.profileBackTextTablet]}>Back</Text>
        </Pressable>
        <View style={styles.profileTitleWrap}>
          <Text style={[styles.profileTitle, isTablet && styles.profileTitleTablet]}>Profile</Text>
          <Text
            numberOfLines={1}
            style={[styles.profileAccountName, isTablet && styles.profileAccountNameTablet]}
          >
            {accountName}
          </Text>
        </View>
        <View style={[styles.profileTopSpacer, isTablet && styles.profileTopSpacerTablet]} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.profileStatsContent, isTablet && styles.profileStatsContentTablet]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.profileHero, isTablet && styles.profileHeroTablet]}>
          <View style={[styles.profileAvatar, isTablet && styles.profileAvatarTablet]}>
            <View style={[styles.profileAvatarHead, isTablet && styles.profileAvatarHeadTablet]} />
            <View style={[styles.profileAvatarBody, isTablet && styles.profileAvatarBodyTablet]} />
          </View>
          <View style={styles.profileHeroText}>
            <Text style={[styles.profileHeroLabel, isTablet && styles.profileHeroLabelTablet]}>
              Net worth
            </Text>
            <Text style={[styles.profileHeroValue, isTablet && styles.profileHeroValueTablet]}>
              ${currentWealth.toLocaleString("en-US")}
            </Text>
          </View>
        </View>

        <View style={[styles.profileHeadlineGrid, isTablet && styles.profileHeadlineGridTablet]}>
          {headlineStats.map((stat) => (
            <View
              key={stat.label}
              style={[styles.profileHeadlineCard, isTablet && styles.profileHeadlineCardTablet]}
            >
              <Text style={[styles.profileHeadlineLabel, isTablet && styles.profileHeadlineLabelTablet]}>
                {stat.label}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.profileHeadlineValue, isTablet && styles.profileHeadlineValueTablet]}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.profileSectionTitle, isTablet && styles.profileSectionTitleTablet]}>
          Lifetime
        </Text>

        <View style={[styles.profileGrid, isTablet && styles.profileGridTablet]}>
          {profileStats.map((stat) => (
            <View key={stat.label} style={[styles.profileStatCard, isTablet && styles.profileStatCardTablet]}>
              <Text style={[styles.profileStatLabel, isTablet && styles.profileStatLabelTablet]}>
                {stat.label}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.profileStatValue, isTablet && styles.profileStatValueTablet]}
              >
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.profileFooter, isTablet && styles.profileFooterTablet]}>
          <Text style={[styles.profileFooterBrand, isTablet && styles.profileFooterBrandTablet]}>
            Blackjack Life {version} | Couzeens
          </Text>
          <Pressable
            accessibilityLabel="Open privacy policy"
            accessibilityRole="link"
            onPress={onOpenPrivacyPolicy}
            style={({ pressed }) => [styles.profilePrivacyButton, pressed && styles.pressed]}
          >
            <Text style={[styles.profilePrivacyText, isTablet && styles.profilePrivacyTextTablet]}>
              Privacy Policy
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

export { ProfileScreen };
