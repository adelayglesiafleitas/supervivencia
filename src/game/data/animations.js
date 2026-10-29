// Qué frames del atlas usa cada acción. Los nombres de frame ("fila_columna")
// vienen de las hojas originales. Todas las poses miran a la derecha; el motor las voltea.

const seq = (name, n) => Array.from({ length: n }, (_, i) => `${name}_${i}`);

export const PLAYER_ANIM = {
  sheet: 'player',
  idle: seq('idle', 6), // respirando
  stand: { up: 'fire_u_0', upd: 'run_u_0', downd: 'idle_0' }, // quieto apuntando arriba / en diagonal
  fire: { h: seq('fire_h', 4), up: seq('fire_u', 4) }, // disparo quieto (el 2º frame lleva el destello)
  run: { h: seq('run_h', 12), up: seq('run_u', 12), upd: seq('run_u', 12), downd: seq('run_h', 12) },
  jump: seq('jump', 10), // voltereta (anclada al centro)
  jumpFallStart: 7, // si cae sin saltar, empieza ya con el cuerpo abriéndose
  prone: seq('prone', 4),
  dead: seq('dead', 10),
  runStride: 62, // unidades de mundo que recorre un ciclo completo de 12 frames
  fps: { idle: 7, jump: 14, dead: 14, prone: 4 },
};

// native: hacia dónde miran los frames tal cual vienen en la hoja (1 derecha, -1 izquierda).
export const RUNNER_ANIM = {
  sheet: 'enemyRed',
  native: -1,
  run: ['1_0', '1_1', '1_2', '1_3'],
  air: '1_3',
  fps: 12,
};

export const SHOOTER_ANIM = {
  sheet: 'enemyGreen',
  runNative: -1, // los frames de correr miran a la izquierda
  run: ['1_0', '1_1', '1_2', '1_3'],
  stand: '2_3',
  shoot: '2_4',
  fps: 9,
};

// Alien saltador (fila 7 de la hoja de enemigos). Los frames miran a la izquierda.
export const LEAPER_ANIM = {
  sheet: 'alien',
  native: -1,
  run: ['6_2', '6_3', '6_4', '6_3'],
  up: '6_0', // subiendo, alas arriba
  glide: '6_1', // cayendo, alas abiertas
  fps: 11,
};

export const TURRET_ANIM = {
  sheet: 'enemyRed',
  closed: '3_0',
  open: ['3_1', '3_2'],
  fps: 10,
};
