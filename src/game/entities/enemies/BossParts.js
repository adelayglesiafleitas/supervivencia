import { Enemy } from './Enemy.js';
import { DIFF, scaleHp } from '../../data/difficulty.js';
import { Shooter } from './Shooter.js';
import { Projectile } from '../Projectile.js';

// Piezas de la fortaleza final: 2 cañones, el núcleo (solo vulnerable sin cañones) y el francotirador.
// El dibujo lo hace LevelObjects (la imagen de la fortaleza); aquí solo hay vida, disparos y daño.

export class BossCannon extends Enemy {
  constructor(boss, d) {
    super('wallTurret');
    this.boss = boss;
    this.w = d.w;
    this.h = d.h;
    this.x = d.cx - d.w / 2;
    this.y = d.cy - d.h / 2;
    this.mx = d.mx;
    this.my = d.my;
    this.hp = scaleHp(d.hp);
    this.score = 1000;
    this.harmless = true;
    this.cd = 60 + d.delay;
    this.shots = 0;
    this.flashT = 0;
  }

  takeDamage(n = 1) {
    this.hp -= n;
    this.flashT = 4;
    return this.hp <= 0;
  }

  update(game) {
    if (this.flashT > 0) this.flashT--;
    const p = game.player;
    if (p.dead || this.cx > game.camera.x + game.world.w || Math.abs(p.cx - this.cx) > 700) return;
    if (--this.cd > 0) return;
    const dx = p.cx - this.mx;
    const dy = p.y + p.h * 0.4 - this.my;
    const a = Math.round(Math.atan2(dy, dx) / (Math.PI / 12)) * (Math.PI / 12);
    game.enemyProjectiles.push(new Projectile({ x: this.mx, y: this.my, vx: Math.cos(a) * 3.6, vy: Math.sin(a) * 3.6, life: 300, team: 'enemy' }));
    if (++this.shots >= 3) {
      this.shots = 0;
      this.cd = (100 + Math.random() * 40) * DIFF.cd;
    } else this.cd = 10;
  }

  draw() {}
}

export class BossCore extends Enemy {
  constructor(boss, d) {
    super('sensor');
    this.boss = boss;
    this.w = d.w;
    this.h = d.h;
    this.x = d.cx - d.w / 2;
    this.y = d.cy - d.h / 2;
    this.hp = scaleHp(d.hp);
    this.maxHp = this.hp;
    this.score = 8000;
    this.harmless = true;
    this.flashT = 0;
  }

  takeDamage(n = 1) {
    if (this.boss.cannons.some((c) => c.hp > 0)) {
      this.boss.shieldT = 6; // escudo: los cañones deben caer primero
      return false;
    }
    this.hp -= n;
    this.flashT = 4;
    return this.hp <= 0;
  }

  update() {
    if (this.flashT > 0) this.flashT--;
  }

  draw() {}
}

// Francotirador del tejado: quieto, dispara rápido y preciso. Si muere, llega otro al rato.
export class FortressSniper extends Shooter {
  constructor(game, x, y) {
    super(game);
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.hp = 3;
    this.score = 600;
    this.cd = 70;
  }

  update(game) {
    super.update(game);
    // tras disparar espera algo más que un soldado normal, pero con tiro más rápido
    if (this.shooting === 10) this.cd = (95 + Math.random() * 30) * DIFF.cd;
  }
}
