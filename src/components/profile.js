import { Pressable, ScrollView, Text, View } from "react-native";

import { itemListings, realEstateListings, vehicleListings } from "../core/game";
import { styles } from "../styles/styles";

function ProfileScreen({ stats, currentWealth, totalCredit, ownedCounts, isTablet, onBack, safeFrameInsets }) {
  const roundsPlayed = stats.roundsPlayed || 0;
  const handsWon = stats.handsWon || 0;
  const winRate = roundsPlayed > 0 ? Math.round((handsWon / roundsPlayed) * 100) : 0;
  const totalOwned = ownedCounts.realEstate + ownedCounts.vehicles + ownedCounts.items;
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
    { label: "Store Owned", value: `${totalOwned}/${realEstateListings.length + vehicleListings.length + itemListings.length}` },
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
          <Text numberOfLines={1} style={[styles.profileAccountName, isTablet && styles.profileAccountNameTablet]}>
            Player stats
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
            <Text style={[styles.profileHeroLabel, isTablet && styles.profileHeroLabelTablet]}>Net worth</Text>
            <Text style={[styles.profileHeroValue, isTablet && styles.profileHeroValueTablet]}>
              ${currentWealth.toLocaleString("en-US")}
            </Text>
          </View>
        </View>

        <View style={[styles.profileGrid, isTablet && styles.profileGridTablet]}>
          {profileStats.map((stat) => (
            <View key={stat.label} style={[styles.profileStatCard, isTablet && styles.profileStatCardTablet]}>
              <Text style={[styles.profileStatLabel, isTablet && styles.profileStatLabelTablet]}>{stat.label}</Text>
              <Text numberOfLines={1} style={[styles.profileStatValue, isTablet && styles.profileStatValueTablet]}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export { ProfileScreen };
