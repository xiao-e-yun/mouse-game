import { SingleTexture } from "@/modules/texture";
import { GameObject } from "@/modules/object";
import PlayerImage from "@bitmaps/player.png";
import { Game } from "@/main";
import { AttackSystem, AttackTarget } from "../systems/attack";
import { HealthSystem } from "../systems/health";
import { InventorySystem } from "@/systems/inventory";
import { SkillSystem } from "@/systems/skills";
import { audioManager } from "@/modules/audios";

export class Player extends GameObject {
  skillSystem: SkillSystem
  attackSystem: AttackSystem
  healthSystem: HealthSystem
  inventorySystem: InventorySystem

  constructor(private game: Game) {
    super(game, {
      position: [0, 0],
      size: [110, 80],
      texture: new SingleTexture(PlayerImage),
      view: {
        zIndex: 100,
      }
    });

    this.attackSystem = new AttackSystem(game, this, {
      targets: AttackTarget.Enemy, damage: 10, afterAttack: () => {
        audioManager.play("attack1");
        this.game.combat();
      }
    });
    this.healthSystem = new HealthSystem(this, { value: 30, invincible: 200 })

    // only for player
    this.inventorySystem = new InventorySystem(game, this, {

    })

    this.skillSystem = new SkillSystem(game, this, {
      cooldown: 2000,
      level: 1
    })

    this.setSystems([
      this.attackSystem,
      this.healthSystem,
      this.inventorySystem,
      this.skillSystem
    ])
  }


  control(mouse: [number, number], clicked: boolean) {
    this.position = mouse;
    if (clicked) this.skillSystem.call();
  }

  next(delta: number) {
    super.next(delta);
  }

  get health() {
    return this.getSystem(HealthSystem)!.inner;
  }

}
