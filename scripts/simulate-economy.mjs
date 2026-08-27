const realEstateListings = [
  { name: "Studio Apartment", price: 5000, rentPerHour: 200 },
  { name: "Bungalow", price: 10000, rentPerHour: 400 },
  { name: "Luxury Apartment", price: 20000, rentPerHour: 750 },
  { name: "Duplex", price: 35000, rentPerHour: 1200 },
  { name: "Penthouse", price: 55000, rentPerHour: 1900 },
  { name: "Farmhouse", price: 80000, rentPerHour: 2700 },
  { name: "Beach House", price: 110000, rentPerHour: 3700 },
  { name: "Luxury Villa", price: 150000, rentPerHour: 4800 },
  { name: "Mansion", price: 200000, rentPerHour: 6300 },
  { name: "Hotel", price: 250000, rentPerHour: 8000 },
];
const vehicleListings = [
  { name: "Bicycle", price: 500, bonus: { tap: 10 } },
  { name: "Motorcycle", price: 3000, bonus: { capacity: 500 } },
  { name: "Hatchback", price: 10000, bonus: { rentalPercent: 2 } },
  { name: "Sedan", price: 20000, bonus: { passive: 10 } },
  { name: "SUV", price: 30000, bonus: { capacity: 1500 } },
  { name: "Sports Car", price: 50000, bonus: { tap: 30 } },
  { name: "Limousine", price: 75000, bonus: { rentalPercent: 4 } },
  { name: "Supercar", price: 110000, bonus: { tap: 50 } },
  { name: "Yacht", price: 150000, bonus: { rentalPercent: 8 } },
  { name: "Private Jet", price: 200000, bonus: { passive: 30 } },
];
const itemListings = [
  { name: "Headphones", price: 500, bonus: { passive: 10 } },
  { name: "Smartphone", price: 1500, bonus: { tap: 10 } },
  { name: "Gaming Console", price: 2500, bonus: { passive: 13 } },
  { name: "Tablet", price: 3000, bonus: { rentalPercent: 3 } },
  { name: "Watch", price: 6000, bonus: { tap: 20 } },
  { name: "Laptop", price: 8000, bonus: { capacity: 2000 } },
  { name: "Necklace", price: 8000, bonus: { rentalPercent: 4 } },
  { name: "Ring", price: 10000, bonus: { rentalPercent: 5 } },
  { name: "Pool Table", price: 8000, bonus: { capacity: 1500 } },
  { name: "Home Theater", price: 6000, bonus: { passive: 17 } },
];

const rewardedAdCredit = 10000;
const rewardedAdMidCredit = 30000;
const rewardedAdHighCredit = 50000;
const rewardedAdMidWealth = 200000;
const rewardedAdHighWealth = 400000;
const rentalIncomeCapacity = 50000;
const moneyMachineBaseCapacity = 1000;
const moneyMachineCapacityStep = 1000;
const moneyMachineBaseTapEarn = 10;
const moneyMachineTapEarnStep = 2;
const moneyMachineMaxTapEarn = 100;
const moneyMachineTapUpgradeBaseCost = 1000;
const moneyMachineCapacityUpgradeBaseCost = 2000;
const moneyMachineTapUpgradeCostStep = 200;
const moneyMachineCapacityUpgradeCostStep = 100;
const moneyMachineMaxTapLevel = 46;
const moneyMachineMaxCapacityLevel = 50;
const moneyMachineEarnPerMinute = 100;

function money(value) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function sum(list, selector) {
  return list.reduce((total, item) => total + selector(item), 0);
}

function bonusTotal(type) {
  return [...vehicleListings, ...itemListings].reduce((total, listing) => {
    return total + (listing.bonus?.[type] || 0);
  }, 0);
}

function upgradeTotal(maxLevel, baseCost, costStep) {
  let total = 0;
  for (let level = 1; level < maxLevel; level += 1) {
    total += baseCost + (level - 1) * costStep;
  }
  return total;
}

const realEstateCost = sum(realEstateListings, (item) => item.price);
const vehicleCost = sum(vehicleListings, (item) => item.price);
const itemCost = sum(itemListings, (item) => item.price);
const totalStoreCost = realEstateCost + vehicleCost + itemCost;
const fullBaseRent = sum(realEstateListings, (item) => item.rentPerHour);
const fullRentalBonusPercent = bonusTotal("rentalPercent");
const fullRent = Math.floor(fullBaseRent * (1 + fullRentalBonusPercent / 100));
const fullMachineCapacity =
  moneyMachineBaseCapacity +
  (moneyMachineMaxCapacityLevel - 1) * moneyMachineCapacityStep +
  bonusTotal("capacity");
const fullTapEarn =
  Math.min(
    moneyMachineMaxTapEarn,
    moneyMachineBaseTapEarn + (moneyMachineMaxTapLevel - 1) * moneyMachineTapEarnStep
  ) + bonusTotal("tap");
const fullPassiveEarn = moneyMachineEarnPerMinute + bonusTotal("passive");
const tapUpgradeCost = upgradeTotal(
  moneyMachineMaxTapLevel,
  moneyMachineTapUpgradeBaseCost,
  moneyMachineTapUpgradeCostStep
);
const capacityUpgradeCost = upgradeTotal(
  moneyMachineMaxCapacityLevel,
  moneyMachineCapacityUpgradeBaseCost,
  moneyMachineCapacityUpgradeCostStep
);
const systemCost = totalStoreCost + tapUpgradeCost + capacityUpgradeCost;
const rentCapHours = rentalIncomeCapacity / fullRent;
const machineCapMinutes = fullMachineCapacity / fullPassiveEarn;

const checks = [
  {
    label: "Starter ad can buy first property",
    ok: rewardedAdCredit >= realEstateListings[0].price,
    detail: `${money(rewardedAdCredit)} ad vs ${money(realEstateListings[0].price)} first property`,
  },
  {
    label: "Rental cap does not fill instantly at endgame",
    ok: rentCapHours >= 1,
    detail: `${rentCapHours.toFixed(1)} hours to fill rental cap`,
  },
  {
    label: "Money machine passive cap gives return loop",
    ok: machineCapMinutes >= 10,
    detail: `${machineCapMinutes.toFixed(1)} minutes to fill max machine`,
  },
  {
    label: "Full economy has long-term goals",
    ok: systemCost >= 1000000,
    detail: `${money(systemCost)} total store + upgrade sink`,
  },
];

console.log("Blackjack Life economy balance");
console.log("");
console.log(`Store total: ${money(totalStoreCost)}`);
console.log(`  Real estate: ${money(realEstateCost)}`);
console.log(`  Vehicles: ${money(vehicleCost)}`);
console.log(`  Items: ${money(itemCost)}`);
console.log(`Money Machine upgrades: ${money(tapUpgradeCost + capacityUpgradeCost)}`);
console.log(`  Tap upgrades: ${money(tapUpgradeCost)}`);
console.log(`  Storage upgrades: ${money(capacityUpgradeCost)}`);
console.log(`Total economy sink: ${money(systemCost)}`);
console.log("");
console.log(`Endgame rent: ${money(fullRent)}/hr (${fullRentalBonusPercent}% bonus)`);
console.log(`Rental cap: ${money(rentalIncomeCapacity)} fills in ${rentCapHours.toFixed(1)} hr at endgame`);
console.log(`Endgame machine: ${money(fullTapEarn)}/tap, ${money(fullPassiveEarn)}/min passive`);
console.log(
  `Machine cap: ${money(fullMachineCapacity)} fills in ${machineCapMinutes.toFixed(1)} min passively`
);
console.log("");
console.log(
  `Rewarded ads: ${money(rewardedAdCredit)} starter, ${money(rewardedAdMidCredit)} after ${money(
    rewardedAdMidWealth
  )} wealth, ${money(rewardedAdHighCredit)} after ${money(rewardedAdHighWealth)} wealth`
);
console.log("");
for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "WARN"} ${check.label} - ${check.detail}`);
}
