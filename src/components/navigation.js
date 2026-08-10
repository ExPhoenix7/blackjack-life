import { Image, Pressable, View } from "react-native";

import { TAB_BLACKJACK_ICON, TAB_MONEY_ICON, TAB_STORE_ICON, mainTabs } from "../core/game";
import { styles } from "../styles/styles";

function BottomTabs({ activeTab, isTablet, onSelect }) {
  return (
    <View style={[styles.bottomTabs, isTablet && styles.bottomTabsTablet]}>
      {mainTabs.map((tab) => {
        const selected = tab === activeTab;
        const icon = tab === "store" ? TAB_STORE_ICON : tab === "blackjack" ? TAB_BLACKJACK_ICON : TAB_MONEY_ICON;

        return (
          <Pressable
            disabled={selected}
            key={tab}
            onPress={() => onSelect(tab)}
            style={({ pressed }) => [
              styles.bottomTabButton,
              isTablet && styles.bottomTabButtonTablet,
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
