import { Timer } from "@/modules/utils";
import { System } from ".";
import { GameObject } from "@/modules/object";
import { RockExplosion } from "@/objects/bullets/rock_explosion";
import { Game } from "@/main";

export class SkillSystem implements System {
  cooldown: number;
  level: number;
  record: Timer;
  constructor(private game: Game, private object: GameObject, options: {
    cooldown: number,
    level: number
  }) {
    this.cooldown = options.cooldown;
    this.level = options.level;
    this.record = new Timer(options.cooldown);
  }
  next(delta: number) {
    this.record.tick(delta);
  }
  call(force = false): boolean {
    const ready = force || this.record.done()
    if (!ready) return false

    this.record.set(this.cooldown);
    this.record.start();
    const position = this.object.position;
    const skill = new RockExplosion(this.game, position, this.level + 2);
    this.game.bullets.add(skill);
    return true;
  }
}