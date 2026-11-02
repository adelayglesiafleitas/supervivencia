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

  play() {
    this.el ??= new Audio(`${import.meta.env.BASE_URL}audio/jungle.mp3`);
    const el = this.el;
    el.loop = true;
    el.volume = 0.5;
    el.muted = this.muted;
    el.currentTime = 0;
    this.wanted = true;
    el.play().catch(() => {});
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('keydown', this.retry);
    window.addEventListener('pointerdown', this.retry);
  }

  stop() {
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
