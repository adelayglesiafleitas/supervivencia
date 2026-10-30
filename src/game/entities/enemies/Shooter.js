import { Enemy } from './Enemy.js';
import { DIFF } from '../../data/difficulty.js';
import { Projectile } from '../Projectile.js';
import { moveBody } from '../../core/physics.js';
import { SHOOTER_ANIM as A, FLASH_ANIM as FX } from '../../data/animations.js';

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
    this.cd = (80 + Math.random() * 60) * DIFF.cd;
    this.shooting = 0;
    this.flash = null;
  }

  // Punta del cañón en coordenadas de mundo (el frame mira a la izquierda; face=1 lo voltea).
  muzzle(renderer) {
    const sh = renderer.assets.sheet(A.sheet);
    const f = sh?.frames[A.shoot];
    if (!f || f.mx === undefined) return { x: this.cx + this.face * 24, y: this.y + 24 };
    const d = (f.mx - f.ax) * sh.scale;
    return { x: this.cx - this.face * d, y: this.y + this.h + (f.my - f.h) * sh.scale };
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
    if (this.flash && ++this.flash.t >= FX.ticks) this.flash = null;
    if (this.cd <= 0 && arrived) {
      const m = this.muzzle(game.renderer);
      const ang = Math.atan2(p.y + p.h * 0.4 - m.y, p.cx - m.x);
      this.flash = { t: 0, ang, x: m.x, y: m.y, shape: Math.floor(Math.random() * FX.first.length) };
      game.enemyProjectiles.push(
        new Projectile({
          x: m.x,
          y: m.y,
          vx: Math.cos(ang) * 4.2,
          vy: Math.sin(ang) * 4.2,
          life: 200,
          team: 'enemy',
        }),
      );
      this.cd = (100 + Math.random() * 40) * DIFF.cd;
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
    if (this.flash) this.drawFlash(renderer);
  }

  drawFlash(renderer) {
    const fl = this.flash;
    const sheet = renderer.assets.sheet(FX.sheet);
    const f = sheet?.frames[fl.t < 3 ? FX.first[fl.shape] : fl.t < 5 ? FX.mid : FX.last];
    if (!f) return;
    const S = sheet.scale;
    const { ctx } = renderer;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.imageSmoothingEnabled = true;
    const m = this.muzzle(renderer);
    ctx.translate(m.x, m.y);
    ctx.rotate(fl.ang);
    ctx.drawImage(sheet.image, f.x, f.y, f.w, f.h, -f.ax * S, -f.ay * S, f.w * S, f.h * S);
    ctx.restore();
  }
}
