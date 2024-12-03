import { IInventoryItem, InventoryItem } from "../utils"
import { AttackSystem } from "@/systems/attack"
import { GameObject } from "@/modules/object"
import { Game } from "@/main"

import PowerIcon from "/inventory/power.png"

export default new class MorePowerItem extends InventoryItem implements IInventoryItem {
  id = "base.power"
  name = "More Power"

  coefficient = 5

  getDescription(_: number): string {
    return `Increase damage by ${this.coefficient}`
  }
  getIcon() { return PowerIcon }
  next() { }
  added(_game: Game, object: GameObject) { object.getSystem(AttackSystem)!.damage += this.coefficient }
  upgrade(_game: Game, object: GameObject) { object.getSystem(AttackSystem)!.damage += this.coefficient }
  maxLevel() { return 6 }
}