import { inventoryItems } from "./items"
import { inventoryBoots } from "./boots"

export function getAllUpgrades() {
  return [
    ...inventoryItems,
    ...inventoryBoots,
  ].map(item => new item());
}