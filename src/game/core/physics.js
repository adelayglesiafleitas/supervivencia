import { PHYSICS } from '../config.js';

// Mueve un cuerpo con gravedad y colisión contra plataformas.
// Las plataformas no sólidas se atraviesan desde abajo y se pueden "soltar" (dropThrough).
export function moveBody(body, platforms, world, dropThrough = false) {
  body.x += body.vx;
  if (body.clamp !== false) body.x = Math.max(0, Math.min(world.w - body.w, body.x)); // los enemigos pueden salir de pantalla
  const prevBottom = body.y + body.h;
  body.vy += PHYSICS.gravity;
  body.y += body.vy;
  body.onGround = false;
  body.standing = null;
  const bottom = body.y + body.h;
  for (const p of platforms) {
    if (body.x + body.w > p.x && body.x < p.x + p.w) {
      if (body.vy >= 0 && prevBottom <= p.y + 1 && bottom >= p.y) {
        if (!p.solid && dropThrough) continue;
        body.y = p.y - body.h;
        body.vy = 0;
        body.onGround = true;
        body.standing = p;
      }
    }
  }
}

// Cambia la altura de la caja manteniendo los pies en su sitio.
export function setHeight(body, newHeight) {
  if (newHeight !== body.h) {
    body.y += body.h - newHeight;
    body.h = newHeight;
  }
}

export function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function pointInBox(px, py, box) {
  return px > box.x && px < box.x + box.w && py > box.y && py < box.y + box.h;
}
