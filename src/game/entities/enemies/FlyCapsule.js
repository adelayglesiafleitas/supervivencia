import { Enemy } from './Enemy.js';

// Cápsula voladora: cruza la pantalla en onda; al dispararla suelta un arma.
export class FlyCapsule extends Enemy {
  constructor(game, def) {
    super('capsule');
    this.x = game.camera.x + game.world.w + 30;
    this.baseY = def.y ?? 150;
    this.y = this.baseY;
    this.harmless = true;
    this.dropAlways = true;
    this.face = -1;
  }

  update() {
    this.t += 1 / 60;
    this.x -= 1.5;
    this.y = this.baseY + Math.sin(this.t * 2.2) * 38;
  }

  draw(renderer) {
    const { ctx } = renderer;
    const sheet = renderer.assets.sheet('capsules');
    const f = sheet?.frames?.[`cap_S_${Math.floor(this.t * 8) % 4}`];
    if (!f) return;
    const S = sheet.scale ?? 0.5;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(sheet.image, f.x, f.y, f.w, f.h, this.x + this.w / 2 - f.ax * S, this.y + this.h / 2 - f.ay * S, f.w * S, f.h * S);
  }
}
