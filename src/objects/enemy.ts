import { ObjectView } from "@/modules/render";
import { GameObject } from "@/modules/object";
import EnemyImage from "@bitmaps/enemy.png";
import { SingleTexture } from "@/modules/texture";

export class Enemy extends GameObject {
  health = 20;
  destoryed = false;

  constructor(position: [number, number]) {
    super([97, 64], new SingleTexture(EnemyImage));
    this.setPosition(position);

    this.timers.record("attack", Math.random() * this.attackCooldown);

    const healthBar = (() => {
      const size = [this.size[0] / 20 * this.health, 4] as [number, number];
      const position = [this.position[0], this.position[1] + this.size[1] / 2 + 8] as [number, number];
      const texture = new SingleTexture(`data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoIAAgAAgA0JaACdLoB+AADsAD+8Oj3/yC5YXXI1/8gP+MqfGVP+PIAAAA=`)
      return new ObjectView(size, position, texture, this.zIndex, "")
    })()

    this.views = [healthBar]
  }

  override next(delta: number): void {
    super.next(delta);

    this.renderFilter = "";

    if (!this.timers.ready("damaged")) this.renderFilter = "brightness(50%)";

    const attackLeft = this.timers.get("attack");
    if (attackLeft <= 500) this.renderFilter = `brightness(${1 + (1 - attackLeft / 500)})`;

    this.views[0].size[0] = this.size[0] / 20 * this.health;
  }
}
