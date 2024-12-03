import { IInventoryItem, InventoryItem } from "../utils"
import { GameObject } from "@/modules/object"
import { Timer } from "@/modules/utils"
import { Game } from "@/main"

import BombImage from "/inventory/bomb.png"
import { Bomb } from "@/objects/bullets/bomb"

export class BombItem extends InventoryItem implements IInventoryItem {
  id = "base.bomb"
  name = "Bomb"

  coefficient = 2

  recharge = 2000
  record = new Timer(this.recharge)

  getDescription(level: number): string {
    const recharge = this.recharge / (level === 1 ? 1 : this.coefficient) / 1000
    return `Throw a bomb that deals damage to all enemies in the area, once every ${recharge}s`
  }
  next(game: Game, object: GameObject, delta: number) {
    this.record.tick(delta);
    if (this.record.running()) return
    this.record.set(this.recharge);
    this.record.start();

    const bomb = new Bomb(game, object.position, 250, this.level)
    game.bullets.add(bomb)


  }
  added(_game: Game, _object: GameObject) { }
  upgrade(_game: Game, _object: GameObject) {
    this.recharge /= this.coefficient
  }
  maxLevel() { return 5 }
  getIcon() { return BombImage }
}