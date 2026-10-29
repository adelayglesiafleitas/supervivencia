export default function MainMenu({ onStart, onEditor }) {
  return (
    <div className="overlay center dim">
      <h1>SURVIVAL CONTRA</h1>
      <p className="sub">Elige un modo</p>
      <div className="menu-modes">
        <button onClick={() => onStart('survival')}>
          Supervivencia (1)
          <small>Un solo escenario. Aguanta las oleadas.</small>
        </button>
        <button onClick={() => onStart('jungle')}>
          Nivel 1 (2)
          <small>Avanza por la jungla hasta la base.</small>
        </button>
      </div>
      <button className="secondary" onClick={onEditor}>Editor de animación (3)</button>
      <p className="controls">
        A/D mover · W apuntar arriba · S agacharse · K/Espacio saltar · S + salto: bajar de plataforma
        <br />
        Clic izquierdo: disparar · Clic derecho: usar poder guardado (hasta 2)
      </p>
    </div>
  );
}
