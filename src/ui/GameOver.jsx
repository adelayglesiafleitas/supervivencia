export default function GameOver({ result, onRestart, onMenu }) {
  return (
    <div className="overlay center dim">
      <h1>{result.won ? 'NIVEL COMPLETADO' : 'GAME OVER'}</h1>
      <p className="sub">
        {result.won ? '' : `Oleada ${result.wave} · `}
        {result.score} puntos · {result.seconds}s
      </p>
      <button onClick={onRestart}>Reintentar (R)</button>
      <button className="secondary" onClick={onMenu}>
        Menú (Esc)
      </button>
    </div>
  );
}
