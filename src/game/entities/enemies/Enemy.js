import { Entity } from '../Entity.js';
import { ENEMY_STATS } from '../../data/enemies.js';

// Base de los enemigos. Cada tipo hereda de aquí y define update() y draw().
// Un enemigo nuevo = una clase nueva + una entrada en ENEMY_STATS + registrarla en index.js.
export class Enemy extends Entity {
  constructor(type) {
    const stats = ENEMY_STATS[type];
    super({ w: stats.w, h: stats.h });
    this.type = type;
    this.stats = stats;
    this.hp = stats.hp;
    this.score = stats.score;
  }

  // Devuelve true si el golpe lo mata.
  takeDamage(amount = 1) {
    this.hp -= amount;
    return this.hp <= 0;
  }

  get dead() {
    return this.hp <= 0;
  }

  // Lado por el que entra al escenario (-1 izquierda, 1 derecha) y su X inicial.
  // Lo decide el nivel (level.spawn.side): 'right', 'left' o 'both'.
  static pickSide(game) {
    const mode = game.level.spawn?.side ?? 'both';
    const side = mode === 'right' ? 1 : mode === 'left' ? -1 : Math.random() < 0.5 ? -1 : 1;
    return { side, x: side < 0 ? -40 : game.world.w + 10, chase: mode === 'both' };
  }
}
