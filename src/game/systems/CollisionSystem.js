import { overlaps, pointInBox } from '../core/physics.js';
import { Pickup } from '../entities/Pickup.js';
import { PICKUP_DROP_CHANCE } from '../config.js';

// Todas las interacciones entre entidades: balas, daño, contacto y recogidas.
export class CollisionSystem {
  update(game) {
    const { player, enemies, projectiles, enemyProjectiles, pickups, particles } = game;

    // balas del jugador -> enemigos
    for (const b of projectiles) {
      for (const e of enemies) {
        if (e.dead || b.life <= 0 || !pointInBox(b.x, b.y, e)) continue;
        b.life = 0;
        particles.burst(b.x, b.y, 6, '#ffd34a');
        if (e.takeDamage(1)) {
          game.score += e.score;
          particles.burst(e.cx, e.y + e.h / 2, 12, '#ff7a3c');
          if (Math.random() < PICKUP_DROP_CHANCE) pickups.push(new Pickup(e.x, e.y));
        }
      }
    }

    // balas enemigas -> jugador
    for (const b of enemyProjectiles) {
      if (!player.dead && pointInBox(b.x, b.y, player)) {
        player.hurt(game);
        b.life = 0;
      }
    }

    // contacto enemigo -> jugador
    if (!player.dead) for (const e of enemies) if (!e.dead && overlaps(e, player)) player.hurt(game);

    // recogidas
    for (const k of pickups) {
      if (!player.dead && overlaps(k, player) && player.addPower(k.kind)) k.taken = true;
    }
  }
}
