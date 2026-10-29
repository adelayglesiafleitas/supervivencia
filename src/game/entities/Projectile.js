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
      // bala diminuta con estela de motion blur en la dirección del movimiento
      const tx = this.x - this.vx * 1.6;
      const ty = this.y - this.vy * 1.6;
      const g = ctx.createLinearGradient(tx, ty, this.x, this.y);
      g.addColorStop(0, 'rgba(255,230,140,0)');
      g.addColorStop(1, 'rgba(255,245,200,0.9)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
      ctx.fillStyle = '#fffbe0';
      ctx.fillRect(this.x - 0.75, this.y - 0.75, 1.5, 1.5);
    } else {
      ctx.fillStyle = '#ff5a5a';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
