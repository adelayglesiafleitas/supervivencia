import { CONTROLS, PLAYER, RENDER, STEP_MS, WORLD } from './config.js';
import { EventBus } from './core/EventBus.js';
import { Input } from './core/Input.js';
import { Loop } from './core/Loop.js';
import { Music } from './core/Music.js';
import { Renderer } from './core/Renderer.js';
import { LEVELS } from './data/levels/index.js';
import { Player } from './entities/Player.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { LevelObjects } from './systems/LevelObjects.js';
import { Particles } from './systems/Particles.js';
import { StreamSystem } from './systems/StreamSystem.js';
import { WaveSystem } from './systems/WaveSystem.js';
import { drawLevel } from './render/drawLevel.js';

const inBounds = (b, cam, w, h) => b.life > 0 && b.x > cam - 20 && b.x < cam + w + 20 && b.y > -20 && b.y < h;

// Orquesta una partida. No sabe nada de React: la interfaz se comunica con él
// solo por el bus de eventos ('hud', 'gameover') y los métodos start() / destroy().
export class Game {
  constructor({ canvas, assets, bus = new EventBus(), level = LEVELS.survival }) {
    this.bus = bus;
    this.world = WORLD;
    this.level = level;
    this.camera = { x: 0 }; // esquina izquierda de lo que se ve (niveles con scroll)
    this.input = new Input(CONTROLS);
    this.renderer = new Renderer(canvas, { world: WORLD, ...RENDER }, assets);
    this.player = new Player(WORLD);
    this.waves = new WaveSystem();
    this.collisions = new CollisionSystem();
    this.particles = new Particles();
    this.music = new Music();
    this.objects = new LevelObjects();
    this.loop = new Loop({ stepMs: STEP_MS, update: () => this.update(), render: () => this.render() });
    if (import.meta.env.DEV) window.__game = this; // solo para depurar
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
    this.camera.x = 0;
    this.objects.reset(this);
    this.player.reset(this.level);
    this.lives = PLAYER.lives;
    this.score = 0;
    this.time = 0; // frames
  }

  // modeId: clave de LEVELS ('survival', 'jungle'). Sin argumento repite el modo actual.
  start(modeId) {
    if (modeId && LEVELS[modeId]) {
      this.level = LEVELS[modeId];
      this.waves = this.level.mode === 'stream' ? new StreamSystem() : new WaveSystem();
    }
    this.resetWorld();
    this.state = 'playing';
    this.input.attach();
    this.waves.start(this);
    this.emitHud();
    this.loop.start();
    if (this.level.mode === 'stream') this.music.play();
    else this.music.stop();
  }

  destroy() {
    this.music.stop();
    this.loop.stop();
    this.input.detach();
    this.bus.clear();
  }

  // Superficie del agua en esa X (unidades del mundo) o null si ahí no hay agua en este nivel.
  waterTop(cx) {
    const w = this.level.water;
    if (!w) return null;
    const v = w.top[Math.floor(cx / w.k)];
    return v > 0 ? v : null;
  }

  // La cámara sigue al jugador hacia la derecha y nunca retrocede (como en Contra).
  updateCamera() {
    const { level, world, player, camera } = this;
    if (!level.scroll) return;
    camera.x = Math.max(camera.x, Math.min(level.width - world.w, player.cx - world.w * 0.45));
  }

  finish(won) {
    this.state = 'over';
    this.music.stop();
    this.emitHud();
    this.bus.emit('gameover', { won, score: this.score, wave: this.waves.number, seconds: Math.floor(this.time / 60) });
  }

  onPlayerDied() {
    this.lives--;
    if (this.lives <= 0) {
      this.finish(false);
    } else {
      this.player.respawn(this);
    }
  }

  update() {
    if (this.state !== 'playing') return;
    this.time++;
    this.waves.tickBanner();

    this.player.update(this);
    if (this.state !== 'playing') return;
    this.updateCamera();
    if (this.level.goalX && !this.player.dead && this.player.cx > this.level.goalX) return this.finish(true);

    this.objects.update(this);
    this.waves.update(this);
    for (const e of this.enemies) e.update(this);
    for (const p of this.pickups) p.update(this);
    for (const b of this.projectiles) b.update();
    for (const b of this.enemyProjectiles) b.update();

    this.collisions.update(this);

    const { w, h } = this.world;
    const cam = this.camera.x;
    this.projectiles = this.projectiles.filter((b) => inBounds(b, cam, w, h));
    this.enemyProjectiles = this.enemyProjectiles.filter((b) => inBounds(b, cam, w, h));
    this.enemies = this.enemies.filter((e) => !e.dead && e.x > cam - 90 && e.x < cam + w + 90 && e.y < h + 100);
    this.pickups = this.pickups.filter((k) => !k.taken && k.y < h + 100);
    this.particles.update();

    if (this.time % 6 === 0) this.emitHud();
  }

  render() {
    const r = this.renderer;
    r.begin();
    r.ctx.save();
    r.ctx.translate(-this.camera.x, 0); // todo lo del mundo se dibuja desplazado por la cámara
    drawLevel(r.ctx, this.level, this.world, r.assets, this.camera);
    this.objects.draw(r);
    for (const k of this.pickups) k.draw(r);
    for (const e of this.enemies) e.draw(r);
    this.player.draw(r);
    for (const b of this.projectiles) b.draw(r.ctx);
    for (const b of this.enemyProjectiles) b.draw(r.ctx);
    this.particles.draw(r.ctx);
    r.ctx.restore();
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
      progress: this.level.scroll ? Math.min(100, Math.round((this.player.cx / this.level.goalX) * 100)) : null,
    };
  }

  emitHud() {
    this.bus.emit('hud', this.getHud());
  }
}
