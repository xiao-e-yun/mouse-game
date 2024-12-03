import { SingleTexture } from "@/modules/texture";
import { Bullet } from "../bullet";
import { Game } from "@/main";

import BombImage from "@bitmaps/bullets/bomb.png";
import BombBoomImage from "@bitmaps/bullets/bomb_boom.png";
import { AttackSystem, AttackTarget } from "@/systems/attack";
import { audioManager } from "@/modules/audios";

export class Bomb extends Bullet {
  height = 150;
  offsetY = 0;
  explosion = false;

  level: number;
  speed: number;
  vector: [number, number];

  static LIFE_TIME = 1000;
  static EXPLOSION_TIME = 200;
  constructor(private game: Game, position: [number, number], range: number, level: number) {
    super(game, {
      position: structuredClone(position),
      size: [72, 96],
      lifetime: Bomb.LIFE_TIME + Bomb.EXPLOSION_TIME,
      texture: new SingleTexture(BombImage),
    });

    this.speed = Math.random() * range / Bomb.LIFE_TIME * 1000;

    const angle = Math.random() * Math.PI * 2;
    this.vector = [Math.cos(angle), Math.sin(angle)];

    this.level = level;
  }
  override next(delta: number): void {
    this.move(delta);
    if (!this.explosion && this.lifetime.current <= Bomb.EXPLOSION_TIME ) {
      console.log('explosion')
      this.size = [256, 256];
      this.explosion = true;

      this.view.texture = new SingleTexture(BombBoomImage);
      audioManager.play("attack2"),
      this.setSystems([
        new AttackSystem(this.game, this, {
          afterAttack: () => this.game.combat(),
          targets: AttackTarget.Enemy,
          damage: 20 + 5 * this.level,
          cooldown: Infinity,
        })
      ]);
    }
    super.next(delta);
  }

  move(delta: number): void {
    if (this.explosion) return;
    this.position[0] += this.vector[0] * this.speed * delta / 1000;
    this.position[1] += this.vector[1] * this.speed * delta / 1000;

    // jump effect
    const left = this.lifetime.current - Bomb.EXPLOSION_TIME;
    const progress = 1 - left / Bomb.LIFE_TIME;
    const offsetY = Math.sin(progress * Math.PI)
    const offset = offsetY - this.offsetY // new offset - old offset
    this.offsetY = offsetY
    this.position[1] -= offset * this.height
  }
}