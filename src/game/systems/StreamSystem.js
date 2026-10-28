import { createEnemy } from '../entities/enemies/index.js';

// Para niveles con scroll: los enemigos aparecen sin parar por el borde derecho de la pantalla,
// más y más variados según avanzas por el nivel. (Más adelante: enemigos en puntos fijos del mapa.)
export class StreamSystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.timer = 120;
    this.banner = 0;
    this.progress = 0; // 0..1
  }

  start() {
    this.reset();
  }

  tickBanner() {}

  // Misma interfaz que WaveSystem: "number" sube con el avance (los enemigos usan eso para la dificultad).
  get number() {
    return 1 + Math.floor(this.progress * 5);
  }

  pickType() {
    const p = this.progress;
    const r = Math.random();
    if (p > 0.3 && r < 0.18) return 'leaper';
    if (p > 0.12 && r < 0.5) return 'shooter';
    return 'runner';
  }

  update(game) {
    const { level, player } = game;
    this.progress = Math.min(1, player.cx / (level.goalX ?? level.width));
    if (--this.timer > 0) return;
    const maxOnScreen = 3 + Math.floor(this.progress * 4);
    if (game.enemies.length >= maxOnScreen) {
      this.timer = 30;
      return;
    }
    game.enemies.push(createEnemy(this.pickType(), game));
    this.timer = Math.max(50, 120 - this.progress * 60) + Math.random() * 60;
  }
}
