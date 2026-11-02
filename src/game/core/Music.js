// Música del juego: public/audio/jungle.mp3 (en bucle). Tecla M = silenciar.
export class Music {
  constructor() {
    this.muted = false;
    this.el = null;
    this.onKey = (e) => {
      if (e.code === 'KeyM') this.toggleMute();
    };
    // si el navegador bloquea el audio hasta el primer gesto, reintenta con la siguiente tecla o clic
    this.retry = () => {
      if (this.wanted && this.el?.paused) this.el.play().catch(() => {});
    };
  }

  // Arranca con el volumen a 0 y sube poco a poco. Si ya está sonando no hace nada (sigue del menú a la partida).
  play() {
    this.el ??= new Audio(`${import.meta.env.BASE_URL}audio/jungle.mp3`);
    const el = this.el;
    if (this.wanted && !el.paused) return;
    el.loop = true;
    el.muted = this.muted;
    if (!this.wanted) {
      el.currentTime = 0;
      el.volume = 0;
      this.fade();
    }
    this.wanted = true;
    el.play().catch(() => {});
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keydown', this.retry);
    window.addEventListener('pointerdown', this.retry);
  }

  fade(seconds = 5, target = 0.5) {
    clearInterval(this.fadeTimer);
    const t0 = performance.now();
    this.fadeTimer = setInterval(() => {
      const u = Math.min(1, (performance.now() - t0) / (seconds * 1000));
      if (this.el) this.el.volume = target * u;
      if (u >= 1) clearInterval(this.fadeTimer);
    }, 50);
  }

  stop() {
    clearInterval(this.fadeTimer);
    this.wanted = false;
    this.el?.pause();
    window.removeEventListener('keydown', this.onKey);
    window.removeEventListener('keydown', this.retry);
    window.removeEventListener('pointerdown', this.retry);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.el) this.el.muted = this.muted;
  }
}
