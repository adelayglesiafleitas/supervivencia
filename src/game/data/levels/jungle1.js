// Nivel 1 (jungla). El mapa es una imagen; las plataformas (hierba y puentes) se detectaron
// del propio mapa y están en unidades del mundo (1 px del mapa = 2.25 unidades).
// Para ajustar una plataforma, edita su x / y / w. Abre el juego con ?plat para verlas dibujadas.
const K = 2.25;

export const jungle1 = {
  id: 'jungle1',
  name: 'NIVEL 1',
  mode: 'stream', // los enemigos aparecen sin parar por la derecha mientras avanzas
  scroll: true,
  width: 3328 * K,
  groundY: Infinity,
  killY: 540 + 60, // caer al agua = morir
  goalX: 3200 * K, // al llegar a la puerta final se completa el nivel
  playerStart: { x: 150, y: 100 },
  spawn: { side: 'right' },
  background: {
    image: 'jungle',
    // capas detrás del mapa: factor = cuánto se mueven respecto a la cámara (0 = fijo)
    layers: [
      { image: 'mountains', factor: 0.1, scale: 0.497, bottom: 540, mirror: true },
      { image: 'forest', factor: 0.35, scale: 0.62, bottom: 570, mirror: false },
    ],
  },
  style: { ground: '#2b2b35', platform: '#4a4a58', edge: '#7a7a8c' },
  // Objetos del nivel. Torretas/sensores: centro de la placa en unidades del mundo (1 px de mapa = 2.25).
  objects: [
    ...[[1632, 112], [1824, 112], [1248, 144], [1568, 144], [2048, 144], [2272, 176]].map(([x, y]) => ({ kind: 'turret', x: (x + 16) * K, y: (y + 16) * K })),
    ...[[320, 144], [2976, 176], [3104, 176]].map(([x, y]) => ({ kind: 'sensor', x: (x + 16) * K, y: (y + 16) * K })),
    { kind: 'bridge', x: 1728, y: 256, w: 288 },
    { kind: 'bridge', x: 2376, y: 256, w: 288 },
    { kind: 'capsule', at: 500, y: 150 },
    { kind: 'capsule', at: 3000, y: 140 },
    { kind: 'capsule', at: 5400, y: 150 },
    { kind: 'gate', x: 7140, y: 474, scale: 0.5 },
  ],
  platforms: [
    { x: 76, y: 256, w: 1649, h: 14 },
    { x: 364, y: 328, w: 209, h: 14 },
    { x: 580, y: 400, w: 65, h: 14 },
    { x: 652, y: 472, w: 137, h: 14 },
    { x: 796, y: 400, w: 65, h: 14 },
    { x: 940, y: 328, w: 137, h: 14 },
    { x: 1372, y: 472, w: 137, h: 14 },
    { x: 1444, y: 364, w: 209, h: 14 },
    { x: 2020, y: 256, w: 353, h: 14 },
    { x: 2668, y: 256, w: 569, h: 14 },
    { x: 3100, y: 184, w: 1145, h: 14 },
    { x: 3172, y: 472, w: 209, h: 14 },
    { x: 3388, y: 364, w: 137, h: 14 },
    { x: 3604, y: 328, w: 497, h: 14 },
    { x: 3892, y: 472, w: 425, h: 14 },
    { x: 4180, y: 256, w: 497, h: 14 },
    { x: 4324, y: 400, w: 137, h: 14 },
    { x: 4540, y: 400, w: 137, h: 14 },
    { x: 4612, y: 184, w: 353, h: 14 },
    { x: 4756, y: 364, w: 65, h: 14 },
    { x: 4900, y: 328, w: 209, h: 14 },
    { x: 5044, y: 256, w: 137, h: 14 },
    { x: 5260, y: 328, w: 137, h: 14 },
    { x: 5260, y: 472, w: 65, h: 14 },
    { x: 5263, y: 308, w: 58, h: 14 },
    { x: 5332, y: 400, w: 209, h: 14 },
    { x: 5548, y: 256, w: 137, h: 14 },
    { x: 5620, y: 184, w: 137, h: 14 },
    { x: 5620, y: 472, w: 65, h: 14 },
    { x: 5692, y: 364, w: 65, h: 14 },
    { x: 5836, y: 256, w: 137, h: 14 },
    { x: 5908, y: 328, w: 353, h: 14 },
    { x: 6124, y: 472, w: 209, h: 14 },
    { x: 6412, y: 400, w: 137, h: 14 },
    { x: 6628, y: 328, w: 137, h: 14 },
    { x: 6772, y: 256, w: 281, h: 14 },
    { x: 6772, y: 472, w: 497, h: 14 },
    { x: 6844, y: 364, w: 209, h: 14 },
    { x: 7060, y: 328, w: 65, h: 14 },
    { x: 7132, y: 400, w: 65, h: 14 },
  ],
};
