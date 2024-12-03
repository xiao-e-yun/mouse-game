import { IInventoryItem, InventoryItem } from ".."
import { SkillSystem } from "@/systems/skills"
import { GameObject } from "@/modules/object"
import { Game } from "@/main"

import MoreRockExplosionIcon from "/inventory/more_rock_explosion.png"

export default new class MoreRockExplosionItem extends InventoryItem implements IInventoryItem {
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
}