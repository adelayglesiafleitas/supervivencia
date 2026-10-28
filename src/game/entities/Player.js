import { Entity } from './Entity.js';
import { Projectile } from './Projectile.js';
import { moveBody, setHeight } from '../core/physics.js';
import { PHYSICS, PLAYER } from '../config.js';
import { PLAYER_ANIM as A } from '../data/animations.js';

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
    this.reset();
  }

  reset() {
    this.x = this.world.w / 2 - PLAYER.w / 2;
    this.y = 200;
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
    this.weapon = 'normal';
    this.weaponT = 0;
    this.jumpHeld = false;
    this.t = 0;
    this.aim = { x: 1, y: 0 };
    this.firing = 0;
  }

  respawn() {
    this.x = this.world.w / 2 - PLAYER.w / 2;
    this.y = -80;
    this.h = PLAYER.h;
    this.vx = 0;
    this.vy = 0;
    this.dead = false;
    this.inv = PLAYER.respawnInvincibility;
    this.weapon = 'normal';
    this.weaponT = 0;
    this.prone = false;
    this.t = 0;
  }

  giveSpread() {
    this.weapon = 'spread';
    this.weaponT = PLAYER.spreadSeconds * 60;
  }

  update(game) {
    const { input, level, world } = game;

    if (this.dead) {
      this.deadT++;
      this.t += 1 / 60;
      this.vx *= 0.98;
      moveBody(this, level.platforms, world, true);
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
    const onPlatform = this.y + this.h < level.groundY - 10;
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
    if (drop) {
      this.y += 3;
      this.onGround = false;
    }

    this.cd--;
    if (this.firing > 0) this.firing--;
    if (input.isDown('fire') && this.cd <= 0) this.shoot(game);
    if (this.weaponT > 0 && --this.weaponT === 0) this.weapon = 'normal';

    this.t += 1 / 60;
  }

  shoot(game) {
    const a = this.aim;
    const cy = this.y + (this.prone ? this.h * 0.4 : this.h * 0.36);
    const gx = this.cx + a.x * PLAYER.muzzleOffset;
    const gy = cy + a.y * PLAYER.muzzleOffset;
    const base = Math.atan2(a.y, a.x);
    const angles = this.weapon === 'spread' ? [-0.3, -0.15, 0, 0.15, 0.3] : [0];
    for (const o of angles) {
      game.projectiles.push(
        new Projectile({ x: gx, y: gy, vx: Math.cos(base + o) * 13, vy: Math.sin(base + o) * 13, life: 70, team: 'player' }),
      );
    }
    this.cd = this.weapon === 'spread' ? PLAYER.fireCooldown.spread : PLAYER.fireCooldown.normal;
    this.firing = 6;
  }

  hurt(game) {
    if (this.inv > 0 || this.dead) return;
    this.dead = true;
    this.deadT = 0;
    this.t = 0;
    setHeight(this, PLAYER.h);
    this.vy = -8;
    this.vx = -this.face * 2;
    game.particles.burst(this.x + 13, this.y + 30, 14, '#ff5a3c');
  }

  draw(renderer) {
    if (this.inv > 0 && Math.floor(this.inv / 4) % 2 && !this.dead) return; // parpadeo
    const draw = (frame, mode = 'foot') => renderer.drawFrame(A.sheet, frame, this, mode);

    if (this.dead) return draw(A.dead[Math.min(A.dead.length - 1, Math.floor(this.t * A.fps.dead))]);
    if (!this.onGround) return draw(pick(A.jump, this.t, A.fps.jump), 'center');
    if (this.prone) return draw(A.prone[0]);

    const cls = aimClass(this.aim);
    if (Math.abs(this.vx) > 0.1) return draw(pick(A.run[cls], this.t, A.fps.run));
    let frame = A.stand[cls][0];
    if (this.firing > 0 && A.standFire[cls]) frame = A.standFire[cls];
    return draw(frame);
  }
}
