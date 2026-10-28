// Bucle de paso fijo: la lógica siempre va a 60 pasos/s, el dibujo a la velocidad del monitor.
export class Loop {
  constructor({ stepMs, update, render }) {
    this.stepMs = stepMs;
    this.update = update;
    this.render = render;
    this.running = false;
    this.raf = 0;
    this.acc = 0;
    this.last = 0;
    this.tick = (now) => {
      if (!this.running) return;
      this.acc += Math.min(100, now - this.last);
      this.last = now;
      while (this.acc >= this.stepMs) {
        this.update();
        this.acc -= this.stepMs;
      }
      this.render();
      this.raf = requestAnimationFrame(this.tick);
    };
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.acc = 0;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
}
