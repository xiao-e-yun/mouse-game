import { Game } from "@/main";
import { Enemy } from "../enemy";
import SlimeImage from "@bitmaps/enemies/slime.png";
import { SingleTexture } from "@/modules/texture";

export class Slime extends Enemy {
  constructor(game: Game, position: [number, number]) {
    super(game, {
      position,
      damage: 10,
      health: 20,
      cooldown: 2000,
      size: [97, 64],
      texture: new SingleTexture(SlimeImage),
    });
  }
}
