import { GameObject } from "./object";
import BackgroundImage from "@bitmaps/background.png";
import { SingleTexture, Texture } from "./texture";

export class Render {
  // 畫布
  canvas = document.getElementById("game") as HTMLCanvasElement;
  ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  constructor() {
    const canvas = this.canvas;
    const ctx = this.ctx;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.imageSmoothingEnabled = false;
  }
  draw(delta: number, viewport: ViewPort) {
    // this.clear();
    this.setTransformToViewport(viewport);
    this.drawBackground(delta, viewport);
    this.drawObjects(delta, viewport);
  }
  //
  setTransformToViewport(viewport: ViewPort) {
    const ctx = this.ctx;
    const scale = this.canvas.height / viewport.size[1];
    const offsetX = viewport.position[0];
    const offsetY = viewport.position[1];
    const centerX = offsetX - (this.canvas.width / 2);
    const centerY = offsetY - (this.canvas.height / 2);
    ctx.setTransform(
      scale, 0, 0, scale, -centerX, -centerY
    );
  }
  drawObjects(delta: number, viewport: ViewPort) {
    const objects = viewport.flush();
    const ctx = this.ctx;
    let lastFilter = "";
    for (const object of objects) {
      object.texture.getBitmap(delta);
      const bitmap = object.texture.getBitmap(delta);
      if (!bitmap) continue;
      const x = object.position[0] - object.size[0] / 2;
      const y = object.position[1] - object.size[1] / 2;

      const filters = object.filters.join(" ");
      if (lastFilter !== filters) ctx.filter = filters || "none";
      this.ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, x, y, object.size[0], object.size[1]);
      lastFilter = filters;
    }
    if (lastFilter !== "") ctx.filter = "none";
  }
  drawBackground(delta: number, viewport: ViewPort) {
    const background = viewport.getBackground();

    const bitmap = background.getBitmap(delta);
    if (!bitmap) return;

    const x = viewport.position[0] - viewport.size[0] / 2;
    const y = viewport.position[1] - viewport.size[1] / 2;

    this.ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, x, y, viewport.size[0], viewport.size[1]);
    
    // const pattern = this.ctx.createPattern(bitmap, "repeat");
    // if (!pattern) return;

    // this.ctx.rect(x, y, viewport.size[0], viewport.size[1]);
    // // this.ctx.rect(x, y, viewport.size[0], viewport.size[1]);
    // this.ctx.fillStyle = pattern;
    // this.ctx.fill();
  }
  // absolute position => relative position (-1~1)
  mapFromScreen([x, y]: [number, number]): [number, number, number] {
    x = x / this.canvas.width * 2 - 1;
    y = y / this.canvas.height * 2 - 1;

    const ratio = this.canvas.width / this.canvas.height;
    return [x, y, ratio];
  }
  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

export class ViewPort {
  size: [number, number];
  position = [0, 0] as [number, number];
  background: Texture = new SingleTexture(BackgroundImage);
  objects: GameObject[] = []

  constructor(size: [number, number]) {
    this.size = size;
  }

  setSize(size: [number, number]) {
    this.size = size;
  }

  setPosition(position: [number, number]) {
    this.position = position;
  }

  add(object: GameObject) {
    this.objects.push(object);
  }

  flush() {
    const objects = this.objects.map(object => object.view.toRenderObject()).flat();

    objects.sort((a, b) => {
      //sort by z-index
      const zIndex = a.zIndex - b.zIndex;
      if (zIndex !== 0) return zIndex;

      //sort by y
      return (a.position[1] + a.size[1] / 2) - (b.position[1] + b.size[1] / 2)
    });
    this.objects = [];
    return objects;
  }

  getBackground() {
    return this.background;
  }

  setBackground(background: Texture) {
    this.background = background;
  }
  // relative position (-1~1) => absolute position
  mapToViewport([x, y, ratio]: [number, number, number]): [number, number] {
    const viewportRatio = this.size[0] / this.size[1];
    const scaleRatio = ratio / viewportRatio;
    x = Math.max(Math.min(x * scaleRatio, 1), -1);

    x = this.position[0] + x * this.size[0] / 2;
    y = this.position[1] + y * this.size[1] / 2;

    return [x, y]
  }
}

export class RenderObject {
  constructor(
    position: [number, number],
    size: [number, number],
    texture: Texture,
  ) {
    this.position = position;
    this.size = size;
    this.texture = texture;
  }

  setPosition(position: [number, number]) {
    this.position = position;
    return this;
  }

  setSize(size: [number, number]) {
    this.size = size;
    return this;
  }

  setTexture(texture: Texture) {
    this.texture = texture;
    return this;
  }

  setIndex(zIndex: number) {
    this.zIndex = zIndex;
    return this;
  }

  setFilter(filters: string[] | string) {
    if (typeof filters === "string") filters = [filters];
    else this.filters = filters;
    return this;
  }
  
  addFilter(filter: string) {
    this.filters.push(filter);
    return this;
  }

  removeFilter(filter: string) {
    this.filters = this.filters.filter(f => f !== filter);
    return this;
  }

  clone() {
    return structuredClone(this);
  }

  texture: Texture;
  size: [number, number];
  position: [number, number];
  zIndex: number = 0;
  filters: string[] = [];
}