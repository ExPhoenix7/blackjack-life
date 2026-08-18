import { Image, Pressable, View } from "react-native";

import { TAB_BLACKJACK_ICON, TAB_MONEY_ICON, TAB_STORE_ICON, mainTabs } from "../core/game";
import { styles } from "../styles/styles";

function BottomTabs({ activeTab, isTablet, layoutScale = 1, onSelect }) {
  const tabWidth = Math.round((isTablet ? 339 : 291) * layoutScale);
  const tabGap = Math.round((isTablet ? 10 : 8) * layoutScale);
  const tabPaddingHorizontal = Math.round((isTablet ? 12 : 10) * layoutScale);
  const tabPaddingVertical = Math.round((isTablet ? 10 : 8) * layoutScale);
  const buttonSize = Math.round((isTablet ? 99 : 85) * layoutScale);
  const iconSize = Math.round((isTablet ? 56 : 48) * layoutScale);

  return (
    <View
      style={[
        styles.bottomTabs,
        isTablet && styles.bottomTabsTablet,
        {
          gap: tabGap,
          paddingHorizontal: tabPaddingHorizontal,
          paddingVertical: tabPaddingVertical,
          width: tabWidth,
        },
      ]}
    >
      {mainTabs.map((tab) => {
        const selected = tab === activeTab;
        const icon =
          tab === "store" ? TAB_STORE_ICON : tab === "blackjack" ? TAB_BLACKJACK_ICON : TAB_MONEY_ICON;

        return (
          <Pressable
            disabled={selected}
            key={tab}
            onPress={() => onSelect(tab)}
            style={({ pressed }) => [
              styles.bottomTabButton,
              isTablet && styles.bottomTabButtonTablet,
              { height: buttonSize, width: buttonSize },
              selected && styles.bottomTabButtonSelected,
              pressed && styles.pressed,
            ]}
          >
            <Image
              fadeDuration={0}
              resizeMode="contain"
              source={icon}
              style={[
                styles.bottomTabIcon,
                isTablet && styles.bottomTabIconTablet,
                { height: iconSize, width: iconSize },
                selected && styles.bottomTabIconSelected,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export { BottomTabs };
