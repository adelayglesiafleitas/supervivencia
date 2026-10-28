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
    // Ratón: se trata como una tecla más ('Mouse0' = izquierdo, 'Mouse2' = derecho).
    this.onMouseDown = (e) => {
      const code = 'Mouse' + e.button;
      if (this.keyToAction.has(code)) this.down.add(code);
    };
    this.onMouseUp = (e) => this.down.delete('Mouse' + e.button);
    this.onContextMenu = (e) => e.preventDefault(); // sin menú contextual del clic derecho
  }

  attach() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('contextmenu', this.onContextMenu);
    this.down.clear();
  }

  detach() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('contextmenu', this.onContextMenu);
    this.down.clear();
  }

  isDown(action) {
    const codes = this.controls[action];
    return !!codes && codes.some((c) => this.down.has(c));
  }
}
