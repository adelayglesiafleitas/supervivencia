// Bala o proyectil. team: 'player' | 'enemy'. g > 0 => trayectoria en parábola.
export class Projectile {
  constructor({ x, y, vx, vy, g = 0, life, team }) {
    Object.assign(this, { x, y, vx, vy, g, life, team });
  }

  update() {
    if (this.g) this.vy += this.g;
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  draw(ctx) {
    if (this.team === 'player') {
      ctx.fillStyle = '#ffe36b';
      ctx.fillRect(this.x - 2, this.y - 2, 5, 5);
    } else {
      ctx.fillStyle = '#ff5a5a';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
