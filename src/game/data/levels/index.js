import { level01 } from './level01.js';
import { jungle1 } from './jungle1.js';

// Modos de juego que se pueden elegir en el menú. Para añadir otro: crea el nivel y regístralo aquí.
export const LEVELS = {
  survival: level01,
  jungle: jungle1,
};
