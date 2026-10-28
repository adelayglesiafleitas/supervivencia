// Un nivel = datos. Para crear más niveles, copia este archivo y cámbialo.
export const level01 = {
  id: 'level01',
  groundY: 480,
  platforms: [
    { x: 0, y: 480, w: 960, h: 60, solid: true }, // suelo
    { x: 90, y: 370, w: 230, h: 12 },
    { x: 640, y: 370, w: 230, h: 12 },
    { x: 365, y: 270, w: 230, h: 12 },
  ],
  background: { top: '#1a1030', bottom: '#3a1a28', stars: 40 },
  style: { ground: '#2b2b35', platform: '#4a4a58', edge: '#7a7a8c' },
};
