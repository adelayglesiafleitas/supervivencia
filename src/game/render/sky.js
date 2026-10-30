// Nubes con parallax y relámpagos (adaptado del otro juego). Se dibuja detrás de las montañas.
const S = { next: 4, start: -1, dur: 0.55, x0: 480, far: 0.6, bolt: null };

function makeBolt(x, y0, y1) {
  const segs = [];
  const walk = (x, y, ang, len, w, depth) => {
    let cx = x, cy = y;
    const steps = Math.max(3, Math.floor(len / 22));
    for (let i = 0; i < steps; i++) {
      ang += (Math.random() - 0.5) * 0.9;
      const nx = cx + Math.sin(ang) * 22 * (0.6 + Math.random() * 0.8);
      const ny = cy + Math.cos(ang) * 22 * (0.8 + Math.random() * 0.6);
      segs.push([cx, cy, nx, ny, w]);
      if (depth < 2 && Math.random() < 0.13) walk(nx, ny, ang + (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.6), len * 0.45, w * 0.55, depth + 1);
      cx = nx; cy = ny;
      if (cy > y1) break;
    }
  };
  walk(x, y0, (Math.random() - 0.5) * 0.3, y1 - y0, 3.2, 0);
  return segs;
}

let ac = null;
function thunder(near) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ac ??= new AC();
    if (ac.state === 'suspended') return;
    const dur = 2.2 + near;
    const buf = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * dur * 0.35));
    const src = ac.createBufferSource();
    src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 130 + (1 - near) * 90;
    const g = ac.createGain();
    g.gain.value = 0.22 * (0.4 + near);
    src.connect(f).connect(g).connect(ac.destination);
    src.start();
  } catch (e) { /* sin audio */ }
}

function level(t) {
  if (S.start < 0) return 0;
  const u = (t - S.start) / S.dur;
  const f = (a, b) => Math.max(0, 1 - Math.abs(u - a) / b);
  return Math.min(1, f(0.06, 0.07) + 0.55 * f(0.22, 0.06) + 0.9 * f(0.34, 0.2));
}

function cloudLayer(ctx, img, s, y, speed, factor, camX, world, t, alpha, mode, flip) {
  const w = img.width * s, h = img.height * s;
  const shift = t * speed + camX * factor;
  const first = Math.floor(shift / w);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = mode;
  for (let i = first; i * w - shift < world.w; i++) {
    const x = camX + i * w - shift;
    if (flip && i % 2 !== 0) {
      ctx.save(); ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(img, 0, 0, w, h); ctx.restore();
    } else ctx.drawImage(img, x, y, w, h);
  }
  ctx.restore();
}

export function drawSky(ctx, assets, camera, world) {
  const t = performance.now() / 1000;
  // relámpago: programar
  if (S.start < 0 && t >= S.next) {
    S.start = t;
    S.x0 = 80 + Math.random() * (world.w - 160);
    S.far = 0.35 + Math.random() * 0.65;
    S.bolt = makeBolt(S.x0, -10, 160 + Math.random() * 90);
    S.dur = 0.5 + Math.random() * 0.3;
    S.next = t + 7 + Math.random() * 11;
    setTimeout(() => thunder(S.far), 250 + (1 - S.far) * 1600);
  }
  if (S.start >= 0 && t - S.start > S.dur) S.start = -1;
  const L = level(t);
  const cx = camera.x;

  const glow = assets.sheet('cloudGlow')?.image;
  const dark = assets.sheet('cloudDark')?.image;
  if (glow) cloudLayer(ctx, glow, 0.62, -60, 12, 0.015, cx, world, t, 0.16 + L * 0.3, 'lighter', false);
  if (dark) {
    cloudLayer(ctx, dark, 0.7, -190, 18, 0.03, cx, world, t, 0.26, 'source-over', false);
    cloudLayer(ctx, dark, 0.46, -100, 34, 0.05, cx, world, t, 0.18, 'source-over', true);
  }

  if (L > 0 && S.bolt) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    const k = 0.5 + S.far * 0.5;
    for (const [w, a, col] of [[9, 0.2, '120,150,255'], [4, 0.5, '190,210,255'], [1.4, 1, '245,248,255']]) {
      ctx.strokeStyle = `rgba(${col},${a * L * k})`;
      for (const [x1, y1, x2, y2, sw] of S.bolt) {
        ctx.lineWidth = Math.max(0.6, (w * sw) / 3.2 * k);
        ctx.beginPath(); ctx.moveTo(cx + x1, y1); ctx.lineTo(cx + x2, y2); ctx.stroke();
      }
    }
    // destello general
    const gx = cx + S.x0;
    const g = ctx.createRadialGradient(gx, 40, 20, gx, 40, world.w * 0.8);
    g.addColorStop(0, `rgba(150,180,255,${0.3 * L * k})`);
    g.addColorStop(1, 'rgba(40,60,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx, 0, world.w, world.h);
    ctx.restore();
  }
}

// Lluvia por delante de todo (dos capas, rayas inclinadas).
const DROPS = Array.from({ length: 170 }, (_, i) => {
  const r = (n) => { const v = Math.sin(i * 127.1 + n * 311.7) * 43758.5453; return v - Math.floor(v); };
  return { x: r(1), y: r(2), s: 0.6 + r(3) * 0.8, l: 9 + r(4) * 12 };
});
export function drawRain(ctx, camera, world) {
  const t = performance.now() / 1000;
  ctx.save();
  ctx.lineCap = 'round';
  for (const d of DROPS) {
    const v = 620 * d.s;
    const y = ((d.y * world.h + t * v) % (world.h + 40)) - 20;
    const x = camera.x + ((d.x * (world.w + 160) - t * v * 0.22 - camera.x * 0.15 * d.s) % (world.w + 160) + (world.w + 160)) % (world.w + 160) - 40;
    ctx.strokeStyle = `rgba(190,210,235,${0.16 + d.s * 0.18})`;
    ctx.lineWidth = d.s > 1 ? 1.3 : 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - d.l * 0.22, y - d.l);
    ctx.stroke();
  }
  ctx.restore();
}
