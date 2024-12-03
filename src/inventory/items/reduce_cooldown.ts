import { IInventoryItem, InventoryItem } from "../utils"
import { SkillSystem } from "@/systems/skills";
import { GameObject } from "@/modules/object"
import { Game } from "@/main"

import CooldownIcon from "/inventory/cooldown.png"

export default new class ReduceCooldownItem extends InventoryItem implements IInventoryItem {
  id = "base.cooldown"
  name = "Reduce Cooldown"

  coefficient = 2

  getDescription(_level: number): string {
    return `Reduce half cooldown`
  }
  getIcon() { return CooldownIcon; }
  next() { }
  added(_: Game, object: GameObject) {
    const skill = object.getSystem(SkillSystem);
    if (!skill) throw Error("Does not have skill system");
    (skill as any).cooldown /= this.coefficient;
  }
  upgrade(_: Game, object: GameObject) {
    const skill = object.getSystem(SkillSystem)
    if (!skill) throw Error("Does not have skill system")
    skill.cooldown /= this.coefficient
  }
  maxLevel() { return 3 }
};