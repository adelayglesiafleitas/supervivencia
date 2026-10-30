import { DIFF } from '../../data/difficulty.js';
import { Enemy } from './Enemy.js';
import { Projectile } from '../Projectile.js';
import { TURRET_ANIM as A } from '../../data/animations.js';

// Mortero fijo en el suelo: lanza proyectiles en parábola. (Desactivado en waves.js por ahora.)
export class Turret extends Enemy {
  constructor(game) {
    super('turret');
    this.x = 80 + Math.random() * 800;
    this.y = game.level.groundY - this.h;
    this.onGround = true;
    this.cd = (90 + Math.random() * 60) * DIFF.cd;
    this.openT = 0;
    game.particles.burst(this.x + this.w / 2, game.level.groundY - 10, 10, '#c0392b');
  }

  update(game) {
    const p = game.player;
    this.t += 1 / 60;
    this.face = p.x - this.x > 0 ? 1 : -1;
    this.cd--;
    if (this.openT > 0) this.openT--;
    if (this.cd <= 0) {
      const sx = this.cx;
      const sy = this.y + 6;
      const T = 55;
      const g = 0.25;
      const tx = p.cx;
      const ty = p.y + p.h * 0.5;
      game.enemyProjectiles.push(
        new Projectile({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - 0.5 * g * T * T) / T, g, life: 200, team: 'enemy' }),
      );
      this.cd = (140 + Math.random() * 60) * DIFF.cd;
      this.openT = 40;
    }
  }

  draw(renderer) {
    const frame = this.openT > 0 ? A.open[Math.floor(this.t * A.fps) % A.open.length] : A.closed;
    renderer.drawFrame(A.sheet, frame, this, 'foot', '#c0392b');
  }
}
