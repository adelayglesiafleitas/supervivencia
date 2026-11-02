import { useEffect, useState } from 'react';
import TitleBackdrop from './TitleBackdrop.jsx';

// Pantalla de título estilo retro: logo arriba, héroes a la derecha y menú "PLAY SELECT" con cursor.
// Los dibujos son opcionales: public/sprites/ui/title_logo.png y title_heroes.png (si no están, se usa texto).
const TITLE = 'SURVIVAL CONTRA';
const DIFFS = [
  ['easy', 'FÁCIL'],
  ['normal', 'NORMAL'],
  ['hard', 'DIFÍCIL'],
];
const BASE = import.meta.env.BASE_URL;

export default function MainMenu({ assets, onStart, onEditor, difficulty, onDifficulty }) {
  const [started, setStarted] = useState(false); // false: "pulsa start", true: menú
  const [sel, setSel] = useState(0);
  const [logoOk, setLogoOk] = useState(true);
  const [heroesOk, setHeroesOk] = useState(true);

  const items = [
    { label: 'NIVEL 1', run: () => onStart('jungle') },
    { label: 'SUPERVIVENCIA', run: () => onStart('survival') },
    { label: 'DIFICULTAD', diff: true },
    { label: 'EDITOR', run: onEditor },
  ];

  useEffect(() => {
    const move = (d) => {
      const i = DIFFS.findIndex(([id]) => id === difficulty);
      onDifficulty(DIFFS[(i + d + DIFFS.length) % DIFFS.length][0]);
    };
    const onKey = (e) => {
      if (!started) {
        if (e.code === 'Enter' || e.code === 'Space') setStarted(true);
        return;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') setSel((s) => (s + 1) % items.length);
      else if (e.code === 'ArrowUp') setSel((s) => (s + items.length - 1) % items.length);
      else if (e.code === 'ArrowLeft' && items[sel].diff) move(-1);
      else if (e.code === 'ArrowRight' && items[sel].diff) move(1);
      else if (e.code === 'Enter' || e.code === 'Space') {
        if (items[sel].diff) move(1);
        else items[sel].run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const dname = DIFFS.find(([id]) => id === difficulty)?.[1] ?? 'NORMAL';

  return (
    <div className="overlay title" onClick={() => !started && setStarted(true)}>
      <TitleBackdrop assets={assets} />
      <div className="title-logo">
        {logoOk ? <img src={`${BASE}sprites/ui/title_logo.png`} alt={TITLE} onError={() => setLogoOk(false)} /> : <h1>{TITLE}</h1>}
      </div>
      {heroesOk && <img className="title-heroes" src={`${BASE}sprites/ui/title_heroes.png`} alt="" onError={() => setHeroesOk(false)} />}
      {!started ? (
        <div className="title-press">PULSA ENTER</div>
      ) : (
        <div className="title-menu">
          <div className="title-select">PLAY SELECT</div>
          {items.map((it, i) => (
            <div
              key={it.label}
              className={'title-item' + (sel === i ? ' on' : '')}
              onMouseEnter={() => setSel(i)}
              onClick={(e) => {
                e.stopPropagation();
                if (it.diff) onDifficulty(DIFFS[(DIFFS.findIndex(([id]) => id === difficulty) + 1) % DIFFS.length][0]);
                else it.run();
              }}
            >
              <span className="cursor">{sel === i ? '▶' : ''}</span>
              {it.label}
              {it.diff && <span className="dval"> ◀ {dname} ▶</span>}
            </div>
          ))}
        </div>
      )}
      <div className="title-foot">
        A/D mover · W apuntar arriba · S agacharse · K/Espacio saltar · Clic: disparar · Clic der.: poder
      </div>
    </div>
  );
}
