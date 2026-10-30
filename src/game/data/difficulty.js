// Niveles de dificultad. DIFF es el valor activo (lo cambia Game.start); los enemigos lo leen al crearse.
//  hp: multiplicador de vida · cd: multiplicador de espera entre disparos (más alto = dispara menos)
//  spawn: multiplicador del tiempo entre apariciones (más alto = salen menos) · lives: vidas
export const DIFFICULTIES = {
  easy: { id: 'easy', name: 'Fácil', lives: 5, hp: 0.6, cd: 1.5, spawn: 1.5 },
  normal: { id: 'normal', name: 'Normal', lives: 3, hp: 1, cd: 1, spawn: 1 },
  hard: { id: 'hard', name: 'Difícil', lives: 2, hp: 1.4, cd: 0.75, spawn: 0.75 },
};

export const DIFF = { ...DIFFICULTIES.normal };

export function setDifficulty(id) {
  Object.assign(DIFF, DIFFICULTIES[id] ?? DIFFICULTIES.normal);
}

export const scaleHp = (hp) => Math.max(1, Math.round(hp * DIFF.hp));
