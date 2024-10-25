import DefaultImage from "@bitmaps/default.webp";

export const bitmapManager = new class BitmapManager {
  bitmaps = new Map<[string, undefined | string], ImageBitmap>();

  load(url: string, callback: (bitmap: ImageBitmap) => void, options: { id?: string } = {}) {
    const id = options.id;

    if (this.bitmaps.has([url, id])) callback(this.bitmaps.get([url, id])!);

    const image = new Image();
    image.onload = () => {
      createImageBitmap(image).then(bitmap => {
        this.bitmaps.set([url, id], bitmap)
        callback(bitmap);
      });
    }
    image.src = url;
  }

  clear() {
    this.bitmaps.clear();
  }
}

export const textureList = new Map<string, Texture>();
export function useTexture(name: string, init: () => Texture): Texture {
  if (!textureList.has(name)) textureList.set(name, init());
  return textureList.get(name)!;
}

//
//
//
export interface Texture {
  getBitmap(delta: number): ImageBitmap | undefined;
  position(): [number, number];
  size(): [number, number];
}

export class SingleTexture implements Texture {
  bitmap: ImageBitmap | undefined;
  imageSize: [number, number] = [0, 0];
  constructor(url: string) {
    bitmapManager.load(url, bitmap => {
      this.imageSize = [bitmap.width, bitmap.height];
      this.bitmap = bitmap
    });
  }
  getBitmap() {
    return this.bitmap;
  }
  position() {
    return [0, 0] as [number, number];
  }
  size() {
    return this.imageSize
  }
  static default = new SingleTexture(DefaultImage);
}

export class AnimationTexture implements Texture {
  bitmap: ImageBitmap | undefined;
  clipSize: [number, number];
  frames: number;
  fps: number;
  frame = 0;
  time = 0;

  constructor(url: string, size: [number, number], frames: number, fps: number) {
    this.clipSize = size;
    this.frames = frames;
    this.fps = fps;

    bitmapManager.load(url, bitmap => {
      this.bitmap = bitmap
    });
  }

  getBitmap(delta: number): ImageBitmap | undefined {
    this.time += delta;
    const oneFrame = 1000 / this.fps;
    this.frame = Math.floor(this.time / oneFrame + this.frame) % this.frames;
    this.time %= oneFrame;
    return this.bitmap;
  }

  position() {
    return [this.clipSize[0] * this.frame, 0] as [number, number];
  }

  size() {
    return this.clipSize
  }

  reset() {
    this.frame = 0;
    this.time = 0;
  }
}