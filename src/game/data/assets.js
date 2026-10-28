// Manifiesto de arte. Para cambiar los sprites: sustituye los PNG/JSON de /public/sprites
// (o apunta aquí a otros) y ajusta las animaciones en animations.js.
// Cada "sheet" es un atlas PNG + un JSON con los frames { x, y, w, h, ax }.
//   ax = posición X del punto de apoyo (los pies) dentro del frame.

export const ASSET_MANIFEST = {
  player: {
    image: 'sprites/player/atlas.png',
    frames: 'sprites/player/frames.json',
    scale: 0.5, // atlas de Drake a 4x: 0.5 deja el mismo tamaño en pantalla que el original a 2
  },
  enemyRed: {
    image: 'sprites/enemies/atlas_red.png',
    frames: 'sprites/enemies/frames.json',
  },
  alien: {
    image: 'sprites/alien/atlas.png',
    frames: 'sprites/alien/frames.json',
  },
  enemyGreen: {
    image: 'sprites/enemies/atlas_green.png',
    frames: 'sprites/enemies/frames.json',
  },
};
