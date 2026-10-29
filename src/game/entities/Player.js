import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { moveBody, setHeight } from '../core/physics.js';
import { PHYSICS, PLAYER, WEAPONS } from '../config.js';
import { PLAYER_ANIM as A, FLASH_ANIM as FX } from '../data/animations.js';

const pick = (list, t, fps) => list[Math.floor(t * fps) % list.length];

function aimClass(a) {
  if (a.y < -0.5 && Math.abs(a.x) < 0.5) return 'up';
  if (a.y < -0.1) return 'upd';
  if (a.y > 0.1) return 'downd';
  return 'h';
}

export class Player extends Entity {
  constructor(world) {
    super({ w: PLAYER.w, h: PLAYER.h });
    this.world = world;
    this.clamp = false; // los límites los pone la cámara (ver update)
    this.reset();
  }

  reset(level) {
    const start = level?.playerStart;
    this.x = start ? start.x : this.world.w / 2 - PLAYER.w / 2;
    this.y = start ? start.y : 200;
    this.h = PLAYER.h;
    this.vx = 0;
    this.vy = 0;
    this.face = 1;
    this.onGround = false;
    this.prone = false;
    this.cd = 0;
    this.inv = PLAYER.startInvincibility;
    this.dead = false;
    this.deadT = 0;
    this.powers = []; // poderes guardados: [{ kind, ammo }], el primero es el que se usa
    this.jumpHeld = false;
    this.t = 0;
    this.airT = 0;
    this.airOff = 0;
    this.runPhase = 0;
    this.fireT = 99;
    this.aim = { x: 1, y: 0 };
    this.firing = 0;
    this.flash = null; // fogonazo activo { t, dx, dy, ang, shape }
  }

  // En niveles con scroll reaparece sobre una plataforma de la pantalla actual.
  respawn(game) {
    this.x = this.world.w / 2 - PLAYER.w / 2;
    if (game.level.scroll) {
      this.x = game.camera.x + 200;
      for (let i = 0; i < 40; i++) {
        const cx = game.camera.x + 180 + i * 24;
        if (game.level.platforms.some((q) => q.x <= cx && cx <= q.x + q.w)) {
          this.x = cx - PLAYER.w / 2;
          break;
        }
      }
    }
    this.y = -80;
    this.h = PLAYER.h;
    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.inv = PLAYER.respawnInvincibility;
    this.prone = false;
    this.t = 0;
    this.airT = 0;
    this.airOff = 0;
    this.runPhase = 0;
    this.fireT = 99;
  }

  // Guarda un poder si hay hueco. Devuelve true si lo cogió.
  addPower(kind) {
    if (this.powers.length >= PLAYER.powerSlots) return false;
    this.powers.push({ kind, ammo: WEAPONS[kind].ammo });
    return true;
  }

  update(game) {
    const { input, level, world } = game;

    if (this.dead) {
      this.deadT++;
      this.t += 1 / 60;
      this.vx *= 0.98;
      moveBody(this, level.platforms, world, true);
      this.limitToLevel(game);
      if (this.deadT > PLAYER.respawnDelay) game.onPlayerDied();
      return;
    }

    if (this.inv > 0) this.inv--;
    const l = input.isDown('left');
    const r = input.isDown('right');
    const u = input.isDown('up');
    const d = input.isDown('down');
    const jump = input.isDown('jump');
    const ax = (r ? 1 : 0) - (l ? 1 : 0);
    const ay = (d ? 1 : 0) - (u ? 1 : 0);
    if (ax) this.face = ax;

    this.prone = this.onGround && d && !ax && !u;
    setHeight(this, this.prone ? PLAYER.hProne : this.onGround ? PLAYER.h : PLAYER.hAir);
    this.vx = this.prone ? 0 : ax * PHYSICS.runSpeed;

    // salto / bajar de plataforma
    const onPlatform = !!this.standing && !this.standing.solid;
    const drop = d && jump && this.onGround && onPlatform;
    if (jump && !this.jumpHeld && this.onGround && !(d && onPlatform)) {
      this.vy = PHYSICS.jumpVelocity;
      this.onGround = false;
    }
    if (!jump && this.vy < PHYSICS.jumpCutVelocity) this.vy = PHYSICS.jumpCutVelocity; // salto variable
    this.jumpHeld = jump;

    // dirección de disparo (8 direcciones)
    let aimX = ax;
    let aimY = ay;
    if (this.prone) {
      aimX = this.face;
      aimY = 0;
    } else if (!ax && !ay) {
      aimX = this.face;
      aimY = 0;
    } else if (!ax && ay > 0 && this.onGround) {
      aimX = this.face;
      aimY = 0;
    }
    const m = Math.hypot(aimX, aimY) || 1;
    this.aim = { x: aimX / m, y: aimY / m };

    moveBody(this, level.platforms, world, drop);
    this.limitToLevel(game);
    if (level.killY && this.y > level.killY) return this.hurt(game, true); // cayó al agua
    if (drop) {
      this.y += 3;
      this.onGround = false;
    }

    this.cd--;
    if (this.firing > 0) this.firing--;
    if (this.flash && ++this.flash.t >= FX.ticks) this.flash = null;
    if (this.cd <= 0) {
      if (input.isDown('power') && this.powers.length) this.usePower(game);
      else if (input.isDown('fire')) this.shoot(game, 'normal');
    }

    this.t += 1 / 60;
    this.fireT += 1 / 60;
    if (this.onGround) {
      this.airT = 0;
      this.airOff = 0;
      this.runPhase = (this.runPhase + Math.abs(this.vx) / A.runStride(this.aim.y < -0.1 ? 'u' : 'h')) % 1;
    } else {
      if (this.airT === 0) this.airOff = this.vy < -1 ? 0 : A.jumpFallStart;
      this.airT += 1 / 60;
    }
  }

  // No puede salir por la izquierda de la cámara ni por el final del nivel.
  limitToLevel(game) {
    const maxX = (game.level.width ?? game.world.w) - this.w;
    this.x = Math.max(game.camera.x, Math.min(maxX, this.x));
  }

  usePower(game) {
    const power = this.powers[0];
    this.shoot(game, power.kind);
    if (--power.ammo <= 0) this.powers.shift(); // se gasta y pasa el siguiente
  }

  shoot(game, weaponKey) {
    const weapon = WEAPONS[weaponKey];
    const a = this.aim;
    const cy = this.y + (this.prone ? this.h * 0.4 : this.h * 0.36);
    let gx = this.cx + a.x * PLAYER.muzzleOffset;
    let gy = cy + a.y * PLAYER.muzzleOffset;
    // Si el sprite actual trae la punta del cañón, la bala sale de ahí.
    const sh = this.curSheet;
    const pf = sh?.frames[this.curFrame];
    if (pf && pf.mx !== undefined && this.onGround) {
      gx = this.cx + this.face * (pf.mx - pf.ax) * sh.scale;
      gy = this.y + this.h + (pf.my - pf.h) * sh.scale;
    }
    const base = Math.atan2(a.y, a.x);
    for (const o of weapon.angles) {
      game.projectiles.push(
        new Projectile({ x: gx, y: gy, vx: Math.cos(base + o) * 13, vy: Math.sin(base + o) * 13, life: 70, team: 'player' }),
      );
    }
    this.cd = weapon.cooldown;
    this.firing = 6;
    this.fireT = 0;
    this.flash = { t: 0, dx: gx - this.cx, dy: gy - this.y, ang: base, shape: Math.floor(Math.random() * FX.first.length) };
  }

  hurt(game, force = false) {
    if ((this.inv > 0 && !force) || this.dead) return;
    this.dead = true;
    this.deadT = 0;
    this.t = 0;
    setHeight(this, PLAYER.h);
    this.vy = -8;
    this.vx = -this.face * 2;
    game.particles.burst(this.x + 13, this.y + 30, 14, '#ff5a3c');
  }

  // Motion blur: estela de copias translúcidas de las últimas poses cuando va rápido.
  drawTrail(renderer) {
    const tr = (this.trail ??= []);
    const cur = this.dead ? null : { x: this.x, y: this.y, w: this.w, h: this.h, face: this.face };
    const speed = Math.hypot(this.vx, this.onGround ? 0 : this.vy);
    const n = tr.length;
    if (cur && speed > 1.5) {
      const { ctx } = renderer;
      for (let i = 0; i < n; i++) {
        const g = tr[i];
        if (Math.abs(g.x - cur.x) + Math.abs(g.y - cur.y) < 3) continue;
        ctx.save();
        ctx.globalAlpha = 0.07 + 0.07 * (i / n);
        renderer.drawFrame(A.sheet, g.frame, g, g.mode);
        ctx.restore();
      }
    }
  }

  pushTrail() {
    const tr = (this.trail ??= []);
    if (this.dead || !this.curFrame) return void (tr.length = 0);
    tr.push({ x: this.x, y: this.y, w: this.w, h: this.h, face: this.face, frame: this.curFrame, mode: this.curMode });
    if (tr.length > 5) tr.shift();
  }

  draw(renderer) {
    this.drawTrail(renderer);
    this.drawBody(renderer);
    this.pushTrail();
    if (this.flash && !this.dead) this.drawFlash(renderer);
  }

  // Fogonazo: una forma al azar, luego una más pequeña y otra casi apagada. Mezcla aditiva.
  drawFlash(renderer) {
    const sheet = renderer.assets.sheet(FX.sheet);
    const fl = this.flash;
    const name = fl.t < 3 ? FX.first[fl.shape] : fl.t < 5 ? FX.mid : FX.last;
    const f = sheet?.frames[name];
    if (!f) return;
    const S = sheet.scale;
    const { ctx } = renderer;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.imageSmoothingEnabled = true;
    // Posición: la punta del cañón del frame que se está dibujando (si el atlas la trae).
    const pSheet = renderer.assets.sheet(A.sheet);
    const pf = pSheet?.frames[this.curFrame];
    let px = this.cx + fl.dx;
    let py = this.y + fl.dy;
    let ang = fl.ang;
    if (pf && pf.mx !== undefined) {
      const k = pSheet.scale;
      px = this.cx + this.face * (pf.mx - pf.ax) * k;
      py = this.y + this.h + (pf.my - pf.h) * k;
      const up = this.curFrame.startsWith('fire_u') || this.curFrame.startsWith('run_u') || this.curFrame.startsWith('run_d');
      if (!up) ang = this.face > 0 ? 0 : Math.PI;
    }
    ctx.translate(px, py);
    ctx.rotate(ang);
    ctx.drawImage(sheet.image, f.x, f.y, f.w, f.h, -f.ax * S, -f.ay * S, f.w * S, f.h * S);
    ctx.restore();
  }

  drawBody(renderer) {
    if (this.inv > 0 && Math.floor(this.inv / 4) % 2 && !this.dead) return; // parpadeo
    const draw = (frame, mode = 'foot') => {
      this.curFrame = frame;
      this.curMode = mode;
      this.curSheet = renderer.assets.sheet(A.sheet);
      return renderer.drawFrame(A.sheet, frame, this, mode);
    };
    const last = (list, i) => list[Math.max(0, Math.min(list.length - 1, i))];

    if (this.dead) return draw(last(A.dead, Math.floor(this.t * A.fps.dead)));
    if (!this.onGround) return draw(last(A.jump, Math.floor(this.airT * A.fps.jump) + this.airOff), 'center');
    if (this.prone) return draw(pick(A.prone, this.t, A.fps.prone));

    const cls = aimClass(this.aim);
    if (Math.abs(this.vx) > 0.1) {
      const list = cls === 'h' && this.fireT < A.fireHold ? A.runFire : A.run[cls];
      return draw(list[Math.floor(this.runPhase * list.length) % list.length]);
    }
    const fire = A.fire[cls];
    if (fire) {
      const i = Math.floor(this.fireT * A.fireFps);
      if (i < fire.length) return draw(fire[i]);
      if (cls === 'up') return draw(fire[0]);
    }
    if (cls === 'h') return draw(pick(A.idle, this.t, A.fps.idle));
    return draw(A.stand[cls]);
  }
}
