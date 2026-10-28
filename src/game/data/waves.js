// Definición de las oleadas. Devuelve la lista de enemigos de la oleada n (1, 2, 3...).
// Para añadir un enemigo nuevo: regístralo en entities/enemies/index.js y úsalo aquí.

const TURRETS_ENABLED = false; // mortero desactivado por ahora

export function buildWave(n) {
  const queue = [];
  for (let i = 0; i < 3 + n * 2; i++) queue.push('runner');
  for (let i = 0; i < Math.floor(n * 1.2); i++) queue.push('shooter');
  for (let i = 0; i < 1 + Math.floor(n / 2); i++) queue.push('leaper'); // saltan a las plataformas a buscarte
  if (TURRETS_ENABLED && n >= 2) for (let i = 0; i < Math.ceil(n / 2); i++) queue.push('turret');
  queue.sort(() => Math.random() - 0.5);
  return queue;
}

// Frames entre aparición y aparición de enemigos (60 frames = 1 s). Salen poco a poco.
export function spawnInterval(n) {
  return Math.max(45, 110 - n * 8) + Math.random() * 40;
}

export const FIRST_SPAWN_DELAY = 150;
export const BANNER_FRAMES = 120;
