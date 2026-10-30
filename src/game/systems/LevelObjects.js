import { WallTurret } from '../entities/enemies/WallTurret.js';
import { FlyCapsule } from '../entities/enemies/FlyCapsule.js';

// Objetos colocados a mano en el nivel (level.objects): torretas, sensores, cápsulas voladoras,
// puentes que se rompen y la fortaleza final. Los enemigos nacen cuando la cámara se acerca.
const BR_FRAMES = [[0, 0], [1, 24], [2, 48], [3, 66], [4, 80], [5, 120]]; // [frame, desde tick]

export class LevelObjects {
  reset(game) {
    const lv = game.level;
    if (!lv._basePlatforms) lv._basePlatforms = lv.platforms.slice();
    this.defs = (lv.objects ?? []).map((d) => ({ ...d, done: false }));
    this.bridges = this.defs
      .filter((d) => d.kind === 'bridge')
      .map((d) => ({ x: d.x, y: d.y, w: d.w, t: -1, plat: { x: d.x, y: d.y, w: d.w, h: 14, bridge: true } }));
    lv.platforms = lv._basePlatforms.concat(this.bridges.map((b) => b.plat));
    this.gate = this.defs.find((d) => d.kind === 'gate');
  }

  update(game) {
    const { camera, world, player } = game;
    for (const d of this.defs) {
      if (d.done || d.kind === 'bridge' || d.kind === 'gate') continue;
      if (d.kind === 'capsule') {
        if (camera.x >= d.at) {
          d.done = true;
          game.enemies.push(new FlyCapsule(game, d));
        }
      } else if (d.x < camera.x + world.w + 40) {
        d.done = true;
        game.enemies.push(new WallTurret(game, d));
      }
    }
    for (const b of this.bridges) {
      if (b.t < 0) {
        const on = !player.dead && player.onGround && player.cx > b.x && player.cx < b.x + b.w && Math.abs(player.y + player.h - b.y) < 6;
        if (on) b.t = 0;
        continue;
      }
      b.t++;
      if (b.t === 48) game.level.platforms = game.level.platforms.filter((p) => p !== b.plat);
      if (b.t === 66) game.particles.burst(b.x + b.w / 2, b.y, 24, '#ff9a3c');
    }
  }

  frameOf(b) {
    if (b.t < 0) return 0;
    let n = 1;
    for (const [f, from] of BR_FRAMES) if (b.t >= from) n = f;
    return n;
  }

  draw(renderer) {
    const { ctx } = renderer;
    const sh = renderer.assets.sheet('bridge');
    if (sh?.frames) {
      const S = 0.497;
      ctx.imageSmoothingEnabled = true;
      for (const b of this.bridges) {
        if (b.t >= 190) continue;
        ctx.globalAlpha = b.t > 150 ? 1 - (b.t - 150) / 40 : 1;
        const f = sh.frames['br_' + this.frameOf(b)];
        // la cubierta del frame empieza en la fila 101; su centro es ax
        ctx.drawImage(sh.image, f.x, f.y, f.w, f.h, b.x + b.w / 2 - f.ax * S, b.y - 101 * S, f.w * S, f.h * S);
        ctx.globalAlpha = 1;
      }
    }
    const g = this.gate && renderer.assets.sheet('gate');
    if (g?.image) {
      const S = this.gate.scale ?? 0.5;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(g.image, this.gate.x, this.gate.y - g.image.height * S, g.image.width * S, g.image.height * S);
    }
  }
}
