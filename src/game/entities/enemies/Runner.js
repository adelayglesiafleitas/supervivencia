import { Leaper } from './Leaper.js';
import { RUNNER_ANIM as A } from '../../data/animations.js';

// Soldado corredor: persigue al jugador. Usa la misma inteligencia de plataformas que el Leaper:
// no se cae por el borde de los acantilados; si hay una plataforma a la que llegar saltando, salta;
// si no hay forma segura de avanzar, se queda esperando en el borde.
export class Runner extends Leaper {
  constructor(game) {
    super(game, 'runner');
    this.speed = 2 + Math.random() * 0.8 + game.waves.number * 0.05;
  }

  draw(renderer) {
    const frame = this.onGround ? A.run[Math.floor(this.t * A.fps) % A.run.length] : A.air;
    renderer.drawFrame(A.sheet, frame, this, 'foot', '#c0392b', A.native);
  }
}
