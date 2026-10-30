import { Enemy } from './Enemy.js';
import { moveBody } from '../../core/physics.js';
import { PHYSICS } from '../../config.js';
import { LEAPER_ANIM as A } from '../../data/animations.js';

// Alien que persigue al jugador saltando de plataforma en plataforma.
// Es cuidadoso: nunca camina por el borde al vacío. Planifica el salto (alcance en altura y en
// distancia), camina hasta el borde correcto, salta y se dirige al punto de aterrizaje.
// Si no hay forma segura de acercarse, se queda esperando al borde en vez de tirarse al agua.
export class Leaper extends Enemy {
  constructor(game, type = 'leaper') {
    super(type);
    const { side, x, y } = Enemy.pickSide(game, this.h);
    this.x = x;
    this.y = y;
    this.face = -side;
    this.speed = (this.stats.speed ?? 2) + game.waves.number * 0.04;
    this.jumpCd = 30;
    this.landX = null; // X donde quiere aterrizar mientras está en el aire
    this.plan = null; // { pl, lx, jump } plataforma objetivo, punto de aterrizaje y si hay que saltar
  }

  // Qué tan cerca queda el jugador de esa plataforma (menor = mejor).
  static score(pl, p) {
    const cx = Math.min(Math.max(p.cx, pl.x), pl.x + pl.w);
    return Math.abs(cx - p.cx) + Math.abs(pl.y - (p.y + p.h)) * 0.6;
  }

  // ¿Puede pasar de la plataforma a a la b? Devuelve { from, lx, rise } o null.
  edge(a, b, reach, air) {
    const g = PHYSICS.gravity;
    const rise = a.y - b.y; // >0: b está más arriba
    if (rise > reach || rise < -460) return null;
    const lo = Math.max(a.x, b.x);
    const hi = Math.min(a.x + a.w, b.x + b.w);
    let from, lx, gap;
    if (hi - lo > 14) {
      from = lx = (lo + hi) / 2; // se solapan en horizontal: salto vertical
      gap = 0;
    } else if (b.x >= a.x + a.w) {
      from = a.x + a.w - 4;
      lx = b.x + 8;
      gap = lx - from;
    } else {
      from = a.x + 4;
      lx = b.x + b.w - 8;
      gap = from - lx;
    }
    const v0 = Math.sqrt(2 * g * Math.max(rise + 30, 14));
    const t = (v0 + Math.sqrt(Math.max(0, v0 * v0 - 2 * g * rise))) / g;
    if (gap > air * t - 8) return null;
    return { from, lx, rise };
  }

  // Busca (en anchura) la plataforma alcanzable más cercana al jugador y devuelve el primer salto del camino.
  choosePlan(game, cur) {
    if (!cur) return null;
    const vJ = -PHYSICS.jumpVelocity;
    const reach = (vJ * vJ) / (2 * PHYSICS.gravity) - 12;
    const air = this.speed * 1.7;
    const p = game.player;
    const near = game.level.platforms.filter((q) => Math.abs(q.x + q.w / 2 - this.cx) < 1100);
    const seen = new Map([[cur, null]]);
    let frontier = [cur];
    let best = { pl: cur, s: Leaper.score(cur, p), first: null };
    for (let depth = 0; depth < 7 && frontier.length; depth++) {
      const next = [];
      for (const a of frontier) {
        for (const b of near) {
          if (seen.has(b)) continue;
          const e = this.edge(a, b, reach, air);
          if (!e) continue;
          const first = a === cur ? { pl: b, ...e } : seen.get(a);
          seen.set(b, first);
          next.push(b);
          const sc = Leaper.score(b, p);
          if (sc < best.s - 25) best = { pl: b, s: sc, first };
        }
      }
      frontier = next;
    }
    return best.first;
  }

  update(game) {
    const p = game.player;
    const g = PHYSICS.gravity;
    this.t += 1 / 60;
    const feet = this.y + this.h;
    const playerFeet = p.y + p.h;
    let drop = false;

    if (this.onGround) {
      this.landX = null;
      if (this.jumpCd > 0) this.jumpCd--;
      const cur = this.standing;
      const toward = p.cx - this.cx > 0 ? 1 : -1;
      this.face = toward;
      this.vx = 0;
      const plan = this.choosePlan(game, cur);
      if (plan) {
        // ir hasta el punto de salida y saltar desde ahí
        const dx = plan.from - this.cx;
        if (Math.abs(dx) > 3) {
          this.vx = Math.sign(dx) * this.speed;
          this.face = Math.sign(dx);
        } else if (this.jumpCd <= 0) {
          if (plan.rise < -6 && plan.lx >= plan.pl.x && Math.abs(plan.lx - this.cx) < 30) {
            drop = true; // la plataforma de abajo está justo debajo: se deja caer
            this.landX = plan.lx;
          } else {
            this.vy = -Math.sqrt(2 * g * Math.max(plan.rise + 30, 14));
            this.landX = plan.lx;
            this.jumpCd = 12;
          }
        }
      } else if (cur) {
        // misma plataforma que el jugador (o sin mejor opción): acercarse sin caerse del borde
        const margin = 10;
        const lo = cur.x + margin;
        const hi = cur.x + cur.w - margin;
        const goal = Math.min(Math.max(p.cx, lo), hi);
        if (Math.abs(goal - this.cx) > 6) this.vx = Math.sign(goal - this.cx) * this.speed;
      }
      // seguridad: ningún paso lo saca de su plataforma si no va a saltar
      if (this.vx && cur && !plan) {
        const nx = this.cx + this.vx;
        if ((nx < cur.x + 6 || nx > cur.x + cur.w - 6)) this.vx = 0;
      }
    } else if (this.landX !== null) {
      const dx = this.landX - this.cx;
      this.vx = Math.abs(dx) > 4 ? Math.sign(dx) * this.speed * 1.7 : 0;
    }

    moveBody(this, game.level.platforms, game.world, drop);
    if (!this.onGround && drop) this.vx = 0;
  }

  draw(renderer) {
    let frame;
    if (!this.onGround) frame = this.vy < 0 ? A.up : A.glide;
    else frame = A.run[Math.floor(this.t * A.fps) % A.run.length];
    renderer.drawFrame(A.sheet, frame, this, 'foot', '#16a085', A.native);
  }
}
