import { GameObject } from "@/modules/object";
import { Texture } from "@/modules/texture";
import { Game } from "@/main";
import { AttackSystem, AttackTarget } from "../systems/attack";
import { HealthSystem } from "../systems/health";
import { RenderObject } from "@/modules/render";

export class Enemy extends GameObject {
  attackSystem: AttackSystem;
  healthSystem: HealthSystem;
  healthBar: RenderObject;
  constructor(protected game: Game, options: {
    position: [number, number],
    size: [number, number],
    damage: number,
    cooldown: number,
    texture: Texture,
    health: number,
  }) {
    super(game, {
      position: options.position,
      texture: options.texture,
      size: options.size,
    });

    this.attackSystem = new AttackSystem(game, this, { targets: AttackTarget.Player, damage: options.damage, cooldown: options.cooldown });
    this.healthSystem = new HealthSystem(this, { value: options.health, invincible: 200 });

    this.setSystems([
      this.attackSystem,
      this.healthSystem,
    ])

    this.healthBar = this.healthSystem.getHealthBar()
    this.view.setSubObjects("healthBar", [this.healthBar]);
  }

  override next(delta: number): void {
    super.next(delta);

    let filter = "";

    if (this.healthSystem.isInvincible()) filter = "brightness(50%)";

    const attackLeft = this.attackSystem.cooldown!.get();
    if (attackLeft <= 300) {
      filter = `brightness(${1 + (1 - attackLeft / 300)})`;
    }

    this.view.filters = [filter];

    const [position, size] = this.healthSystem.getHealthBarPlace();
    this.healthBar.setPosition(position);
    this.healthBar.setSize(size);
  }
}
