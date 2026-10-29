// Manifiesto de arte. Para cambiar los sprites: sustituye los PNG/JSON de /public/sprites
// (o apunta aquí a otros) y ajusta las animaciones en animations.js.
// Cada "sheet" es un atlas PNG + un JSON con los frames { x, y, w, h, ax }.
//   ax = posición X del punto de apoyo (los pies) dentro del frame.

export const ASSET_MANIFEST = {
  player: {
    image: 'sprites/player/atlas.png',
    frames: 'sprites/player/frames.json',
    smooth: true,
    scale: 0.25, // atlas de Drake a 4x respecto al tamaño de mundo (alta resolución)
  },
  soldierTest: {
    image: 'sprites/enemies/soldier_run.png',
    frames: 'sprites/enemies/soldier_run.json',
    smooth: true,
    scale: 0.25, // prueba: solo se ve en el editor de animación
  },
  enemyRed: {
    image: 'sprites/enemies/atlas_red.png',
    frames: 'sprites/enemies/frames.json',
    smooth: true,
    scale: 0.5,
  },
  alien: {
    image: 'sprites/alien/atlas.png',
    frames: 'sprites/alien/frames.json',
    smooth: true,
    scale: 0.5,
  },
  jungle: {
    image: 'maps/jungle1.png', // mapa del nivel 1 (sin frames: se dibuja entero como fondo)
  },
  enemyGreen: {
    image: 'sprites/enemies/atlas_green.png',
    frames: 'sprites/enemies/frames.json',
    smooth: true,
    scale: 0.5,
  },
};
