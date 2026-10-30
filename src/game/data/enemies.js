// Estadísticas de cada tipo de enemigo. El comportamiento está en entities/enemies/.
export const ENEMY_STATS = {
  runner: { w: 26, h: 64, hp: 1, score: 100 },
  shooter: { w: 26, h: 64, hp: 3, score: 300, speed: 1.6 },
  turret: { w: 34, h: 56, hp: 4, score: 200 },
  wallTurret: { w: 44, h: 44, hp: 8, score: 500 },
  sensor: { w: 48, h: 40, hp: 10, score: 800 },
  capsule: { w: 44, h: 28, hp: 1, score: 500 },
  leaper: { w: 26, h: 50, hp: 2, score: 250, speed: 2.2 },
};
