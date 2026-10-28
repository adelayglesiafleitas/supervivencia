// Qué frames del atlas usa cada acción. Los nombres de frame ("fila_columna")
// vienen de las hojas originales. Todas las poses miran a la derecha; el motor las voltea.

export const PLAYER_ANIM = {
  sheet: 'player',
  stand: { h: ['0_4'], up: ['0_6'], upd: ['1_4'], downd: ['2_4'] },
  standFire: { h: '0_5', up: '0_7' }, // destello al disparar quieto
  run: {
    h: ['3_5', '3_6', '3_7', '3_6'],
    up: ['3_8', '3_9'],
    upd: ['1_3', '1_4', '1_5', '1_4'],
    downd: ['2_3', '2_4', '2_5', '2_4'],
  },
  jump: ['4_6', '4_7', '4_8', '4_9'], // voltereta (anclada al centro)
  prone: ['4_5'],
  dead: ['5_5', '5_6', '5_7', '5_8', '5_9'],
  fps: { run: 12, jump: 14, dead: 7 },
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
