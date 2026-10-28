import { useEffect, useRef } from 'react';
import { Game } from '../game/Game.js';
import { EventBus } from '../game/core/EventBus.js';

// Monta el juego dentro de un <canvas>. React no vuelve a tocar el canvas:
// el bucle del juego corre por su cuenta y solo avisa por eventos.
export default function GameCanvas({ assets, gameRef, onHud, onGameOver }) {
  const canvasRef = useRef(null);
  const callbacks = useRef({ onHud, onGameOver });
  callbacks.current = { onHud, onGameOver };

  useEffect(() => {
    const bus = new EventBus();
    bus.on('hud', (h) => callbacks.current.onHud(h));
    bus.on('gameover', (r) => callbacks.current.onGameOver(r));
    const game = new Game({ canvas: canvasRef.current, assets, bus });
    gameRef.current = game;
    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, [assets, gameRef]);

  return <canvas ref={canvasRef} className="game-canvas" />;
}
