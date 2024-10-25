import { ObjectView } from "./render";
import { SingleTexture, Texture } from "./texture";

export class GameObject {
  position = [NaN, NaN] as [number, number];
  size = [NaN, NaN] as [number, number];
  texture: Texture
  health = 1;
  renderFilter = "";
  zIndex = 0;
  views: ObjectView[] = [];

  destoryed = false;
  timers = new Timer;

  constructor(size: [number, number], texture: Texture = SingleTexture.default) {
    this.size = size;
    this.texture = texture;
  }

  next(delta: number): void {
    this.timers.tick(delta);
  }

  setPosition(position: [number, number]) {
    this.position = position;
  }

  setSize(size: [number, number]) {
    this.size = size;
  }

  //
  invincibleTime = 200;
  damaged(damage: number) {
    if (!this.timers.ready("damaged")) return
    this.health -= damage;
    this.timers.record("damaged", this.invincibleTime);
    if (this.health <= 0) this.destroy();
  }

  // Attack
  attackDamage = 10;
  attackCooldown = 2000;
  attack(): number | undefined {
    if (!this.timers.ready("attack")) return;
    this.timers.record("attack", this.attackCooldown);
    return this.attackDamage;
  }

  //
  destroy() {
    this.destoryed = true;
  }

  // AABB collision detection
  collision(other: GameObject) {
    const [x1, y1] = this.position;
    const [w1, h1] = this.size;
    const [x2, y2] = other.position;
    const [w2, h2] = other.size;

    return Math.abs(x1 - x2) < (w1 + w2) / 2 && Math.abs(y1 - y2) < (h1 + h2) / 2;
  }
}

export class Timer {
  inner = new Map<string, number>();
  tick(delta: number) {
    for (const [name, time] of this.inner) {
      this.inner.set(name, time - delta);
    }
  }
  record(name: string, time: number) {
    this.inner.set(name, time);
  }
  ready(name: string) {
    return this.get(name)! <= 0;
  }
  get(name: string) {
    return this.inner.get(name) ?? 0;
  }
}