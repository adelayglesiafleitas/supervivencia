import { Enemy } from './Enemy.js';
import { moveBody } from '../../core/physics.js';
import { PHYSICS } from '../../config.js';
import { LEAPER_ANIM as A } from '../../data/animations.js';

// Alien que persigue al jugador y sube de plataforma en plataforma saltando para alcanzarlo.
export class Leaper extends Enemy {
  constructor(game) {
    super('leaper');
    const { side, x, y } = Enemy.pickSide(game, this.h);
    this.x = x;
    this.y = y;
    this.face = -side;
    this.speed = this.stats.speed + game.waves.number * 0.04;
    this.jumpCd = 30; // frames de espera tras aterrizar antes de volver a saltar
    this.landX = null; // X donde quiere aterrizar mientras salta
  }

  // Plataforma a la que saltar para acercarse al jugador, o null si no hace falta / no llega.
  findTarget(game, feet, playerFeet) {
    const reach = (PHYSICS.jumpVelocity * PHYSICS.jumpVelocity) / (2 * PHYSICS.gravity) - 15;
    const p = game.player;
    let best = null;
    for (const pl of game.level.platforms) {
      const dy = feet - pl.y;
      if (dy < 20 || dy > reach) continue; // por encima de él y al alcance de un salto
      if (pl.y < playerFeet - 12) continue; // no pasarse de la altura del jugador
      const dist = Math.abs(pl.x + pl.w / 2 - p.cx);
      if (!best || pl.y < best.pl.y - 5 || (Math.abs(pl.y - best.pl.y) <= 5 && dist < best.dist)) best = { pl, dist };
    }
    return best?.pl ?? null;
  }

  update(game) {
    const p = game.player;
    const g = PHYSICS.gravity;
    this.t += 1 / 60;
    const feet = this.y + this.h;
    const playerFeet = p.y + p.h;
    this.face = p.cx - this.cx > 0 ? 1 : -1;

    if (this.onGround) {
      this.landX = null;
      if (this.jumpCd > 0) this.jumpCd--;
      this.vx = this.face * this.speed;
      if (playerFeet < feet - 30) {
        const target = this.findTarget(game, feet, playerFeet);
        if (target) {
          const mid = target.x + target.w / 2;
          if (this.cx > target.x - 70 && this.cx < target.x + target.w + 70) {
            this.vx = 0; // quieto hasta poder saltar (para no caerse del borde)
            if (this.jumpCd > 0) { moveBody(this, game.level.platforms, game.world, false); return; }
            // salta: justo la altura necesaria para llegar a la plataforma
            const need = feet - target.y + 25;
            this.vy = -Math.sqrt(2 * g * need);
            this.landX = Math.min(Math.max(this.cx, target.x + 14), target.x + target.w - 14);
            this.jumpCd = 12;
          } else {
            this.vx = Math.sign(mid - this.cx) * this.speed; // acércate a la plataforma
          }
        }
      }
    } else if (this.landX !== null) {
      // en el aire: se dirige al punto de aterrizaje
      const dx = this.landX - this.cx;
      this.vx = Math.abs(dx) > 4 ? Math.sign(dx) * this.speed * 1.4 : 0;
    }

    moveBody(this, game.level.platforms, game.world, playerFeet > feet + 20);
  }

  draw(renderer) {
    let frame;
    if (!this.onGround) frame = this.vy < 0 ? A.up : A.glide;
    else frame = A.run[Math.floor(this.t * A.fps) % A.run.length];
    renderer.drawFrame(A.sheet, frame, this, 'foot', '#16a085', A.native);
  }
}
