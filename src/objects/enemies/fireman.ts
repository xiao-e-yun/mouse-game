import { Game } from "@/main";
import { Enemy } from "../enemy";
import { Timer } from "@/modules/utils";
import { FireBall } from "../bullets/fireball";
import { SingleTexture } from "@/modules/texture";
import FireManImage from "@bitmaps/enemies/fireman.png";

export class FireMan extends Enemy {
  skill = new Timer(2000);
  constructor(game: Game, position: [number, number]) {
    super(game, {
      position,
      size: [80, 84],
      texture: new SingleTexture(FireManImage),
      
      health: 30,
      damage: 30,
      cooldown: 10000,
    });

    this.skill.current = 2000 * (Math.random() / 2 + .5);
  }
  next(delta: number): void {
    super.next(delta);
    this.skill.tick(delta);
    if (this.skill.done()) {
      this.skill.start();
      this.game.bullets.add(new FireBall(this.game, this.position));
    }
    
    const skillLeft = this.skill.get();
    if (skillLeft <= 300) {
      this.view.filters = [`brightness(${1 - (0.5 - skillLeft / 300 * .5)})`];
    }
  }
}
