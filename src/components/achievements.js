import { useEffect, useRef } from "react";
import { Animated, Modal, Pressable, ScrollView, Text, View } from "react-native";

import { achievementDefinitions, achievementProgress, formatAchievementValue } from "../core/game";
import { styles } from "../styles/styles";

function AchievementsModal({ visible, stats, onClose }) {
  const unlockedCount = achievementDefinitions.filter(
    (achievement) => achievementProgress(achievement, stats) >= achievement.goal
  ).length;

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.achievementModalBackdrop}>
        <Pressable style={styles.achievementModalCloseLayer} onPress={onClose} />
        <View style={styles.achievementPanel}>
          <View style={styles.achievementPanelHeader}>
            <View>
              <Text style={styles.achievementPanelTitle}>Achievements</Text>
              <Text style={styles.achievementPanelSubtitle}>
                {unlockedCount}/{achievementDefinitions.length} unlocked
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.accountCloseButton, pressed && styles.pressed]}
            >
              <Text style={styles.accountCloseText}>X</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.achievementList} style={styles.achievementListScroll}>
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
                      {unlocked ? "✓" : "★"}
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
                    <Text numberOfLines={2} style={styles.achievementDescription}>
                      {achievement.description}
                    </Text>
                    <View style={styles.achievementProgressTrack}>
                      <View style={[styles.achievementProgressFill, { width: `${progressRatio * 100}%` }]} />
                    </View>
                    <Text style={styles.achievementProgressText}>
                      {formatAchievementValue(progress, achievement)} / {formatAchievementValue(achievement.goal, achievement)}
                    </Text>
                    <Text style={styles.achievementRewardText}>
                      Reward ${achievement.reward.toLocaleString("en-US")}
                    </Text>
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
        <Text style={styles.achievementToastCheckText}>✓</Text>
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
