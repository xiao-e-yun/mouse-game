import { GameObject } from "./object";
import BackgroundImage from "@bitmaps/background.png";
import { SingleTexture, Texture } from "./texture";

export class Render {
  // 畫布
  canvas = document.getElementById("game") as HTMLCanvasElement;
  ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
  offscreenCanvas = new OffscreenCanvas(0, 0);
  offscreenCtx: OffscreenCanvasRenderingContext2D;
  constructor() {
    this.resize()
    this.offscreenCanvas;
    this.offscreenCtx = this.offscreenCanvas.getContext("2d")!
    addEventListener("resize", () => this.resize());
  }
  draw(delta: number, viewport: ViewPort) {
    this.setTransformToViewport(viewport);
    this.drawBackground(delta, viewport);
    this.drawObjects(delta, viewport);

    this.drawOnScreen();
  }
  drawOnScreen() {
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }
  resize() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.ctx.imageSmoothingEnabled = false;
    this.setTransformToCanvas();
  }
  //
  setTransformToViewport(viewport: ViewPort) {
    const viewportChanged = this.offscreenCanvas.width !== viewport.size[0] || this.offscreenCanvas.height !== viewport.size[1];
    if (viewportChanged) {
      this.offscreenCanvas.width = viewport.size[0];
      this.offscreenCanvas.height = viewport.size[1];
      this.offscreenCtx.imageSmoothingEnabled = false;
      this.setTransformToCanvas();
    }

    const offsetX = viewport.position[0];
    const offsetY = viewport.position[1];
    const centerX = offsetX - (viewport.size[0] / 2);
    const centerY = offsetY - (viewport.size[1] / 2);
    this.offscreenCtx.setTransform(
      1, 0, 0, 1, -centerX, -centerY
    );
  }
  setTransformToCanvas() {
    // try draw viewport contain canvas
    const [viewportW, viewportH] = [this.offscreenCanvas.width, this.offscreenCanvas.height];
    const [canvasW, canvasH] = [this.canvas.width, this.canvas.height];
    const viewportScale = viewportW / viewportH;
    const canvasScale = canvasW / canvasH;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    if (canvasScale > viewportScale) {
      scale = canvasH / viewportH;
      offsetX = (canvasW - viewportW * scale) / 2;
    } else {
      scale = canvasW / viewportW;
      offsetY = (canvasH - viewportH * scale) / 2;
    }

    this.ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  }
  drawObjects(delta: number, viewport: ViewPort) {
    const objects = viewport.flush();
    const ctx = this.offscreenCtx;
    let lastFilter = "";
    for (const object of objects) {
      object.texture.getBitmap(delta);
      const bitmap = object.texture.getBitmap(delta);
      const [bitmapX, bitmapY] = object.texture.position();
      const [bitmapW, bitmapH] = object.texture.size();
      if (!bitmap) continue;
      const x = object.position[0] - object.size[0] / 2;
      const y = object.position[1] - object.size[1] / 2;

      const filters = object.filters.join(" ");
      if (lastFilter !== filters) ctx.filter = filters || "none";
      this.offscreenCtx.drawImage(bitmap, bitmapX, bitmapY, bitmapW, bitmapH, x, y, object.size[0], object.size[1]);
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

    this.offscreenCtx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, x, y, viewport.size[0], viewport.size[1]);

    // const pattern = this.ctx.createPattern(bitmap, "repeat");
    // if (!pattern) return;

    // this.ctx.rect(x, y, viewport.size[0], viewport.size[1]);
    // // this.ctx.rect(x, y, viewport.size[0], viewport.size[1]);
    // this.ctx.fillStyle = pattern;
    // this.ctx.fill();
  }
  // absolute position => relative position (-1~1)
  mapFromScreen([x, y]: [number, number], viewport: ViewPort): [number, number] {
    const [viewportW, viewportH] = viewport.size;
    let [canvasW, canvasH] = [this.canvas.width, this.canvas.height];

    let offsetX = 0;
    let offsetY = 0;
    if (canvasW / canvasH > viewportW / viewportH) {
      const space = (canvasW - viewportW * canvasH / viewportH);
      offsetX = space / 2;
      canvasW -= space;
    } else {
      const space = (canvasH - viewportH * canvasW / viewportW);
      offsetY = space / 2;
      canvasH -= space;
    }

    const relativeX = (x - offsetX) * viewportW / canvasW;
    const relativeY = (y - offsetY) * viewportH / canvasH;

    const absoluteX = Math.max(Math.min(relativeX, viewportW), 0) - viewportW / 2;
    const absoluteY = Math.max(Math.min(relativeY, viewportH), 0) - viewportH / 2;

    return [absoluteX, absoluteY];
  }
  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.setTransformToCanvas();
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