import { Entity } from './Entity.js';
import { PHYSICS } from '../config.js';

// Objeto que cae al morir un enemigo. Por ahora solo existe el arma "spread".
export class Pickup extends Entity {
  constructor(x, y, kind = 'spread') {
    super({ x, y, w: 26, h: 16 });
    this.kind = kind;
    this.taken = false;
  }

  update(game) {
    this.vy += PHYSICS.gravity * 0.6;
    this.y += this.vy;
    for (const pl of game.level.platforms) {
      if (
        this.x + this.w > pl.x &&
        this.x < pl.x + pl.w &&
        this.y + this.h >= pl.y &&
        this.y + this.h < pl.y + 20 &&
        this.vy > 0
      ) {
        this.y = pl.y - this.h;
        this.vy = 0;
      }
    }
  }

  draw(renderer) {
    const { ctx } = renderer;
    ctx.fillStyle = '#ff3c6e';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('S', this.x + 9, this.y + 12);
  }
}
