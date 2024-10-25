import { GameObject, GameObjectOptions } from "@/modules/object";
import { Timer } from "@/modules/utils";
import { Game } from "@/main";

export class Bullet extends GameObject {
  lifetime: Timer;
  constructor(game: Game, options: BulletOptions) {
    super(game, options);
    this.lifetime = new Timer(options.lifetime);
    this.lifetime.start();
  }
  next(delta: number): void {
    super.next(delta);
    this.lifetime.tick(delta);
    if (this.lifetime.done()) this.destory();
  }
}

export interface BulletOptions extends GameObjectOptions {
  lifetime: number;
}