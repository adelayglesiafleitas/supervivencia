// Dibuja el fondo y las plataformas de un nivel.
export function drawLevel(ctx, level, world) {
  const { background: bg, style } = level;
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
