import { useEffect, useRef } from 'react';
import { drawLayer } from '../game/render/drawLevel.js';
import { drawSky, drawRain } from '../game/render/sky.js';

const WORLD = { w: 960, h: 540 };
const LAYERS = [
  { image: 'mountains', factor: 0.1, scale: 0.8, bottom: 540, mirror: true },
  { image: 'forest', factor: 0.35, scale: 0.8, bottom: 470, mirror: false },
];

// Fondo animado de la pantalla de título: cielo con nubes y relámpagos, montañas, palmeras y lluvia.
export default function TitleBackdrop({ assets }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let raf;
    const cam = { x: 0 };
    const t0 = performance.now();
    const frame = () => {
      cam.x = (performance.now() - t0) / 1000 * 22;
      ctx.setTransform(canvas.width / WORLD.w, 0, 0, canvas.height / WORLD.h, 0, 0);
      ctx.save();
      ctx.translate(-cam.x, 0);
      ctx.fillStyle = '#000';
      ctx.fillRect(cam.x, 0, WORLD.w, WORLD.h);
      drawLayer(ctx, LAYERS[0], WORLD, assets, cam);
      drawSky(ctx, assets, cam, WORLD);
      drawLayer(ctx, LAYERS[1], WORLD, assets, cam);
      drawRain(ctx, cam, WORLD);
      ctx.restore();
      // suelo oscuro y viñeta para que se lea el texto
      const g = ctx.createLinearGradient(0, 330, 0, WORLD.h);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.92)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 330, WORLD.w, WORLD.h - 330);
      const v = ctx.createRadialGradient(480, 270, 200, 480, 270, 620);
      v.addColorStop(0, 'rgba(0,0,0,0)');
      v.addColorStop(1, 'rgba(0,0,0,0.55)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, WORLD.w, WORLD.h);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [assets]);
  return <canvas ref={ref} className="title-bg" width={1280} height={720} />;
}
