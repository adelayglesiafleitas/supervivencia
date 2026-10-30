// Música del nivel 1: tema ORIGINAL estilo "jungla de acción" generado con WebAudio (sin archivos).
// Bucle de 8 compases a 156 BPM en Mi menor. Tecla M = silenciar.

const BPM = 156;
const STEP = 60 / BPM / 4; // semicorchea
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

// acordes por compás (fundamental MIDI) y arpegio del lead (semitonos sobre la fundamental)
const BARS = [
  { r: 40, m: [12, 15, 19, 15, 12, 15, 19, 22, 24, 22, 19, 15, 19, 15, 12, 15] }, // Em
  { r: 40, m: [12, 12, 15, 19, 22, 19, 15, 12, 24, 24, 22, 19, 15, 19, 22, 24] }, // Em
  { r: 36, m: [16, 19, 24, 19, 16, 19, 24, 28, 31, 28, 24, 19, 24, 19, 16, 19] }, // C
  { r: 38, m: [18, 21, 26, 21, 18, 21, 26, 30, 33, 30, 26, 21, 26, 30, 33, 30] }, // D
  { r: 40, m: [12, 15, 19, 15, 12, 15, 19, 22, 24, 27, 24, 22, 19, 22, 24, 22] }, // Em
  { r: 43, m: [12, 14, 19, 14, 12, 14, 19, 23, 24, 23, 19, 14, 19, 14, 12, 14] }, // G
  { r: 36, m: [16, 19, 24, 19, 16, 19, 24, 28, 31, 28, 24, 28, 31, 28, 24, 19] }, // C
  { r: 35, m: [14, 18, 23, 18, 14, 18, 23, 26, 30, 26, 23, 18, 23, 26, 30, 35] }, // B (tensión)
];

export class Music {
  constructor() {
    this.ctx = null;
    this.timer = null;
    this.muted = false;
    this.onKey = (e) => {
      if (e.code === 'KeyM') this.toggleMute();
    };
  }

  // Si hay un archivo en public/audio/jungle.mp3 suena ese; si no, el tema sintetizado.
  playFile() {
    this.el ??= new Audio(`${import.meta.env.BASE_URL}audio/jungle.mp3`);
    const el = this.el;
    el.loop = true;
    el.volume = 0.5;
    el.muted = this.muted;
    el.currentTime = 0;
    el.play().catch(() => this.playSynth());
    this.fileOn = true;
    window.addEventListener('keydown', this.onKey);
  }

  play() {
    this.playFile();
  }

  playSynth() {
    if (this.timer) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx ??= new AC();
    this.ctx.resume?.();
    if (!this.master) {
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.22;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 0.5;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    this.step = 0;
    this.next = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 40);
    window.addEventListener('keydown', this.onKey);
  }

  stop() {
    if (this.el) this.el.pause();
    this.fileOn = false;
    clearInterval(this.timer);
    this.timer = null;
    window.removeEventListener('keydown', this.onKey);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.el) this.el.muted = this.muted;
    if (this.master) this.master.gain.value = this.muted ? 0 : 0.22;
  }

  schedule() {
    while (this.next < this.ctx.currentTime + 0.25) {
      this.note(this.step, this.next);
      this.next += STEP;
      this.step = (this.step + 1) % (BARS.length * 16);
    }
  }

  tone(type, freq, t, dur, vol) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  hit(t, dur, vol, hp) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.noise;
    const f = this.ctx.createBiquadFilter();
    f.type = hp ? 'highpass' : 'bandpass';
    f.frequency.value = hp ? 7000 : 1800;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f).connect(g).connect(this.master);
    s.start(t);
    s.stop(t + dur + 0.02);
  }

  kick(t) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + 0.2);
  }

  note(step, t) {
    const bar = BARS[Math.floor(step / 16)];
    const s = step % 16;
    // bajo: corcheas con salto de octava
    if (s % 2 === 0) this.tone('sawtooth', midi(bar.r - 12 + (s % 8 === 6 ? 12 : 0)), t, STEP * 1.8, 0.35);
    // lead: arpegio de onda cuadrada
    this.tone('square', midi(bar.r + bar.m[s]), t, STEP * 0.9, 0.12);
    // armonía suave una octava abajo, solo en los tiempos fuertes
    if (s % 4 === 0) this.tone('triangle', midi(bar.r + bar.m[s] - 12), t, STEP * 3.5, 0.18);
    // batería
    if (s === 0 || s === 8 || s === 10) this.kick(t);
    if (s === 4 || s === 12) this.hit(t, 0.12, 0.5, false);
    if (s % 2 === 0) this.hit(t, 0.04, 0.18, true);
    if (step % 64 === 63 && s >= 12) this.hit(t, 0.05, 0.4, false); // redoble final
  }
}
