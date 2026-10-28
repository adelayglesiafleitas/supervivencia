import { SPRITE_SCALE } from '../config.js';

// Único sitio que toca el canvas. Dibuja en unidades de mundo; la resolución real
// (RENDER.scale) se aplica con una transformación, así la lógica no depende de ella.
export class Renderer {
  constructor(canvas, { world, scale, smooth }, assets) {
    this.canvas = canvas;
    this.world = world;
    this.scale = scale;
    this.smooth = smooth;
    this.assets = assets;
    canvas.width = world.w * scale;
    canvas.height = world.h * scale;
    this.ctx = canvas.getContext('2d');
  }

  begin() {
    const { ctx } = this;
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    ctx.imageSmoothingEnabled = this.smooth;
  }

  // Dibuja un frame del atlas.
  //   mode 'foot'   : anclado a los pies (parte baja de la caja del cuerpo)
  //   mode 'center' : anclado al centro de la caja
  // La entidad se voltea si mira a la izquierda (face < 0).
  drawFrame(sheetName, frameName, body, mode = 'foot', fallbackColor = '#2e86de') {
    const { ctx } = this;
    const sheet = this.assets.sheet(sheetName);
    const f = sheet?.frames[frameName];
    if (!f) {
      ctx.fillStyle = fallbackColor;
      ctx.fillRect(body.x, body.y, body.w, body.h);
      return;
    }
    const S = SPRITE_SCALE;
    ctx.save();
    if (mode === 'center') {
      ctx.translate(body.x + body.w / 2, body.y + body.h / 2);
      if (body.face < 0) ctx.scale(-1, 1);
      ctx.drawImage(sheet.image, f.x, f.y, f.w, f.h, (-f.w * S) / 2, (-f.h * S) / 2, f.w * S, f.h * S);
    } else {
      ctx.translate(body.x + body.w / 2, body.y + body.h);
      if (body.face < 0) ctx.scale(-1, 1);
      ctx.drawImage(sheet.image, f.x, f.y, f.w, f.h, -f.ax * S, -f.h * S, f.w * S, f.h * S);
    }
    ctx.restore();
  }
}
