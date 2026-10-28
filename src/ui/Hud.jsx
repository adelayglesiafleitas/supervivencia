export default function Hud({ hud }) {
  return (
    <div className="hud">
      <div className="hud-left">
        <div>VIDAS {'♥'.repeat(Math.max(0, hud.lives))}</div>
        <div>
          {hud.level} · OLEADA {hud.wave}
        </div>
      </div>
      <div className="hud-right">
        <div>PUNTOS {hud.score}</div>
        <div>TIEMPO {hud.seconds}s</div>
        <div className="hud-powers">
          PODERES
          {[0, 1].map((i) => (
            <span key={i} className={'slot' + (i === 0 && hud.powers[0] ? ' active' : '')}>
              {hud.powers[i] ? `${hud.powers[i].kind.toUpperCase()} ${hud.powers[i].ammo}` : '—'}
            </span>
          ))}
        </div>
      </div>
      {hud.banner > 0 && <div className="hud-banner">OLEADA {hud.banner}</div>}
      {hud.seconds < 7 && (
        <div className="hud-hint">
          A/D mover · W apuntar arriba · S agacharse · K/Espacio saltar · S+salto bajar de plataforma · Clic izq. disparar · Clic der. poder
        </div>
      )}
    </div>
  );
}
