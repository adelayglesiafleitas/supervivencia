// Dibuja el fondo y las plataformas de un nivel.
const SHOW_PLATFORMS = typeof location !== 'undefined' && location.search.includes('plat');

export function drawLevel(ctx, level, world, assets, camera) {
  const { background: bg, style } = level;

  // Nivel con mapa: se dibuja el trozo de imagen que ve la cámara (pixel art, sin suavizar).
  if (bg.image) {
    const img = assets.sheet(bg.image)?.image;
    ctx.fillStyle = '#000';
    ctx.fillRect(camera.x, 0, world.w, world.h);
    for (const L of bg.layers ?? []) drawLayer(ctx, L, world, assets, camera);
    if (img) {
      const k = world.h / img.height; // unidades del mundo por píxel del mapa
      const sx = Math.max(0, Math.floor(camera.x / k));
      const sw = Math.min(Math.ceil(world.w / k) + 2, img.width - sx);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, sx, 0, sw, img.height, sx * k, 0, sw * k, world.h);
    }
    if (SHOW_PLATFORMS) {
      ctx.fillStyle = '#ff00ff88';
      for (const p of level.platforms) ctx.fillRect(p.x, p.y, p.w, 3);
    }
    return;
  }

  const g = ctx.createLinearGradient(0, 0, 0, world.h);
  g.addColorStop(0, bg.top);
  g.addColorStop(1, bg.bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, world.w, world.h);

  ctx.fillStyle = '#ffffff10';
  for (let i = 0; i < bg.stars; i++) ctx.fillRect((i * 97) % world.w, (i * 53) % 300, 2, 2);

  for (const p of level.platforms) {
    ctx.fillStyle = p.solid ? style.ground : style.platform;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = style.edge;
    ctx.fillRect(p.x, p.y, p.w, 3);
  }
}

// Capa de fondo con parallax: se repite en horizontal (opcionalmente en espejo para ocultar la costura).
function drawLayer(ctx, L, world, assets, camera) {
  const img = assets.sheet(L.image)?.image;
  if (!img) return;
  const tw = img.width * L.scale;
  const th = img.height * L.scale;
  const shift = camera.x * L.factor;
  const first = Math.floor(shift / tw);
  const y = L.bottom - th;
  ctx.imageSmoothingEnabled = true;
  for (let i = first; i * tw - shift < world.w; i++) {
    const x = camera.x + i * tw - shift;
    if (L.mirror && i % 2 !== 0) {
      ctx.save();
      ctx.translate(x + tw, y);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0, tw, th);
      ctx.restore();
    } else ctx.drawImage(img, x, y, tw, th);
  }
}
