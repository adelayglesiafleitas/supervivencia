import { Enemy } from './Enemy.js';
import { Projectile } from '../Projectile.js';

const CFG = {
  turret: { stat: 'wallTurret', sheet: 'turret', pre: 'tur_', cd: 80, burst: 3 },
  sensor: { stat: 'sensor', sheet: 'sensor', pre: 'sen_', cd: 70, burst: 1 },
};

// Torreta de pared / caja sensor: cerrada hasta que el jugador se acerca, luego se abre y dispara.
// Cerrada es invulnerable. No hace daño por contacto. Al destruirse enseña la explosión un rato.
export class WallTurret extends Enemy {
  constructor(game, def) {
    const c = CFG[def.kind];
    super(c.stat);
    this.c = c;
    this.x = def.x - this.w / 2;
    this.y = def.y - this.h / 2;
    this.cyc = def.y; // centro de la placa
    this.state = 'closed';
    this.st = 0;
    this.cd = 40;
    this.shots = 0;
    this.flashT = 0;
    this.deathT = 0;
    this.harmless = true;
    this.maxHp = this.hp;
  }

  get dead() {
    return this.hp <= 0 && this.deathT <= 0;
  }

  takeDamage(n = 1) {
    if (this.state !== 'open' || this.hp <= 0) return false;
    this.hp -= n;
    if (this.hp <= 0) {
      this.deathT = 45;
      return true;
    }
    return false;
  }

  update(game) {
    this.t += 1 / 60;
    if (this.hp <= 0) {
      this.deathT--;
      if (this.deathT % 8 === 0) game.particles.burst(this.cx + (Math.random() - 0.5) * 30, this.cyc + (Math.random() - 0.5) * 30, 6, '#ff9a3c');
      return;
    }
    const p = game.player;
    const dx = p.cx - this.cx;
    const near = Math.abs(dx) < 560 && this.cx > game.camera.x && this.cx < game.camera.x + game.world.w;
    if (this.state === 'closed' && near && !p.dead) {
      this.state = 'opening';
      this.st = 0;
    } else if (this.state === 'opening') {
      if (++this.st > 18) this.state = 'open';
    } else if (this.state === 'open') {
      if (this.flashT > 0) this.flashT--;
      if (p.dead) return;
      if (--this.cd <= 0) {
        this.fire(game, p);
        if (++this.shots >= this.c.burst) {
          this.shots = 0;
          this.cd = this.c.cd + Math.random() * 40;
        } else this.cd = 9;
      }
    }
  }

  fire(game, p) {
    const dx = p.cx - this.cx;
    const dy = p.y + p.h * 0.45 - this.cyc;
    const d = Math.hypot(dx, dy) || 1;
    const sp = 3.4;
    // el cañón gira en pasos de 15°: se cuantiza el ángulo para que parezca mecánico
    const a = Math.round(Math.atan2(dy, dx) / (Math.PI / 12)) * (Math.PI / 12);
    const vx = Math.cos(a) * sp;
    const vy = Math.sin(a) * sp;
    game.enemyProjectiles.push(new Projectile({ x: this.cx + Math.cos(a) * 16, y: this.cyc + Math.sin(a) * 16, vx, vy, life: 260, team: 'enemy' }));
    this.flashT = 6;
    void d;
  }

  draw(renderer) {
    const { ctx } = renderer;
    const sheet = renderer.assets.sheet(this.c.sheet);
    if (!sheet?.frames) return;
    let n;
    if (this.hp <= 0) n = 5;
    else if (this.state === 'closed') n = 0;
    else if (this.state === 'opening') n = this.st < 9 ? 1 : 2;
    else n = this.flashT > 0 ? 3 : this.hp <= this.maxHp / 2 ? 4 : 2;
    const f = sheet.frames[this.c.pre + n];
    if (!f) return;
    const S = sheet.scale ?? 0.5;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(sheet.image, f.x, f.y, f.w, f.h, this.cx - f.ax * S, this.cyc - f.ay * S, f.w * S, f.h * S);
    ctx.restore();
  }
}
