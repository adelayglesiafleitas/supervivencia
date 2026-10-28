// Toda la configuración global del juego en un solo sitio.

// Resolución -------------------------------------------------------------
// WORLD: tamaño del mundo en unidades de juego (físicas, plataformas, hitboxes).
// RENDER.scale: píxeles reales del canvas por unidad de mundo (1 = 960x540, 2 = 1920x1080).
// RENDER.smooth: false para pixel art, true para arte de alta resolución.
export const WORLD = { w: 960, h: 540 };
export const RENDER = { scale: 2, smooth: false };

// Escala a la que se dibujan los sprites (cámbiala al meter sprites nuevos).
export const SPRITE_SCALE = 2;

// Bucle ------------------------------------------------------------------
export const STEP_MS = 1000 / 60;

// Física -----------------------------------------------------------------
export const PHYSICS = {
  gravity: 0.55,
  jumpVelocity: -13,
  jumpCutVelocity: -4, // salto variable: al soltar el botón la subida se corta aquí
  runSpeed: 3.4,
};

// Jugador ----------------------------------------------------------------
export const PLAYER = {
  w: 26,
  h: 68, // de pie
  hProne: 28, // tumbado
  hAir: 40, // en el aire (voltereta)
  lives: 3,
  startInvincibility: 120, // frames
  respawnInvincibility: 150,
  respawnDelay: 80, // frames desde que muere hasta que reaparece
  muzzleOffset: 28,
  powerSlots: 2, // poderes que puede guardar a la vez
};

// Armas. 'normal' es el disparo base (clic izquierdo, munición infinita).
// Los poderes (clic derecho) se recogen, se guardan y gastan munición.
export const WEAPONS = {
  normal: { angles: [0], cooldown: 7 },
  spread: { angles: [-0.3, -0.15, 0, 0.15, 0.3], cooldown: 11, ammo: 12 },
};

// Recompensas ------------------------------------------------------------
export const PICKUP_DROP_CHANCE = 0.12;

// Controles (códigos de tecla de KeyboardEvent.code) ----------------------
export const CONTROLS = {
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  up: ['KeyW', 'ArrowUp'],
  down: ['KeyS', 'ArrowDown'],
  jump: ['KeyK', 'Space'],
  fire: ['Mouse0'], // clic izquierdo: disparo normal
  power: ['Mouse2'], // clic derecho: usa el primer poder guardado
};
