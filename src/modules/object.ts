import { RenderObject } from "./render";
import { Texture } from "./texture";
import { System } from "@/systems";
import { Game } from "@/main";

export class GameObject {
  id: number;
  destoryed = false;
  view: GameObjectView;
  #systems: Map<string, System> = new Map();

  constructor(game: Game, options: GameObjectOptions) {
    this.id = game.idRecord++; // Unique id

    const view = options.view ?? {};
    this.view = new GameObjectView(
      options.position,
      options.size,
      options.texture,
      view.zIndex ?? 0,
      view.filters ?? []
    );

  }

  next(delta: number): void {
    for (const system of this.#systems.values())
      system.next(delta)
  }

  destory() {
    this.destoryed = true;
  }

  get position(): [number, number] {
    return this.view.position;
  }

  set position(position: [number, number]) {
    this.view.position = position;
  }

  get size(): [number, number] {
    return this.view.size;
  }

  set size(size: [number, number]) {
    this.view.size = size;
  }

  // AABB collision detection
  collision(other: GameObject) {
    const [x1, y1] = this.position;
    const [w1, h1] = this.size;
    const [x2, y2] = other.position;
    const [w2, h2] = other.size;

    return Math.abs(x1 - x2) < (w1 + w2) / 2 && Math.abs(y1 - y2) < (h1 + h2) / 2;
  }

  setSystems(systems: System[]) {
    for (const system of systems)
      this.addSystem(system)
  }

  addSystem<T extends System>(system: T) {
    const name = system.constructor.name;
    if (this.#systems.has(name))
      throw new Error(`System ${name} already exists, when adding to ${this.constructor.name}`);
    this.#systems.set(name, system);
  }

  getSystem<T extends System>(type: new (...args: any[]) => T): T | undefined {
    return this.#systems.get(type.name) as T;
  }
}


export class GameObjectView {
  flipX = false;
  effects: [number, RenderObject[]][] = [];
  subObjects: Map<string, RenderObject[]> = new Map();

  constructor(
    public position: [number, number],
    public size: [number, number],
    public texture: Texture,
    public zIndex: number,
    public filters: string[],
  ) {

  }

  next(delta: number) {
    this.effects = this.effects.filter(timeAndEffect => {
      timeAndEffect[0] -= delta;
      return timeAndEffect[0] > 0;
    });
  }

  getMain(): RenderObject {
    return new RenderObject(this.position, this.size, this.texture)
      .setIndex(this.zIndex)
      .setFilter(this.filters)
      .setFlipX(this.flipX);
  }

  addEffect(effects: RenderObject[], keepTime: number) {
    this.effects.push([keepTime, effects]);
  }

  getEffects(): RenderObject[] {
    return this.effects.flatMap(([_, effect]) => effect);
  }

  setSubObjects(name: string, objects: RenderObject[]) {
    this.subObjects.set(name, objects);
  }

  getSubObjects(): RenderObject[] {
    return Array.from(this.subObjects.values()).flat();
  }

  removeSubObjects(name: string) {
    this.subObjects.delete(name);
  } 

  toRenderObject(): RenderObject[] {
    return [
      this.getMain(),
      ...this.getEffects(),
      ...this.getSubObjects()
    ]
  }
}
export interface GameObjectOptions {
  position: [number, number];
  size: [number, number];
  texture: Texture;
  view?: {
    zIndex?: number;
    filters?: string[];
  }
}