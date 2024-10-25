export class Controller {
  mouse = [0, 0] as [number, number];
  clicked = false;
  constructor() {
    addEventListener("mousemove", (e) => {
      this.mouse = [e.clientX, e.clientY];
    })
    addEventListener("mousedown", () => {
      this.clicked = true;
    })
  }
  click() {
    const clicked = this.clicked;
    this.clicked = false;
    return clicked;
  }
  reset() {
    this.clicked = false;
  }
}