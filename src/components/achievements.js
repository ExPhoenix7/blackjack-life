import { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";

import { achievementDefinitions, achievementProgress, formatAchievementValue } from "../core/game";
import { styles } from "../styles/styles";

function AchievementsModal({ visible, stats, isTablet, onClose, safeFrameInsets }) {
  const unlockedCount = achievementDefinitions.filter(
    (achievement) => achievementProgress(achievement, stats) >= achievement.goal
  ).length;
  const totalCount = achievementDefinitions.length;
  const completionRatio = totalCount > 0 ? unlockedCount / totalCount : 0;

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[
        styles.achievementScreen,
        {
          paddingBottom: 18 + safeFrameInsets.bottom,
          paddingHorizontal: (isTablet ? 20 : 12) + safeFrameInsets.horizontal,
          paddingTop: 8 + safeFrameInsets.top,
        },
      ]}
    >
      <View style={[styles.achievementFullHeader, isTablet && styles.achievementFullHeaderTablet]}>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.profileBackButton,
            isTablet && styles.profileBackButtonTablet,
            pressed && styles.pressed,
          ]}
        >
          <Text style={[styles.profileBackText, isTablet && styles.profileBackTextTablet]}>Back</Text>
        </Pressable>
        <View style={styles.profileTitleWrap}>
          <Text style={[styles.achievementFullTitle, isTablet && styles.achievementFullTitleTablet]}>
            Achievements
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.achievementFullSubtitle, isTablet && styles.achievementFullSubtitleTablet]}
          >
            {unlockedCount}/{totalCount} unlocked
          </Text>
        </View>
        <View style={[styles.profileTopSpacer, isTablet && styles.profileTopSpacerTablet]} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.achievementFullContent,
          isTablet && styles.achievementFullContentTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.achievementSummaryCard, isTablet && styles.achievementSummaryCardTablet]}>
          <View style={styles.achievementSummaryTop}>
            <View>
              <Text
                style={[styles.achievementSummaryLabel, isTablet && styles.achievementSummaryLabelTablet]}
              >
                Completion
              </Text>
              <Text
                style={[styles.achievementSummaryValue, isTablet && styles.achievementSummaryValueTablet]}
              >
                {Math.round(completionRatio * 100)}%
              </Text>
            </View>
            <View style={[styles.achievementSummaryBadge, isTablet && styles.achievementSummaryBadgeTablet]}>
              <Text
                style={[
                  styles.achievementSummaryBadgeText,
                  isTablet && styles.achievementSummaryBadgeTextTablet,
                ]}
              >
                {totalCount - unlockedCount} left
              </Text>
            </View>
          </View>
          <View style={[styles.achievementSummaryTrack, isTablet && styles.achievementSummaryTrackTablet]}>
            <View style={[styles.achievementSummaryFill, { width: `${completionRatio * 100}%` }]} />
          </View>
        </View>

        <View style={[styles.achievementList, isTablet && styles.achievementListTablet]}>
          {achievementDefinitions.map((achievement) => {
            const progress = achievementProgress(achievement, stats);
            const unlocked = progress >= achievement.goal;
            const progressRatio = Math.min(1, progress / achievement.goal);

            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementRow,
                  isTablet && styles.achievementRowTablet,
                  unlocked && styles.achievementRowUnlocked,
                ]}
              >
                <View
                  style={[
                    styles.achievementBadge,
                    isTablet && styles.achievementBadgeTablet,
                    unlocked && styles.achievementBadgeUnlocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.achievementBadgeText,
                      isTablet && styles.achievementBadgeTextTablet,
                      unlocked && styles.achievementBadgeTextUnlocked,
                    ]}
                  >
                    {"\u2605"}
                  </Text>
                </View>
                <View style={styles.achievementInfo}>
                  <View style={styles.achievementTitleRow}>
                    <Text
                      numberOfLines={1}
                      style={[styles.achievementTitle, isTablet && styles.achievementTitleTablet]}
                    >
                      {achievement.title}
                    </Text>
                    <Text
                      style={[
                        styles.achievementStatus,
                        isTablet && styles.achievementStatusTablet,
                        unlocked && styles.achievementStatusUnlocked,
                      ]}
                    >
                      {unlocked ? "DONE" : "LOCKED"}
                    </Text>
                  </View>
                  <View style={styles.achievementTaskRow}>
                    <Text
                      style={[styles.achievementTaskLabel, isTablet && styles.achievementTaskLabelTablet]}
                    >
                      TASK
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={[styles.achievementDescription, isTablet && styles.achievementDescriptionTablet]}
                    >
                      {achievement.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.achievementProgressTrack,
                      isTablet && styles.achievementProgressTrackTablet,
                    ]}
                  >
                    <View style={[styles.achievementProgressFill, { width: `${progressRatio * 100}%` }]} />
                  </View>
                  <View style={styles.achievementFooterRow}>
                    <Text
                      style={[
                        styles.achievementProgressText,
                        isTablet && styles.achievementProgressTextTablet,
                      ]}
                    >
                      {formatAchievementValue(progress, achievement)} /{" "}
                      {formatAchievementValue(achievement.goal, achievement)}
                    </Text>
                    <Text
                      style={[styles.achievementRewardText, isTablet && styles.achievementRewardTextTablet]}
                    >
                      +${achievement.reward.toLocaleString("en-US")}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function AchievementToast({ achievement, onDone }) {
  const entrance = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(entrance, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(checkScale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 9,
          stiffness: 190,
        }),
      ]),
      Animated.delay(2300),
      Animated.timing(entrance, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onDone();
      }
    });
  }, [achievement, checkScale, entrance, onDone]);

  const translateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 0],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.achievementToast,
        {
          opacity: entrance,
          transform: [{ translateY }],
        },
      ]}
    >
      <Animated.View style={[styles.achievementToastCheck, { transform: [{ scale: checkScale }] }]}>
        <Text style={styles.achievementToastCheckText}>{"\u2605"}</Text>
      </Animated.View>
      <View style={styles.achievementToastTextWrap}>
        <Text style={styles.achievementToastEyebrow}>Achievement unlocked</Text>
        <Text numberOfLines={1} style={styles.achievementToastTitle}>
          {achievement.title}
        </Text>
        <Text numberOfLines={2} style={styles.achievementToastDescription}>
          {achievement.description}
        </Text>
        <Text style={styles.achievementToastReward}>
          +${achievement.reward.toLocaleString("en-US")} reward
        </Text>
      </View>
    </Animated.View>
  );
}

export { AchievementToast, AchievementsModal };
