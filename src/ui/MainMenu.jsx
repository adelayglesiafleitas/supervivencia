export default function MainMenu({ onStart }) {
  return (
    <div className="overlay center dim">
      <h1>SURVIVAL CONTRA</h1>
      <p className="sub">Sobrevive a las oleadas. Un solo escenario.</p>
      <button onClick={onStart}>Empezar (Enter)</button>
      <p className="controls">
        A/D mover · W apuntar arriba · S agacharse · K/Espacio saltar · S + salto: bajar de plataforma
        <br />
        Clic izquierdo: disparar · Clic derecho: usar poder guardado (hasta 2)
      </p>
    </div>
  );
}
