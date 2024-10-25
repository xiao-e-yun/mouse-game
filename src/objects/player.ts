import { SingleTexture } from "@/modules/texture";
import { GameObject } from "@/modules/object";
import PlayerImage from "@bitmaps/player.png";

export class Player extends GameObject {
  health = 30;
  constructor() {
    super([110, 80], new SingleTexture(PlayerImage));
    this.zIndex = 100;
  }

  override next(delta: number): void {
    super.next(delta);
  }
}
