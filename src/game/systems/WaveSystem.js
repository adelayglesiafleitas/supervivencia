import { buildWave, spawnInterval, FIRST_SPAWN_DELAY, BANNER_FRAMES } from '../data/waves.js';
import { createEnemy } from '../entities/enemies/index.js';

// Controla las oleadas: cola de enemigos, ritmo de aparición y paso a la siguiente.
export class WaveSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.number = 0;
    this.queue = [];
    this.spawnTimer = 0;
    this.banner = 0; // frames restantes del cartel "OLEADA n"
  }

  start(game) {
    this.reset();
    this.next(game);
  }

  next() {
    this.number++;
    this.banner = BANNER_FRAMES;
    this.queue = buildWave(this.number);
    this.spawnTimer = FIRST_SPAWN_DELAY;
  }

  tickBanner() {
    if (this.banner > 0) this.banner--;
  }

  update(game) {
    if (this.queue.length && --this.spawnTimer <= 0) {
      game.enemies.push(createEnemy(this.queue.pop(), game));
      this.spawnTimer = spawnInterval(this.number);
    }
    if (!this.queue.length && game.enemies.length === 0 && !game.player.dead) this.next(game);
  }
}
