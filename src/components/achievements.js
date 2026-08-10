import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, ScrollView, Text, View } from "react-native";

import { achievementDefinitions, achievementProgress, formatAchievementValue } from "../core/game";
import { styles } from "../styles/styles";

function AchievementsModal({ visible, stats, onClose }) {
  const unlockedCount = achievementDefinitions.filter(
    (achievement) => achievementProgress(achievement, stats) >= achievement.goal
  ).length;
  const totalCount = achievementDefinitions.length;
  const completionRatio = totalCount > 0 ? unlockedCount / totalCount : 0;

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.achievementModalBackdrop}>
        <Pressable style={styles.achievementModalCloseLayer} onPress={onClose} />
        <View style={styles.achievementPanel}>
          <View style={styles.achievementPanelHeader}>
            <View style={styles.achievementHeaderCopy}>
              <Text style={styles.achievementPanelEyebrow}>PLAYER PROGRESS</Text>
              <Text style={styles.achievementPanelTitle}>Achievements</Text>
              <Text style={styles.achievementPanelSubtitle}>
                {unlockedCount}/{totalCount} unlocked
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.achievementCloseButton, pressed && styles.pressed]}
            >
              <Text style={styles.achievementCloseText}>X</Text>
            </Pressable>
          </View>

          <View style={styles.achievementSummaryCard}>
            <View style={styles.achievementSummaryTop}>
              <View>
                <Text style={styles.achievementSummaryLabel}>Completion</Text>
                <Text style={styles.achievementSummaryValue}>{Math.round(completionRatio * 100)}%</Text>
              </View>
              <View style={styles.achievementSummaryBadge}>
                <Text style={styles.achievementSummaryBadgeText}>{totalCount - unlockedCount} left</Text>
              </View>
            </View>
            <View style={styles.achievementSummaryTrack}>
              <View style={[styles.achievementSummaryFill, { width: `${completionRatio * 100}%` }]} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.achievementList}
            showsVerticalScrollIndicator={false}
            style={styles.achievementListScroll}
          >
            {achievementDefinitions.map((achievement) => {
              const progress = achievementProgress(achievement, stats);
              const unlocked = progress >= achievement.goal;
              const progressRatio = Math.min(1, progress / achievement.goal);

              return (
                <View
                  key={achievement.id}
                  style={[styles.achievementRow, unlocked && styles.achievementRowUnlocked]}
                >
                  <View style={[styles.achievementBadge, unlocked && styles.achievementBadgeUnlocked]}>
                    <Text style={[styles.achievementBadgeText, unlocked && styles.achievementBadgeTextUnlocked]}>
                      {"\u2605"}
                    </Text>
                  </View>
                  <View style={styles.achievementInfo}>
                    <View style={styles.achievementTitleRow}>
                      <Text numberOfLines={1} style={styles.achievementTitle}>
                        {achievement.title}
                      </Text>
                      <Text style={[styles.achievementStatus, unlocked && styles.achievementStatusUnlocked]}>
                        {unlocked ? "DONE" : "LOCKED"}
                      </Text>
                    </View>
                    <View style={styles.achievementTaskRow}>
                      <Text style={styles.achievementTaskLabel}>TASK</Text>
                      <Text numberOfLines={2} style={styles.achievementDescription}>
                        {achievement.description}
                      </Text>
                    </View>
                    <View style={styles.achievementProgressTrack}>
                      <View style={[styles.achievementProgressFill, { width: `${progressRatio * 100}%` }]} />
                    </View>
                    <View style={styles.achievementFooterRow}>
                      <Text style={styles.achievementProgressText}>
                        {formatAchievementValue(progress, achievement)} / {formatAchievementValue(achievement.goal, achievement)}
                      </Text>
                      <Text style={styles.achievementRewardText}>
                        +${achievement.reward.toLocaleString("en-US")}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
        <Text style={styles.achievementToastCheckText}>OK</Text>
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
