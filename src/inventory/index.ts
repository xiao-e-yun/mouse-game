import { Game } from "@/main"
import { GameObject } from "@/modules/object"
import { AttackSystem } from "@/systems/attack"
import { HealthSystem } from "@/systems/health"
import { SkillSystem } from "@/systems/skills"
import { Timer } from "@/modules/utils"
import { RenderObject } from "@/modules/render"
import { SingleTexture } from "@/modules/texture"

import EmptyIcon from "/inventory/empty.png"

import PowerIcon from "/inventory/power.png"
import CooldownIcon from "/inventory/cooldown.png"
import HealHealthIcon from "/inventory/heal_health.png"
import MoreRockExplosionIcon from "/inventory/more_rock_explosion.png"
import ShieldImage from "/inventory/shield.png"

import ShieldActiveImage from "/bitmaps/items/shield.png"


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
    new class ReduceCooldownItem extends InventoryItem implements IInventoryItem {
      id = "base.cooldown"
      name = "Reduce Cooldown"

      coefficient = 2

      getDescription(_level: number): string {
        return `Reduce half cooldown`
      }
      getIcon() { return CooldownIcon }
      next() { }
      added(_: Game, object: GameObject) {
        const skill = object.getSystem(SkillSystem)
        if (!skill) throw Error("Does not have skill system")
        skill.cooldown /= this.coefficient
      }
      upgrade(_: Game, object: GameObject) {
        const skill = object.getSystem(SkillSystem)
        if (!skill) throw Error("Does not have skill system")
        skill.cooldown /= this.coefficient
      }
      maxLevel() { return 3 }
    },
    new class MoreRockExplosionItem extends InventoryItem implements IInventoryItem {
      id = "base.more_rock_explosion"
      name = "More Rock EXPLOSION"

      getDescription(level: number): string {
        return `Increase skill range by ${level}`
      }
      getIcon() { return MoreRockExplosionIcon }
      next() { }
      added(_: Game, object: GameObject) {
        const skill = object.getSystem(SkillSystem)
        if (!skill) throw Error("Does not have skill system")
        skill.level += 1
      }
      upgrade(_: Game, object: GameObject) {
        const skill = object.getSystem(SkillSystem)
        if (!skill) throw Error("Does not have skill system")
        skill.level += 1
      }
      maxLevel() { return 3 }
    },
    new class ShieldItem extends InventoryItem implements IInventoryItem {
      id = "base.shield"
      name = "Shield"
      
      coefficient = 2

      active = true
      recharge = 2000
      record = new Timer(this.recharge)
      texture = new SingleTexture(ShieldActiveImage)
      renderObject = new RenderObject([0,0], [100,100], this.texture).setIndex(101)

      getDescription(level: number): string {
        const recharge = this.recharge / (level === 1 ? 1 : this.coefficient) / 1000
        return `Shield prevents damage once every ${recharge}s`
      }
      getIcon() { return ShieldImage }
      next(_game: Game, object: GameObject, delta: number) {
        this.record.tick(delta);
        if (this.active) {
          const [x,y] = object.position
          this.renderObject.position = [x,y]
        } else {
          this.action(object)
        }
      }
      added(_game: Game, object: GameObject) {
        this.action(object)

        const health = object.getSystem(HealthSystem)!

        health.beforeDamage.add((damage: number) => {
          if (this.record.running()) return damage

          object.view.removeSubObjects("shield")
          this.record.set(this.recharge);
          this.record.start();
          this.active = false
          return 0
        })
      }
      upgrade(_game: Game, _object: GameObject) {
        this.recharge /= this.coefficient
      }
      maxLevel() { return 3 }

      action(object: GameObject) {
        if (this.record.running()) return
        this.active = true

        const [x,y] = object.position
        this.renderObject.position = [x,y]

        object.view.setSubObjects("shield", [this.renderObject])
      }
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