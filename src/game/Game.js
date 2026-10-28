import { CONTROLS, PLAYER, RENDER, STEP_MS, WORLD } from './config.js';
import { EventBus } from './core/EventBus.js';
import { Input } from './core/Input.js';
import { Loop } from './core/Loop.js';
import { Renderer } from './core/Renderer.js';
import { level01 } from './data/levels/level01.js';
import { Player } from './entities/Player.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { Particles } from './systems/Particles.js';
import { WaveSystem } from './systems/WaveSystem.js';
import { drawLevel } from './render/drawLevel.js';

const inBounds = (b, w, h) => b.life > 0 && b.x > -20 && b.x < w + 20 && b.y > -20 && b.y < h;

// Orquesta una partida. No sabe nada de React: la interfaz se comunica con él
// solo por el bus de eventos ('hud', 'gameover') y los métodos start() / destroy().
export class Game {
  constructor({ canvas, assets, bus = new EventBus(), level = level01 }) {
    this.bus = bus;
    this.world = WORLD;
    this.level = level;
    this.input = new Input(CONTROLS);
    this.renderer = new Renderer(canvas, { world: WORLD, ...RENDER }, assets);
    this.player = new Player(WORLD);
    this.waves = new WaveSystem();
    this.collisions = new CollisionSystem();
    this.particles = new Particles();
    this.loop = new Loop({ stepMs: STEP_MS, update: () => this.update(), render: () => this.render() });
    this.state = 'idle'; // 'idle' | 'playing' | 'over'
    this.resetWorld();
    this.render(); // pinta el escenario vacío (menú)
  }

  resetWorld() {
    this.enemies = [];
    this.projectiles = []; // balas del jugador
    this.enemyProjectiles = [];
    this.pickups = [];
    this.particles.clear();
    this.player.reset();
    this.lives = PLAYER.lives;
    this.score = 0;
    this.time = 0; // frames
  }

  start() {
    this.resetWorld();
    this.state = 'playing';
    this.input.attach();
    this.waves.start(this);
    this.emitHud();
    this.loop.start();
  }

  destroy() {
    this.loop.stop();
    this.input.detach();
    this.bus.clear();
  }

  onPlayerDied() {
    this.lives--;
    if (this.lives <= 0) {
      this.state = 'over';
      this.emitHud();
      this.bus.emit('gameover', { score: this.score, wave: this.waves.number, seconds: Math.floor(this.time / 60) });
    } else {
      this.player.respawn();
    }
  }

  update() {
    if (this.state !== 'playing') return;
    this.time++;
    this.waves.tickBanner();

    this.player.update(this);
    if (this.state !== 'playing') return;

    this.waves.update(this);
    for (const e of this.enemies) e.update(this);
    for (const p of this.pickups) p.update(this);
    for (const b of this.projectiles) b.update();
    for (const b of this.enemyProjectiles) b.update();

    this.collisions.update(this);

    const { w, h } = this.world;
    this.projectiles = this.projectiles.filter((b) => inBounds(b, w, h));
    this.enemyProjectiles = this.enemyProjectiles.filter((b) => inBounds(b, w, h));
    this.enemies = this.enemies.filter((e) => !e.dead && e.x > -90 && e.x < w + 90);
    this.pickups = this.pickups.filter((k) => !k.taken);
    this.particles.update();

    if (this.time % 6 === 0) this.emitHud();
  }

  render() {
    const r = this.renderer;
    r.begin();
    drawLevel(r.ctx, this.level, this.world);
    for (const k of this.pickups) k.draw(r);
    for (const e of this.enemies) e.draw(r);
    this.player.draw(r);
    for (const b of this.projectiles) b.draw(r.ctx);
    for (const b of this.enemyProjectiles) b.draw(r.ctx);
    this.particles.draw(r.ctx);
  }

  getHud() {
    return {
      state: this.state,
      level: this.level.name,
      lives: this.lives,
      score: this.score,
      wave: this.waves.number,
      seconds: Math.floor(this.time / 60),
      powers: this.player.powers.map((p) => ({ kind: p.kind, ammo: p.ammo })),
      banner: this.waves.banner > 0 ? this.waves.number : 0,
    };
  }

  emitHud() {
    this.bus.emit('hud', this.getHud());
  }
}
