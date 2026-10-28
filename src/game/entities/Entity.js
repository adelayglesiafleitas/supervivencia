// Base de todo lo que tiene posición y caja de colisión en el mundo.
export class Entity {
  constructor({ x = 0, y = 0, w = 0, h = 0 } = {}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.face = 1; // 1 = derecha, -1 = izquierda
    this.t = 0; // tiempo vivo en segundos (para animaciones)
    this.onGround = false;
  }

  get cx() {
    return this.x + this.w / 2;
  }

  update(/* game */) {}

  draw(/* renderer */) {}
}
