// Canal de eventos mínimo. El juego emite ('hud', 'gameover'...) y la UI de React escucha.
export class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  on(event, fn) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event).add(fn);
    return () => this.off(event, fn);
  }

  off(event, fn) {
    this.handlers.get(event)?.delete(fn);
  }

  emit(event, payload) {
    this.handlers.get(event)?.forEach((fn) => fn(payload));
  }

  clear() {
    this.handlers.clear();
  }
}
