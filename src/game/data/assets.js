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
  fx: {
    image: 'sprites/fx/flash.png', // fogonazos de la boca del arma (se dibujan con mezcla aditiva)
    frames: 'sprites/fx/frames.json',
    smooth: true,
    scale: 0.09,
  },
  capsules: {
    image: 'sprites/level/capsules.png', // cápsulas voladoras de armas (S, M, L, F, R; 4 frames cada una)
    frames: 'sprites/level/capsules.json',
    smooth: true,
    scale: 0.5,
  },
  swim: { image: 'sprites/swim/atlas.png', frames: 'sprites/swim/frames.json', smooth: true, scale: 0.32 },
  turret: { image: 'sprites/level/turret.png', frames: 'sprites/level/turret.json', smooth: true, scale: 0.5 },
  sensor: { image: 'sprites/level/sensor.png', frames: 'sprites/level/sensor.json', smooth: true, scale: 0.5 },
  bridge: { image: 'sprites/level/bridge.png', frames: 'sprites/level/bridge.json', smooth: true, scale: 0.497 },
  gate: { image: 'sprites/level/gate.png' },
  mountains: { image: 'sprites/level/bg_mountains.jpg' },
  forest: { image: 'sprites/level/bg_forest_top.png' },
  enemyRed: {
    image: 'sprites/enemies/atlas_red.png',
    frames: 'sprites/enemies/frames_red.json',
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
    image: 'maps/jungle1_art.webp', // mapa del nivel 1 (sin frames: se dibuja entero como fondo)
  },
  enemyGreen: {
    image: 'sprites/enemies/atlas_green.png',
    frames: 'sprites/enemies/frames_green.json',
    smooth: true,
    scale: 0.5,
  },
};
