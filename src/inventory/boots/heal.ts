import { IInventoryItem, InventoryItem } from ".."
import { HealthSystem } from "@/systems/health"
import { GameObject } from "@/modules/object"
import { Game } from "@/main"

import HealHealthIcon from "/inventory/heal_health.png"

export default new class HealBoot extends InventoryItem implements IInventoryItem {
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