import { WallTurret } from '../entities/enemies/WallTurret.js';
import { FlyCapsule } from '../entities/enemies/FlyCapsule.js';
import { BossCannon, BossCore, FortressSniper } from '../entities/enemies/BossParts.js';

// Medidas de la fortaleza (píxeles de gate.png; se pasan a mundo con la escala del objeto).
const G_TOP = 938; // alto de la imagen
const PARTS = {
  cannons: [
    { ix: 335, iy: 85, w: 78, h: 56, mx: 272, my: 26, hp: 16, delay: 0, img: 'gateC1', ox: 267, oy: 12 },
    { ix: 285, iy: 92, w: 66, h: 44, mx: 203, my: 62, hp: 16, delay: 45, img: 'gateC2', ox: 198, oy: 56 },
  ],
  core: { ix: 80, iy: 648, w: 64, h: 80, hp: 50 },
  sniper: { ix: 100, iy: 90 },
};

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
    this.gate = this.defs.find((d) => d.kind === 'gate');
    this.boss = null;
    const extra = [];
    if (this.gate?.boss) {
      const g = this.gate;
      const S = g.scale ?? 0.5;
      const top = g.y - G_TOP * S;
      // tejado de la torre izquierda, donde se planta el francotirador
      extra.push({ x: g.x + 10 * S, y: top + 90 * S, w: 180 * S, h: 10 });
      this.boss = { on: false, cannons: [], core: null, sniper: null, sniperT: 0, shieldT: 0, dying: 0 };
    }
    lv.platforms = lv._basePlatforms.concat(this.bridges.map((b) => b.plat), extra);
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
    if (this.boss) this.updateBoss(game);
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

  // Mundo <- píxeles de la imagen de la fortaleza
  gx(ix) {
    return this.gate.x + ix * (this.gate.scale ?? 0.5);
  }

  gy(iy) {
    return this.gate.y - (G_TOP - iy) * (this.gate.scale ?? 0.5);
  }

  updateBoss(game) {
    const B = this.boss;
    const g = this.gate;
    const S = g.scale ?? 0.5;
    if (!B.on) {
      if (game.camera.x + game.world.w < g.x + 150) return;
      B.on = true;
      for (const c of PARTS.cannons) {
        const e = new BossCannon(B, { cx: this.gx(c.ix), cy: this.gy(c.iy), w: c.w * S, h: c.h * S, mx: this.gx(c.mx), my: this.gy(c.my), hp: c.hp, delay: c.delay });
        B.cannons.push(e);
        game.enemies.push(e);
      }
      const k = PARTS.core;
      B.core = new BossCore(B, { cx: this.gx(k.ix), cy: this.gy(k.iy), w: k.w, h: k.h, hp: k.hp });
      game.enemies.push(B.core);
    }
    if (B.shieldT > 0) B.shieldT--;
    if (B.dying > 0) {
      B.dying++;
      if (B.dying % 5 === 0) {
        const x = g.x + Math.random() * 235 * S * 2;
        const y = this.gy(Math.random() * G_TOP * 0.9);
        game.particles.burst(x, y, 14, Math.random() < 0.5 ? '#ff9a3c' : '#ffe08a');
      }
      if (B.dying >= 170) game.finish(true);
      return;
    }
    if (B.core.hp <= 0) {
      B.dying = 1;
      game.enemyProjectiles.length = 0;
      if (B.sniper) B.sniper.hp = 0;
      return;
    }
    // francotirador del tejado: reaparece mientras el núcleo siga vivo
    if (!B.sniper || B.sniper.dead) {
      if (++B.sniperT > 300) {
        B.sniperT = 0;
        B.sniper = new FortressSniper(game, this.gx(PARTS.sniper.ix), this.gy(PARTS.sniper.iy) - 70);
        game.enemies.push(B.sniper);
      }
    }
  }

  drawGate(renderer) {
    const { ctx, assets } = renderer;
    const g = this.gate;
    const S = g.scale ?? 0.5;
    const t = performance.now() / 1000;
    ctx.imageSmoothingEnabled = true;
    const top = g.y - G_TOP * S;
    if (!g.boss) {
      const im = assets.sheet('gate')?.image;
      if (im) ctx.drawImage(im, g.x, top, im.width * S, im.height * S);
      return;
    }
    const base = assets.sheet('gateBase')?.image;
    if (!base) return;
    const B = this.boss;
    ctx.drawImage(base, g.x, top, base.width * S, base.height * S);
    PARTS.cannons.forEach((c, i) => {
      const alive = !B.on || B.cannons[i].hp > 0;
      const im = assets.sheet(c.img)?.image;
      if (!im) return;
      if (alive) {
        ctx.drawImage(im, g.x + c.ox * S, top + c.oy * S, im.width * S, im.height * S);
        if (B.on && B.cannons[i].flashT > 0) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = 0.55;
          ctx.drawImage(im, g.x + c.ox * S, top + c.oy * S, im.width * S, im.height * S);
          ctx.restore();
        }
      }
    });
    // luz del núcleo
    const cx = this.gx(PARTS.core.ix);
    const cy = this.gy(PARTS.core.iy);
    const dead = B.on && B.core.hp <= 0;
    const open = B.on && B.cannons.every((c) => c.hp <= 0);
    let a = 0.16;
    let col = '90,140,255';
    if (open) {
      a = 0.5 + 0.3 * Math.sin(t * 8);
      col = '255,60,40';
    }
    if (B.on && B.core.flashT > 0) {
      a = 0.9;
      col = '255,230,210';
    }
    if (B.shieldT > 0) {
      a = 0.7;
      col = '120,170,255';
    }
    if (dead) {
      a = 0.9;
      col = '255,150,60';
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const rg = ctx.createRadialGradient(cx, cy, 4, cx, cy, 46);
    rg.addColorStop(0, `rgba(${col},${a})`);
    rg.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = rg;
    ctx.fillRect(cx - 50, cy - 50, 100, 100);
    ctx.restore();
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
    if (this.gate) this.drawGate(renderer);
  }
}
