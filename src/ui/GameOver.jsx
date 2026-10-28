export default function GameOver({ result, onRestart }) {
  return (
    <div className="overlay center dim">
      <h1>GAME OVER</h1>
      <p className="sub">
        Oleada {result.wave} · {result.score} puntos · {result.seconds}s
      </p>
      <button onClick={onRestart}>Reintentar (R)</button>
    </div>
  );
}
