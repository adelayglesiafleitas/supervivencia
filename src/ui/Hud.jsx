export default function Hud({ hud }) {
  return (
    <div className="hud">
      <div className="hud-left">
        <div>VIDAS {'♥'.repeat(Math.max(0, hud.lives))}</div>
        <div>OLEADA {hud.wave}</div>
      </div>
      <div className="hud-right">
        <div>PUNTOS {hud.score}</div>
        <div>TIEMPO {hud.seconds}s</div>
        {hud.weapon === 'spread' && <div>SPREAD {hud.weaponSeconds}</div>}
      </div>
      {hud.banner > 0 && <div className="hud-banner">OLEADA {hud.banner}</div>}
      {hud.seconds < 7 && (
        <div className="hud-hint">
          A/D mover · W apuntar arriba · S agacharse · K/Espacio saltar · S+salto bajar de plataforma · J/Z disparar
        </div>
      )}
    </div>
  );
}
