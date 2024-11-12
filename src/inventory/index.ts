import { Game } from "@/main"
import { GameObject } from "@/modules/object"
import { AttackSystem } from "@/systems/attack"
import { HealthSystem } from "@/systems/health"

export function getAllUpgrades() {
  return [
    new class TestWeapon extends InventoryItem implements IInventoryItem {
      id = "base.power"
      name = "More Power"

      coefficient = 5

      getDescription(level: number): string {
        return `Increase damage by ${this.coefficient * level}`
      }
      getIcon() { return "/inventory/power.png" }
      next() {}
      added(_: Game, object: GameObject) { object.getSystem(AttackSystem)!.damage += this.coefficient }
      upgrade(_: Game, object: GameObject) { object.getSystem(AttackSystem)!.damage += this.coefficient }
      maxLevel() { return 6 }
    },
    new class TestWeapon extends InventoryItem implements IInventoryItem {
      id = "boots.heal_health"
      name = "Heal"
      getIcon() { return "/inventory/heal_health.png" }
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
}