import { Game } from "@/main";
import { Enemy } from "../enemy";
import { AnimationTexture } from "@/modules/texture";
import DogImage from "@bitmaps/enemies/dog.webp";

export class Dog extends Enemy {
  speed = 150;
  constructor(game: Game, position: [number, number]) {
    super(game, {
      position,
      size: [84, 84],
      texture: new AnimationTexture(DogImage,[512, 512], 30, 5),
      
      health: 15,
      damage: 5,
      cooldown: 2000,
    });

  }
  next(delta: number): void {
    super.next(delta);

    const target = this.game.player;
    const [x1, y1] = this.position;
    const [x2, y2] = target.position;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    this.position[0] += Math.cos(angle) * this.speed * delta / 1000;
    this.position[1] += Math.sin(angle) * this.speed * delta / 1000;

  }
}
