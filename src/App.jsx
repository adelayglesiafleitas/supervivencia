import { useCallback, useEffect, useRef, useState } from 'react';
import { Assets } from './game/core/Assets.js';
import { ASSET_MANIFEST } from './game/data/assets.js';
import GameCanvas from './ui/GameCanvas.jsx';
import Hud from './ui/Hud.jsx';
import MainMenu from './ui/MainMenu.jsx';
import GameOver from './ui/GameOver.jsx';
import AnimEditor from './ui/AnimEditor.jsx';

// La app de React solo gestiona pantallas (menú / partida / fin) y muestra el HUD.
// El juego en sí vive en src/game y no depende de React.
export default function App() {
  const [assets, setAssets] = useState(null);
  const [error, setError] = useState(null);
  const [screen, setScreen] = useState('menu'); // 'menu' | 'playing' | 'over' | 'editor'
  const [hud, setHud] = useState(null);
  const [result, setResult] = useState(null);
  const gameRef = useRef(null);
  const modeRef = useRef('survival'); // último modo elegido (para reintentar)
  const [difficulty, setDifficultyState] = useState(() => {
    try { return localStorage.getItem('difficulty') || 'normal'; } catch { return 'normal'; }
  });
  const diffRef = useRef(difficulty);
  const chooseDifficulty = useCallback((d) => {
    diffRef.current = d;
    setDifficultyState(d);
    try { localStorage.setItem('difficulty', d); } catch { /* sin almacenamiento */ }
  }, []);

  useEffect(() => {
    new Assets()
      .load(ASSET_MANIFEST)
      .then(setAssets)
      .catch((e) => setError(e.message));
  }, []);

  const startGame = useCallback((mode) => {
    if (typeof mode === 'string') modeRef.current = mode;
    setResult(null);
    setScreen('playing');
    gameRef.current?.start(modeRef.current, diffRef.current);
  }, []);

  const handleGameOver = useCallback((r) => {
    setResult(r);
    setScreen('over');
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (screen === 'menu' && e.code === 'Digit1') startGame('survival');
      if (screen === 'menu' && e.code === 'Digit2') startGame('jungle');
      if (screen === 'menu' && e.code === 'Digit3') setScreen('editor');
      if (screen === 'menu' && e.code === 'KeyQ') chooseDifficulty('easy');
      if (screen === 'menu' && e.code === 'KeyW') chooseDifficulty('normal');
      if (screen === 'menu' && e.code === 'KeyE') chooseDifficulty('hard');
      if (screen === 'editor' && e.code === 'Escape') setScreen('menu');
      if (screen === 'over' && (e.code === 'KeyR' || e.code === 'Enter')) startGame();
      if (screen === 'over' && e.code === 'Escape') setScreen('menu');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, startGame, chooseDifficulty]);

  return (
    <div className="stage">
      {assets && <GameCanvas assets={assets} gameRef={gameRef} onHud={setHud} onGameOver={handleGameOver} />}
      {screen === 'playing' && hud && <Hud hud={hud} />}
      {!assets && !error && <div className="overlay center">Cargando...</div>}
      {error && <div className="overlay center error">{error}</div>}
      {assets && screen === 'menu' && <MainMenu onStart={startGame} onEditor={() => setScreen('editor')} difficulty={difficulty} onDifficulty={chooseDifficulty} />}
      {assets && screen === 'editor' && <AnimEditor assets={assets} onClose={() => setScreen('menu')} />}
      {screen === 'over' && result && <GameOver result={result} onRestart={() => startGame()} onMenu={() => setScreen('menu')} />}
    </div>
  );
}
