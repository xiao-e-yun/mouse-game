import { Game } from "@/main"
import { GameObject } from "@/modules/object"

import { inventoryItems } from "./items"
import { inventoryBoots } from "./boots"

import EmptyIcon from "/inventory/empty.png"


export function getAllUpgrades() {
  return [
    ...inventoryItems,
    ...inventoryBoots,
  ]
}

export type InventoryItemType = IInventoryItem & InventoryItem

export interface IInventoryItem {
  id: string
  name: string
  next(game: Game, object: GameObject, delta: number): void
  upgrade(game: Game, object: GameObject): void
  added(game: Game, object: GameObject): void
  getDescription(level: number): string
  maxLevel(): number
  getIcon(): string
  isOnce(): boolean
}

export class InventoryItem {
  public id: string = "unknown"
  public level: number = 1
  public has = false

  upgradeable(): boolean {
    return this.level < this.maxLevel()
  }

  displayLevel(next?: boolean) {
    const level = this.level + (next ? 1 : 0);
    if (this.isOnce()) return "BOOT";
    if (!this.has) return "NEW";
    if (level === this.maxLevel()) return "MAX";
    return level;
  }

  // default max level is 6
  maxLevel(): number { return 6 }
  isOnce(): boolean { return false }

  static emptyIcon = EmptyIcon
}