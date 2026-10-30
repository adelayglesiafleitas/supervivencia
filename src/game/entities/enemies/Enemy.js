import { Entity } from '../Entity.js';
import { ENEMY_STATS } from '../../data/enemies.js';
import { scaleHp } from '../../data/difficulty.js';

// Base de los enemigos. Cada tipo hereda de aquí y define update() y draw().
// Un enemigo nuevo = una clase nueva + una entrada en ENEMY_STATS + registrarla en index.js.
export class Enemy extends Entity {
  constructor(type) {
    const stats = ENEMY_STATS[type];
    super({ w: stats.w, h: stats.h });
    this.type = type;
    this.stats = stats;
    this.hp = scaleHp(stats.hp);
    this.score = stats.score;
    this.clamp = false; // entran y salen por los bordes de la pantalla
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
  // Devuelve también la altura inicial: el suelo en niveles planos o, en niveles con relieve,
  // una plataforma que haya justo fuera de la pantalla por ese lado.
  static pickSide(game, h = 64) {
    const { level, world, camera } = game;
    const mode = level.spawn?.side ?? 'both';
    const side = mode === 'right' ? 1 : mode === 'left' ? -1 : Math.random() < 0.5 ? -1 : 1;
    let x = side < 0 ? camera.x - 40 : camera.x + world.w + 10;
    let y;
    if (Number.isFinite(level.groundY)) {
      y = level.groundY - h;
    } else {
      y = -100;
      for (let i = 0; i < 80; i++, x += side * 16) {
        const cx = x + 13;
        const under = level.platforms.filter((p) => p.x <= cx && cx <= p.x + p.w);
        if (under.length) {
          y = under[Math.floor(Math.random() * under.length)].y - h - 1;
          break;
        }
      }
    }
    return { side, x, y, chase: mode === 'both' };
  }
}
