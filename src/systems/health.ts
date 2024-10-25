import { GameObject } from "@/modules/object";
import { Bar, Timer } from "@/modules/utils";
import { System } from ".";
import { RenderObject } from "@/modules/render";
import { SingleTexture } from "@/modules/texture";

export class HealthSystem implements System {
  inner: Bar;
  #invincible: Timer | undefined;
  destroyOnDeath: boolean;
  repeatable: boolean;
  #repeatedDamaged = 0;
  constructor(private object: GameObject, options: {
    value: number,
    /** @default value */
    max?: number,
    /** @default 0 */
    invincible?: number
    /** @default false */
    repeatableDamaged?: boolean
    /** @default true */
    destroyOnDeath?: boolean
  }) {
    this.inner = new Bar(options.value, options.max);
    this.#invincible = Timer.from(options.invincible);
    this.repeatable = options.repeatableDamaged ?? false;
    this.destroyOnDeath = options.destroyOnDeath ?? true;
  }
  next(delta: number) {
    this.#repeatedDamaged--;
    if (this.#invincible) this.#invincible.tick(delta);
  }
  damaged(damage: number) {
    if (this.isDead()) return false;

    if (!this.repeatable) {
      const repeated = this.#repeatedDamaged > 0;
      this.#repeatedDamaged = 2;
      if (repeated) return false;
    }

    if (this.#invincible) {
      if (this.#invincible.running()) return false;
      this.#invincible.start();
    }

    this.inner.value -= damage;
    if (this.inner.value <= 0 && this.destroyOnDeath) this.object.destory();
    return true;
  }
  restore(value: number) {
    this.inner.value = value;
  }
  reduce(value: number) {
    this.inner.sub(value);
  }
  heal(value: number) {
    this.inner.add(value);
  }
  increase(value: number) {
    this.inner.increase(value);
  }
  decrease(value: number) {
    this.inner.decrease(value);
  }
  isInvincible() {
    return this.#invincible?.running() ?? false;
  }
  isDead() {
    return this.inner.value <= 0;
  }

  get value() {
    return this.inner.value;
  }

  get max() {
    return this.inner.max;
  }

  //view
  getHealthBar() {
    const [position, size] = this.getHealthBarPlace();
    const texture = new SingleTexture(`data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAADQAQCdASoIAAgAAgA0JaACdLoB+AADsAD+8Oj3/yC5YXXI1/8gP+MqfGVP+PIAAAA=`)
    return new RenderObject(position, size, texture)
  }
  getHealthBarPlace(): [[number, number], [number, number]] {
    const offset = 8;
    const height = 4;

    const $position = this.object.position;
    const $size = this.object.size;

    const w = $size[0] / this.max * this.value
    const h = height;
    const x = $position[0] - ($size[0] - w) / 2;
    const y = $position[1] + $size[1] / 2 + offset;
    return [[x, y], [w, h]]
  }
}