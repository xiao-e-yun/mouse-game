export class Bar {
  max: number;
  value: number;
  constructor(value: number, max?: number) {
    this.value = value;
    this.max = max ?? value;
  }
  set(value: number) {
    this.value = value;
  }
  setMax(value: number) {
    this.max = value;
  }
  add(value: number) {
    this.value += value;
    if (this.value > this.max) this.value = this.max;
  }
  sub(value: number) {
    this.value -= value;
    if (this.value < 0) this.value = 0;
  }
  increase(value: number) {
    this.max += value;
    this.value += value;
  }
  decrease(value: number) {
    this.max -= value;
    if (this.max < this.value) this.value = this.max;
  }
  percent() {
    return this.value / this.max;
  }
}

export class Timers {
  inner = new Map<string, number>();
  tick(delta: number) {
    for (const [name, time] of this.inner) {
      const left = time - delta;
      if (left <= 0) this.inner.delete(name);
      else this.inner.set(name, left);
    }
  }
  record(name: string, time: number) {
    this.inner.set(name, time);
  }
  running(name: string) {
    return this.inner.has(name);
  }
  done(name: string) {
    return !this.inner.has(name);
  }
  get(name: string) {
    return this.inner.get(name) ?? 0;
  }
}

export class Timer {
  default: number
  current: number
  constructor(time: number) {
    this.default = time;
    this.current = 0;
  }
  tick(delta: number) {
    this.current -= delta;
  }
  set(time: number) {
    this.default = time;
  }
  start() {
    this.current = this.default;
  }
  done() {
    return this.current <= 0;
  }
  running() {
    return this.current > 0;
  }
  get() {
    return Math.max(this.current,0);
  }
  infinity() {
    this.current = Infinity;
  }

  static from(time?: number) {
    return time ? new Timer(time) : undefined;
  }
}