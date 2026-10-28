import { Runner } from './Runner.js';
import { Shooter } from './Shooter.js';
import { Turret } from './Turret.js';

// Registro de enemigos: nombre usado en waves.js -> clase.
export const ENEMY_TYPES = { runner: Runner, shooter: Shooter, turret: Turret };

export function createEnemy(type, game) {
  const EnemyClass = ENEMY_TYPES[type];
  if (!EnemyClass) throw new Error('Tipo de enemigo desconocido: ' + type);
  return new EnemyClass(game);
}
