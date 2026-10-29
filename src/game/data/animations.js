// Qué frames del atlas usa cada acción. Los nombres de frame ("fila_columna")
// vienen de las hojas originales. Todas las poses miran a la derecha; el motor las voltea.

import { PHYSICS } from '../config.js';

const seq = (name, n) => Array.from({ length: n }, (_, i) => `${name}_${i}`);

export const PLAYER_ANIM = {
  sheet: 'player',
  idle: seq('idle', 6), // respirando
  stand: { up: 'fire_u_0', upd: 'run_u_0', downd: 'idle_0' }, // quieto apuntando arriba / en diagonal
  fire: { h: seq('fire_h', 4), up: seq('fire_u', 4) }, // disparo quieto (el 2º frame lleva el destello)
  run: { h: seq('run_h', 5), up: seq('run_u', 5), upd: seq('run_u', 5), downd: seq('run_h', 5) },
  runFire: seq('run_f', 5), // correr disparando (mismo ciclo que run.h, arma al frente con destello)
  fireHold: 0.3, // segundos que se ve la pose de disparo tras cada tiro
  jump: seq('jump', 10), // voltereta (anclada al centro)
  jumpFallStart: 7, // si cae sin saltar, empieza ya con el cuerpo abriéndose
  prone: seq('prone', 4),
  dead: seq('dead', 10),
  // Correr va ligado a la distancia: runFps = fotogramas por segundo a velocidad máxima.
  runFps: { h: 10, u: 10 },
  fireFps: 24, // disparo quieto
  fps: { idle: 8, jump: 24, dead: 24, prone: 4 },
  // unidades de mundo que recorre un ciclo completo (12 frames) a ese ritmo
  runStride(key) {
    return (PHYSICS.runSpeed * 60 * this.run[key === 'h' ? 'h' : 'up'].length) / this.runFps[key];
  },
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

// Prueba: ciclo de referencia (14 poses, siluetas). Solo aparece en el editor de animación.

export const TURRET_ANIM = {
  sheet: 'enemyRed',
  closed: '3_0',
  open: ['3_1', '3_2'],
  fps: 10,
};

// Lista para el editor de animación: cada entrada lee y escribe su velocidad (fotogramas por segundo).
// Los cambios se guardan en localStorage y se aplican al arrancar y en directo.
const P = PLAYER_ANIM;
export const ANIM_LIST = [
  { id: 'p_run_h', label: 'Correr', group: 'Drake', sheet: 'player', frames: P.run.h, mode: 'foot', native: 1, note: 'a velocidad máxima', get: () => P.runFps.h, set: (v) => (P.runFps.h = v) },
  { id: 'p_run_u', label: 'Correr apuntando arriba', group: 'Drake', sheet: 'player', frames: P.run.up, mode: 'foot', native: 1, note: 'a velocidad máxima', get: () => P.runFps.u, set: (v) => (P.runFps.u = v) },
  { id: 'p_idle', label: 'Quieto (respirar)', group: 'Drake', sheet: 'player', frames: P.idle, mode: 'foot', native: 1, get: () => P.fps.idle, set: (v) => (P.fps.idle = v) },
  { id: 'p_prone', label: 'Tumbado', group: 'Drake', sheet: 'player', frames: P.prone, mode: 'foot', native: 1, get: () => P.fps.prone, set: (v) => (P.fps.prone = v) },
  { id: 'p_jump', label: 'Voltereta', group: 'Drake', sheet: 'player', frames: P.jump, mode: 'center', native: 1, get: () => P.fps.jump, set: (v) => (P.fps.jump = v) },
  { id: 'p_dead', label: 'Muerte', group: 'Drake', sheet: 'player', frames: P.dead, mode: 'foot', native: 1, once: true, get: () => P.fps.dead, set: (v) => (P.fps.dead = v) },
  { id: 'p_fire_h', label: 'Disparo quieto', group: 'Drake', sheet: 'player', frames: P.fire.h, mode: 'foot', native: 1, once: true, get: () => P.fireFps, set: (v) => (P.fireFps = v) },
  { id: 'p_fire_u', label: 'Disparo arriba', group: 'Drake', sheet: 'player', frames: P.fire.up, mode: 'foot', native: 1, once: true, get: () => P.fireFps, set: (v) => (P.fireFps = v) },
  { id: 'e_runner', label: 'Soldado: correr', group: 'Enemigos', sheet: RUNNER_ANIM.sheet, frames: RUNNER_ANIM.run, mode: 'foot', native: RUNNER_ANIM.native, get: () => RUNNER_ANIM.fps, set: (v) => (RUNNER_ANIM.fps = v) },
  { id: 'e_shooter', label: 'Tirador: correr', group: 'Enemigos', sheet: SHOOTER_ANIM.sheet, frames: SHOOTER_ANIM.run, mode: 'foot', native: SHOOTER_ANIM.runNative, get: () => SHOOTER_ANIM.fps, set: (v) => (SHOOTER_ANIM.fps = v) },
  { id: 'e_leaper', label: 'Alien: correr', group: 'Enemigos', sheet: LEAPER_ANIM.sheet, frames: LEAPER_ANIM.run, mode: 'foot', native: LEAPER_ANIM.native, get: () => LEAPER_ANIM.fps, set: (v) => (LEAPER_ANIM.fps = v) },
];
for (const a of ANIM_LIST) a.def = a.get();

const KEY = 'animFps';
export function saveAnimFps() {
  try {
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(ANIM_LIST.map((a) => [a.id, a.get()]))));
  } catch {
    /* sin almacenamiento: se queda solo en memoria */
  }
}
export function resetAnimFps() {
  for (const a of ANIM_LIST) a.set(a.def);
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada */
  }
}
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
  for (const a of ANIM_LIST) if (Number.isFinite(saved[a.id])) a.set(saved[a.id]);
} catch {
  /* nada */
}
