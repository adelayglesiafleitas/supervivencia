import { Entity } from './Entity.js';
import { PHYSICS } from '../config.js';

const LETTERS = { spread: 'S' }; // arma -> letra de la cápsula

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
    const letter = LETTERS[this.kind] ?? 'S';
    const frame = `cap_${letter}_${Math.floor(performance.now() / 120) % 4}`;
    if (renderer.assets.sheet('capsules')?.frames[frame]) {
      // el sprite es más grande que la caja de colisión: se dibuja centrado
      renderer.drawFrame('capsules', frame, { ...this, face: 1 }, 'foot');
      return;
    }
    ctx.fillStyle = '#ff3c6e';
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('S', this.x + 9, this.y + 12);
  }
}
