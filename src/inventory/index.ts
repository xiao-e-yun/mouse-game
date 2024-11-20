import { Game } from "@/main"
import { GameObject } from "@/modules/object"
import { AttackSystem } from "@/systems/attack"
import { HealthSystem } from "@/systems/health"
import { Player } from "@/objects/player"

import EmptyIcon from "/inventory/empty.png"

import PowerIcon from "/inventory/power.png"
import HealHealthIcon from "/inventory/heal_health.png"
import MoreRockExplosionIcon from "/inventory/more_rock_explosion.png"

export function getAllUpgrades() {
  return [
    new class MorePowerItem extends InventoryItem implements IInventoryItem {
      id = "base.power"
      name = "More Power"

      coefficient = 5

      getDescription(level: number): string {
        return `Increase damage by ${this.coefficient * level}`
      }
      getIcon() { return PowerIcon }
      next() { }
      added(_: Game, object: GameObject) { object.getSystem(AttackSystem)!.damage += this.coefficient }
      upgrade(_: Game, object: GameObject) { object.getSystem(AttackSystem)!.damage += this.coefficient }
      maxLevel() { return 6 }
    },
    new class MoreRockExplosionItem extends InventoryItem implements IInventoryItem {
      id = "base.more_rock_explosion"
      name = "More Rock EXPLOSION"

      getDescription(level: number): string {
        return `Increase skill range by ${level}`
      }
      getIcon() { return MoreRockExplosionIcon }
      next() { }
      added(_: Game, object: Player) { 
        if (!(object instanceof Player)) throw Error("Not a player")
        object.skillLevel += 1
      }
      upgrade(_: Game, object: Player) { 
        if (!(object instanceof Player)) throw Error("Not a player")
        object.skillLevel += 1
      }
      maxLevel() { return 3 }
    },
    new class HealBoot extends InventoryItem implements IInventoryItem {
      id = "boots.heal_health"
      name = "Heal"
      getIcon() { return HealHealthIcon }
      getDescription() { return "Heal 5 health" }

      added(_: Game, object: GameObject) { object.getSystem(HealthSystem)!.heal(5) }

      isOnce() { return true }

      // never called
      next() { }
      upgrade() { }
      maxLevel() { return 1 }
    }
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