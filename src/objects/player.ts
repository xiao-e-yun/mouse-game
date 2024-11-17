import { SingleTexture } from "@/modules/texture";
import { GameObject } from "@/modules/object";
import PlayerImage from "@bitmaps/player.png";
import { Game } from "@/main";
import { AttackSystem, AttackTarget } from "../systems/attack";
import { HealthSystem } from "../systems/health";
import { Timer } from "@/modules/utils";
import { RockExplosion } from "./bullets/rock_explosion";
import { InventorySystem } from "@/systems/inventory";

export class Player extends GameObject {
  attackSystem: AttackSystem
  healthSystem: HealthSystem
  inventorySystem: InventorySystem
  skill = new Timer(3000);

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
        this.game.playAudioOnce("attack1");
        this.game.combat();
      }
    });
    this.healthSystem = new HealthSystem(this, { value: 30, invincible: 200 })

    // only for player
    this.inventorySystem = new InventorySystem(game, this, {

    })

    this.setSystems([
      this.attackSystem,
      this.healthSystem,
      this.inventorySystem,
    ])
  }


  control(mouse: [number, number], clicked: boolean) {
    this.position = mouse;
    if (clicked && this.skill.done()) {
      this.skill.start();
      this.game.bullets.add(new RockExplosion(this.game, this.position));
    }
  }

  next(delta: number) {
    super.next(delta);
    this.skill.tick(delta);
  }

  get health() {
    return this.getSystem(HealthSystem)!.inner;
  }

}
