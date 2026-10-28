// Teclado -> acciones. El resto del juego pregunta por acciones ('jump', 'fire'),
// nunca por teclas, así los controles se cambian solo en config.js.
export class Input {
  constructor(controls) {
    this.controls = controls;
    this.down = new Set();
    this.keyToAction = new Map();
    for (const [action, codes] of Object.entries(controls))
      for (const c of codes) this.keyToAction.set(c, action);
    this.onKeyDown = (e) => {
      if (this.keyToAction.has(e.code)) e.preventDefault();
      this.down.add(e.code);
    };
    this.onKeyUp = (e) => this.down.delete(e.code);
    this.onBlur = () => this.down.clear();
  }

  attach() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  detach() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.down.clear();
  }

  isDown(action) {
    const codes = this.controls[action];
    return !!codes && codes.some((c) => this.down.has(c));
  }
}
