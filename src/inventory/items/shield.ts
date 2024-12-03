import { IInventoryItem, InventoryItem } from "../utils"
import { SingleTexture } from "@/modules/texture"
import { RenderObject } from "@/modules/render"
import { HealthSystem } from "@/systems/health"
import { Timer } from "@/modules/utils"

import ShieldImage from "/inventory/shield.png"
import ShieldActiveImage from "/bitmaps/items/shield.png"
import { GameObject } from "@/modules/object"
import { Game } from "@/main"

export default new class ShieldItem extends InventoryItem implements IInventoryItem {
  id = "base.shield"
  name = "Shield"

  coefficient = 2

  active = true
  recharge = 2000
  record = new Timer(this.recharge)
  texture = new SingleTexture(ShieldActiveImage)
  renderObject = new RenderObject([0, 0], [100, 100], this.texture).setIndex(101)

  getDescription(level: number): string {
    const recharge = this.recharge / (level === 1 ? 1 : this.coefficient) / 1000
    return `Shield prevents damage once every ${recharge}s`
  }
  getIcon() { return ShieldImage }
  next(_game: Game, object: GameObject, delta: number) {
    this.record.tick(delta);
    if (this.active) {
      const [x, y] = object.position
      this.renderObject.position = [x, y]
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

    const [x, y] = object.position
    this.renderObject.position = [x, y]

    object.view.setSubObjects("shield", [this.renderObject])
  }
}