import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, ScrollView, Text, View } from "react-native";

import {
  ITEM_IMAGES,
  PROPERTY_IMAGES,
  VEHICLE_IMAGES,
  bonusLabel,
  itemListings,
  realEstateListings,
  rentalIncomeCapacity,
  vehicleListings,
} from "../core/game";
import { styles } from "../styles/styles";

function PropertyThumbnail({ isTablet, name }) {
  return (
    <View style={[styles.propertyThumbnail, isTablet && styles.storeThumbnailTablet]}>
      <Image
        fadeDuration={0}
        resizeMode="cover"
        source={PROPERTY_IMAGES[name]}
        style={styles.storeThumbnailImage}
      />
    </View>
  );
}

function VehicleThumbnail({ isTablet, name }) {
  return (
    <View style={[styles.vehicleThumbnail, isTablet && styles.storeThumbnailTablet]}>
      <Image
        fadeDuration={0}
        resizeMode="cover"
        source={VEHICLE_IMAGES[name]}
        style={styles.storeThumbnailImage}
      />
    </View>
  );
}

function ItemThumbnail({ isTablet, name }) {
  return (
    <View style={[styles.itemThumbnail, isTablet && styles.storeThumbnailTablet]}>
      <Image
        fadeDuration={0}
        resizeMode="cover"
        source={ITEM_IMAGES[name]}
        style={styles.storeThumbnailImage}
      />
    </View>
  );
}

function OwnedRentLabel({ rentPerHour, showCheck }) {
  const transition = useRef(new Animated.Value(showCheck ? 0 : 1)).current;

  useEffect(() => {
    Animated.timing(transition, {
      toValue: showCheck ? 0 : 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, [showCheck, transition]);

  const checkOpacity = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const checkScale = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.82],
  });
  const rentTranslateY = transition.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 0],
  });

  return (
    <View style={styles.storeOwnedLabel}>
      <Animated.Text
        style={[
          styles.storeOwnedCheck,
          styles.storeOwnedLabelText,
          { opacity: checkOpacity, transform: [{ scale: checkScale }] },
        ]}
      >
        ✓
      </Animated.Text>
      <Animated.Text
        style={[
          styles.storeRentRate,
          styles.storeOwnedLabelText,
          { opacity: transition, transform: [{ translateY: rentTranslateY }] },
        ]}
      >
        +${rentPerHour.toLocaleString("en-US")}/hr
      </Animated.Text>
    </View>
  );
}

function StorePanel({
  credit,
  isTablet,
  ownedItems,
  ownedRealEstate,
  ownedVehicles,
  onBuyItem,
  onBuyRealEstate,
  onBuyVehicle,
  onCollectRentalIncome,
  rentalIncome,
  rentalProgress,
  rentalRate,
  rentalCountdownText,
  visible,
}) {
  const [category, setCategory] = useState("realEstate");
  const [showOwnedChecks, setShowOwnedChecks] = useState(true);

  useEffect(() => {
    if (!visible || category !== "realEstate") {
      return undefined;
    }

    setShowOwnedChecks(true);
    const timer = setTimeout(() => setShowOwnedChecks(false), 1000);
    return () => clearTimeout(timer);
  }, [category, ownedRealEstate, visible]);

  return (
    <View style={styles.storeScreen}>
      <Text style={[styles.storeTitle, isTablet && styles.storeTitleTablet]}>Store</Text>
      <View style={[styles.storeCategories, isTablet && styles.storeCategoriesTablet]}>
        <Pressable
          disabled={category === "realEstate"}
          onPress={() => setCategory("realEstate")}
          style={({ pressed }) => [
            styles.storeCategoryButton,
            isTablet && styles.storeCategoryButtonTablet,
            category === "realEstate" && styles.storeCategoryButtonSelected,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.storeCategoryText,
              isTablet && styles.storeCategoryTextTablet,
              category === "realEstate" && styles.storeCategoryTextSelected,
            ]}
          >
            Real Estate
          </Text>
        </Pressable>
        <Pressable
          disabled={category === "cars"}
          onPress={() => setCategory("cars")}
          style={({ pressed }) => [
            styles.storeCategoryButton,
            isTablet && styles.storeCategoryButtonTablet,
            category === "cars" && styles.storeCategoryButtonSelected,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.storeCategoryText,
              isTablet && styles.storeCategoryTextTablet,
              category === "cars" && styles.storeCategoryTextSelected,
            ]}
          >
            Cars
          </Text>
        </Pressable>
        <Pressable
          disabled={category === "items"}
          onPress={() => setCategory("items")}
          style={({ pressed }) => [
            styles.storeCategoryButton,
            isTablet && styles.storeCategoryButtonTablet,
            category === "items" && styles.storeCategoryButtonSelected,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.storeCategoryText,
              isTablet && styles.storeCategoryTextTablet,
              category === "items" && styles.storeCategoryTextSelected,
            ]}
          >
            Items
          </Text>
        </Pressable>
      </View>

      {category === "realEstate" ? (
        <ScrollView
          contentContainerStyle={styles.storeListContent}
          showsVerticalScrollIndicator={false}
          style={styles.storeList}
        >
          {realEstateListings.map((property, index) => {
            const owned = ownedRealEstate.includes(property.name);
            const affordable = credit >= property.price;

            return (
              <View key={property.name} style={[styles.storeListing, isTablet && styles.storeListingTablet]}>
                <View style={styles.storeListingInfo}>
                  <PropertyThumbnail isTablet={isTablet} name={property.name} />
                  <View style={styles.storeListingLabel}>
                    <Text style={[styles.storeListingTier, isTablet && styles.storeListingTierTablet]}>
                      {String(index + 1).padStart(2, "0")}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.storeListingName, isTablet && styles.storeListingNameTablet]}
                    >
                      {property.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.storeListingBonus, isTablet && styles.storeListingBonusTablet]}
                    >
                      +${property.rentPerHour.toLocaleString("en-US")}/hr rent
                    </Text>
                  </View>
                </View>
                <Pressable
                  disabled={owned || !affordable}
                  onPress={() => onBuyRealEstate(property)}
                  style={({ pressed }) => [
                    styles.storeBuyButton,
                    isTablet && styles.storeBuyButtonTablet,
                    owned && styles.storeBuyButtonOwned,
                    !owned && !affordable && styles.storeBuyButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  {owned ? (
                    <OwnedRentLabel rentPerHour={property.rentPerHour} showCheck={showOwnedChecks} />
                  ) : (
                    <Text style={[styles.storeListingPrice, isTablet && styles.storeListingPriceTablet]}>
                      ${property.price.toLocaleString("en-US")}
                    </Text>
                  )}
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      ) : category === "cars" ? (
        <ScrollView
          contentContainerStyle={styles.storeListContent}
          showsVerticalScrollIndicator={false}
          style={styles.storeList}
        >
          {vehicleListings.map((vehicle, index) => {
            const owned = ownedVehicles.includes(vehicle.name);
            const affordable = credit >= vehicle.price;

            return (
              <View key={vehicle.name} style={[styles.storeListing, isTablet && styles.storeListingTablet]}>
                <View style={styles.storeListingInfo}>
                  <VehicleThumbnail isTablet={isTablet} name={vehicle.name} />
                  <View style={styles.storeListingLabel}>
                    <Text style={[styles.storeListingTier, isTablet && styles.storeListingTierTablet]}>
                      {String(index + 1).padStart(2, "0")}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.storeListingName, isTablet && styles.storeListingNameTablet]}
                    >
                      {vehicle.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.storeListingBonus, isTablet && styles.storeListingBonusTablet]}
                    >
                      {bonusLabel(vehicle.bonus)}
                    </Text>
                  </View>
                </View>
                <Pressable
                  disabled={owned || !affordable}
                  onPress={() => onBuyVehicle(vehicle)}
                  style={({ pressed }) => [
                    styles.storeBuyButton,
                    isTablet && styles.storeBuyButtonTablet,
                    owned && styles.storeBuyButtonOwned,
                    !owned && !affordable && styles.storeBuyButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.storeListingPrice,
                      isTablet && styles.storeListingPriceTablet,
                      owned && styles.storeOwnedCheck,
                    ]}
                  >
                    {owned ? "✓" : `$${vehicle.price.toLocaleString("en-US")}`}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.storeListContent}
          showsVerticalScrollIndicator={false}
          style={styles.storeList}
        >
          {itemListings.map((item, index) => {
            const owned = ownedItems.includes(item.name);
            const affordable = credit >= item.price;

            return (
              <View key={item.name} style={[styles.storeListing, isTablet && styles.storeListingTablet]}>
                <View style={styles.storeListingInfo}>
                  <ItemThumbnail isTablet={isTablet} name={item.name} />
                  <View style={styles.storeListingLabel}>
                    <Text style={[styles.storeListingTier, isTablet && styles.storeListingTierTablet]}>
                      {String(index + 1).padStart(2, "0")}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.storeListingName, isTablet && styles.storeListingNameTablet]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.storeListingBonus, isTablet && styles.storeListingBonusTablet]}
                    >
                      {bonusLabel(item.bonus)}
                    </Text>
                  </View>
                </View>
                <Pressable
                  disabled={owned || !affordable}
                  onPress={() => onBuyItem(item)}
                  style={({ pressed }) => [
                    styles.storeBuyButton,
                    isTablet && styles.storeBuyButtonTablet,
                    owned && styles.storeBuyButtonOwned,
                    !owned && !affordable && styles.storeBuyButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.storeListingPrice,
                      isTablet && styles.storeListingPriceTablet,
                      owned && styles.storeOwnedCheck,
                    ]}
                  >
                    {owned ? "✓" : `$${item.price.toLocaleString("en-US")}`}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </ScrollView>
      )}
      <View style={styles.rentalPanel}>
        <View style={styles.rentalPanelInfo}>
          <Text style={styles.rentalPanelTitle}>Rental Income</Text>
          <Text style={styles.rentalPanelRate}>+${rentalRate.toLocaleString("en-US")}/hr</Text>
          <Text style={styles.rentalPanelCapacity}>MAX ${rentalIncomeCapacity.toLocaleString("en-US")}</Text>
          <View style={styles.rentalProgressTrack}>
            <View style={[styles.rentalProgressFill, { width: `${rentalProgress * 100}%` }]} />
          </View>
          <Text style={styles.rentalCountdown}>{rentalCountdownText}</Text>
        </View>
        <Text style={styles.rentalPanelAmount}>${rentalIncome.toLocaleString("en-US")}</Text>
        <Pressable
          disabled={rentalIncome <= 0}
          onPress={onCollectRentalIncome}
          style={({ pressed }) => [
            styles.rentalCollectButton,
            rentalIncome <= 0 && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.rentalCollectText}>Collect</Text>
        </Pressable>
      </View>
    </View>
  );
}

export { ItemThumbnail, OwnedRentLabel, PropertyThumbnail, StorePanel, VehicleThumbnail };
