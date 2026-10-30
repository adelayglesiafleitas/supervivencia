import { Enemy } from './Enemy.js';
import { Projectile } from '../Projectile.js';
import { moveBody } from '../../core/physics.js';
import { SHOOTER_ANIM as A } from '../../data/animations.js';

// Camina hasta un punto del escenario, se planta y dispara apuntando al jugador.
export class Shooter extends Enemy {
  constructor(game) {
    super('shooter');
    const { side, x, y } = Enemy.pickSide(game, this.h);
    this.x = x;
    this.y = y;
    this.face = -side;
    this.speed = this.stats.speed;
    this.targetX = game.camera.x + 100 + Math.random() * 760;
    this.cd = 80 + Math.random() * 60;
    this.shooting = 0;
  }

  update(game) {
    const p = game.player;
    this.t += 1 / 60;
    this.face = p.x - this.x > 0 ? 1 : -1;
    const arrived = Math.abs(this.x - this.targetX) < 6;
    this.vx = arrived ? 0 : Math.sign(this.targetX - this.x) * this.speed;
    moveBody(this, game.level.platforms, game.world, false);
    this.cd--;
    if (this.shooting > 0) this.shooting--;
    if (this.cd <= 0 && arrived) {
      const sx = this.cx;
      const sy = this.y + 24;
      const ang = Math.atan2(p.y + p.h * 0.4 - sy, p.cx - sx);
      game.enemyProjectiles.push(
        new Projectile({
          x: sx + Math.cos(ang) * 24,
          y: sy + Math.sin(ang) * 24,
          vx: Math.cos(ang) * 4.2,
          vy: Math.sin(ang) * 4.2,
          life: 200,
          team: 'enemy',
        }),
      );
      this.cd = 100 + Math.random() * 40;
      this.shooting = 10;
    }
  }

  draw(renderer) {
    if (Math.abs(this.vx) > 0.1) {
      const frame = A.run[Math.floor(this.t * A.fps) % A.run.length];
      renderer.drawFrame(A.sheet, frame, this, 'foot', '#27ae60', A.runNative);
    } else {
      renderer.drawFrame(A.sheet, this.shooting > 0 ? A.shoot : A.stand, this, 'foot', '#27ae60', A.runNative);
    }
  }
}
