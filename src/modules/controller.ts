export class Controller {
  mouse = [0, 0] as [number, number];
  constructor() {
    addEventListener("mousemove", (e) => {
      this.mouse = [e.clientX, e.clientY];
    })
  }
}