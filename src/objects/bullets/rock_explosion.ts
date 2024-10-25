import { Game } from "@/main";
import RockImage from "@bitmaps/bullets/rock.png";
import { Bullet } from "../bullet";
import { Timer } from "@/modules/utils";
import { SingleTexture } from "@/modules/texture";
import { AttackSystem, AttackTarget } from "@/systems/attack";

export class RockExplosion extends Bullet {
  offset = 64;
  generate = new Timer(80);
  constructor(private game: Game, position: [number, number], public vector?: [number, number] | undefined, public level = 4) {
    super(game, {
      position: structuredClone(position),
      lifetime: 500,
      size: new Array(2).fill(64 + (level * 8)) as [number, number],
      texture: new SingleTexture(RockImage),
    });

    this.generate.start();
    this.setSystems([new AttackSystem(game, this, { targets: AttackTarget.Enemy, damage: 20 + 5 * level, cooldown: Infinity, afterAttack: () => this.game.combat() })]);
  }
  next(delta: number): void {
    super.next(delta);

    this.generate.tick(delta);
    if (this.generate.done()) {
      this.generate.infinity();
      const vectors = this.vector ? [this.vector] : [
        [-1, 1], [1, 1],
        [-1, -1], [1, -1],
      ];
      this.generateExplosion(vectors as [number, number][]);
    }
  }
  generateExplosion(vectors: [number, number][]): void {
    if (this.level <= 0) return;
    for (const vector of vectors) {
      const [x, y] = this.position;
      let [dx, dy] = vector;

      this.game.bullets.add(new RockExplosion(
        this.game,
        [x + dx * this.offset, y + dy * this.offset],
        [dx, dy],
        this.level - 1
      ));
    }
  }
}