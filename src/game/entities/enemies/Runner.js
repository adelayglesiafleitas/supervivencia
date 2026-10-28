import { Enemy } from './Enemy.js';
import { moveBody } from '../../core/physics.js';
import { PHYSICS } from '../../config.js';
import { RUNNER_ANIM as A } from '../../data/animations.js';

// Corre hacia el jugador. Muere de un tiro y salta si el jugador está en una plataforma.
export class Runner extends Enemy {
  constructor(game) {
    super('runner');
    const { side, x, y, chase } = Enemy.pickSide(game, this.h);
    this.x = x;
    this.y = y;
    this.face = -side;
    this.chase = chase; // false: cruza el escenario en línea recta
    this.speed = 2 + Math.random() * 0.8 + game.waves.number * 0.05;
  }

  update(game) {
    const p = game.player;
    this.t += 1 / 60;
    if (this.chase) {
      this.face = p.x - this.x > 0 ? 1 : -1;
      if (this.onGround && p.y + p.h < this.y + this.h - 40 && Math.random() < 0.02) this.vy = PHYSICS.jumpVelocity;
    }
    this.vx = this.face * this.speed;
    moveBody(this, game.level.platforms, game.world, p.y > this.y + 20);
  }

  draw(renderer) {
    const frame = this.onGround ? A.run[Math.floor(this.t * A.fps) % A.run.length] : A.air;
    renderer.drawFrame(A.sheet, frame, this, 'foot', '#c0392b', A.native);
  }
}
