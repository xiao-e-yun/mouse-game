import { GameObject } from "@/modules/object";
import { Game } from "@/main";
import { System } from ".";
import { Timer } from "@/modules/utils";
import { HealthSystem } from "./health";

export class AttackSystem implements System {
  targets: AttackTarget
  cooldown: Timer | undefined;
  damage: number;
  once: boolean;
  beforeAttack: ((target: GameObject) => void) | undefined;
  afterAttack: ((target: GameObject) => void) | undefined;

  constructor(private game: Game, private object: GameObject, options: {
    targets: AttackTarget
    cooldown?: number
    damage: number
    beforeAttack?: (target: GameObject) => void
    afterAttack?: (target: GameObject) => void
  }) {
    this.targets = options.targets;
    this.cooldown = Timer.from(options.cooldown);
    this.damage = options.damage;
    this.once = options.cooldown === Infinity;
    this.beforeAttack = options.beforeAttack;
    this.afterAttack = options.afterAttack;

    if (this.cooldown && !this.once)
      this.cooldown.current = (Math.random() / 2 + .5) * options.cooldown!;
  }

  attack() {
    const targets = this.getTargets();
    for (const target of targets) {
      if (target.destoryed) continue;
      if (!target.collision(this.object)) continue;
      // because each target type are implemented with HealthSystem
      if (this.beforeAttack) this.beforeAttack(target);
      const success = target.getSystem(HealthSystem)!.damaged(this.damage);
      if (this.afterAttack && success) this.afterAttack(target);
    }
  }

  setCooldown(cooldown: number) {
    this.cooldown = Timer.from(cooldown);
  }

  setDamage(damage: number) {
    this.damage = damage;
  }

  getCooldown() {
    return this.cooldown;
  }

  getDamage() {
    return this.damage;
  }

  getTargets() {
    const targets: GameObject[] = [];
    if (this.targets & AttackTarget.Enemy) targets.push(...this.game.enemies);
    if (this.targets & AttackTarget.Player) targets.push(this.game.player);
    return targets;
  }

  next(delta: number) {
    if (this.once && this.cooldown!.running()) return;

    if (this.cooldown) {
      this.cooldown.tick(delta);
      if (!this.cooldown.done()) return;
      this.cooldown.start();
    }
    this.attack()
  }
}

export enum AttackTarget {
  Player = 0b01,
  Enemy = 0b10,
}