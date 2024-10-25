import FireBallImage from "@bitmaps/bullets/fireball.png";
import { AttackSystem, AttackTarget } from "@/systems/attack";
import { SingleTexture } from "@/modules/texture";
import { Bullet } from "../bullet";
import { Game } from "@/main";

export class FireBall extends Bullet {
  speed = 500;
  vector: [number, number];
  constructor(private game: Game, position: [number, number]) {
    super(game, {
      position: structuredClone(position),
      size: [64, 64],
      lifetime: 3000,
      texture: new SingleTexture(FireBallImage),
    });

    const target = this.game.player;
    const [x1, y1] = this.position;
    const [x2, y2] = target.position;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    this.vector = [Math.cos(angle), Math.sin(angle)];

    this.setSystems([new AttackSystem(game, this, { targets: AttackTarget.Player, damage: 5, afterAttack: () => this.destory() })]);
  }
  override next(delta: number): void {

    // Move towards the target

    this.position[0] += this.vector[0] * this.speed * delta / 1000;
    this.position[1] += this.vector[1] * this.speed * delta / 1000;

    super.next(delta);
  }
}