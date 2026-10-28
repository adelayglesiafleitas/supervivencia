export class Particles {
  constructor() {
    this.list = [];
  }

  burst(x, y, n, color) {
    for (let i = 0; i < n; i++) {
      this.list.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.7) * 6,
        life: 25 + Math.random() * 15,
        color,
      });
    }
  }

  update() {
    for (const q of this.list) {
      q.x += q.vx;
      q.y += q.vy;
      q.vy += 0.25;
      q.life--;
    }
    this.list = this.list.filter((q) => q.life > 0);
  }

  draw(ctx) {
    for (const q of this.list) {
      ctx.fillStyle = q.color;
      ctx.fillRect(q.x, q.y, 3, 3);
    }
  }

  clear() {
    this.list = [];
  }
}
