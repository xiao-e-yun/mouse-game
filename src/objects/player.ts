import { SingleTexture } from "@/modules/texture";
import { GameObject } from "@/modules/object";
import EnemyImage from "@bitmaps/player.png";

export class Player extends GameObject {
  health = 30;
  constructor() {
    super([16, 80], new SingleTexture(EnemyImage));
    this.zIndex = 100;
  }

  override next(delta: number): void {
    super.next(delta);
  }
}
