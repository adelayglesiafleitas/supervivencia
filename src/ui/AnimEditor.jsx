import { useEffect, useMemo, useRef, useState } from 'react';
import { ANIM_LIST, resetAnimFps, saveAnimFps } from '../game/data/animations.js';

const ZOOM = 4; // píxeles de pantalla por unidad de mundo en la vista previa

// Editor de animación: lista de animaciones, vista previa y velocidad (fotogramas por segundo).
export default function AnimEditor({ assets, onClose }) {
  const [sel, setSel] = useState(ANIM_LIST[0].id);
  const anim = useMemo(() => ANIM_LIST.find((a) => a.id === sel), [sel]);
  const [fps, setFps] = useState(anim.get());
  const [playing, setPlaying] = useState(true);
  const [frame, setFrame] = useState(0);
  const [mirror, setMirror] = useState(false);
  const [pingpong, setPingpong] = useState(false);
  const [, bump] = useState(0);
  const [msg, setMsg] = useState('');
  const canvasRef = useRef(null);
  const st = useRef({ t: 0, dir: 1 });

  // al cambiar de animación, carga su velocidad y reinicia
  useEffect(() => {
    setFps(anim.get());
    setFrame(0);
    st.current = { t: 0, dir: 1 };
  }, [anim]);

  const change = (v) => {
    const n = Math.max(1, Math.min(60, Number(v) || 1));
    setFps(n);
    anim.set(n);
    saveAnimFps();
    bump((x) => x + 1);
  };

  // reloj de la reproducción
  useEffect(() => {
    let raf;
    let last = performance.now();
    const loop = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (playing) {
        const s = st.current;
        s.t += dt * fps;
        const n = anim.frames.length;
        while (s.t >= 1) {
          s.t -= 1;
          setFrame((f) => {
            if (pingpong) {
              let nx = f + s.dir;
              if (nx >= n) { s.dir = -1; nx = Math.max(0, n - 2); }
              else if (nx < 0) { s.dir = 1; nx = Math.min(1, n - 1); }
              return nx;
            }
            return (f + 1) % n;
          });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, fps, anim, pingpong]);

  // dibujo
  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const sheet = assets.sheet(anim.sheet);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = '#16161e';
    ctx.fillRect(0, 0, cv.width, cv.height);
    const gx = cv.width / 2;
    const gy = cv.height - 70;
    ctx.strokeStyle = '#ffffff22';
    ctx.beginPath();
    ctx.moveTo(0, gy); ctx.lineTo(cv.width, gy);
    ctx.moveTo(gx, 0); ctx.lineTo(gx, cv.height);
    ctx.stroke();
    // altura de referencia de Drake de pie (70 unidades)
    ctx.strokeStyle = '#ffffff12';
    ctx.strokeRect(gx - 13 * ZOOM, gy - 68 * ZOOM, 26 * ZOOM, 68 * ZOOM);
    const f = sheet?.frames[anim.frames[Math.min(frame, anim.frames.length - 1)]];
    if (!f) return;
    const S = (sheet.scale ?? 2) * ZOOM;
    ctx.save();
    ctx.imageSmoothingEnabled = sheet.smooth ?? false;
    const flip = (mirror ? -1 : 1) * anim.native < 0;
    if (anim.mode === 'center') {
      ctx.translate(gx, gy - 40 * ZOOM);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(sheet.image, f.x, f.y, f.w, f.h, (-f.w * S) / 2, (-f.h * S) / 2, f.w * S, f.h * S);
    } else {
      ctx.translate(gx, gy);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(sheet.image, f.x, f.y, f.w, f.h, -f.ax * S, -f.h * S, f.w * S, f.h * S);
    }
    ctx.restore();
  }, [assets, anim, frame, mirror]);

  const groups = [...new Set(ANIM_LIST.map((a) => a.group))];
  const sheet = assets.sheet(anim.sheet);
  const n = anim.frames.length;
  const dur = (n / fps).toFixed(2);

  const exportJson = () => {
    const txt = JSON.stringify(Object.fromEntries(ANIM_LIST.map((a) => [a.id, a.get()])), null, 2);
    navigator.clipboard?.writeText(txt);
    setMsg(navigator.clipboard ? 'Copiado' : txt);
    setTimeout(() => setMsg(''), 2500);
  };

  return (
    <div className="overlay editor">
      <div className="ed-head">
        <h2>Editor de animación</h2>
        <div className="ed-head-btns">
          <button className="secondary" onClick={exportJson}>{msg || 'Copiar velocidades'}</button>
          <button className="secondary" onClick={() => { resetAnimFps(); setFps(anim.get()); bump((x) => x + 1); }}>Restablecer todo</button>
          <button onClick={onClose}>Volver (Esc)</button>
        </div>
      </div>
      <div className="ed-body">
        <div className="ed-list">
          {groups.map((g) => (
            <div key={g}>
              <h3>{g}</h3>
              {ANIM_LIST.filter((a) => a.group === g).map((a) => (
                <button key={a.id} className={'ed-item' + (a.id === sel ? ' on' : '')} onClick={() => setSel(a.id)}>
                  <span>{a.label}</span>
                  <small>{a.frames.length} frames · {a.get()} fps</small>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="ed-main">
          <canvas ref={canvasRef} width={720} height={420} className="ed-canvas" />
          <div className="ed-strip">
            {anim.frames.map((fn, i) => {
              const f = sheet.frames[fn];
              const k = 56 / Math.max(f.w, f.h);
              return (
                <button
                  key={fn}
                  className={'ed-thumb' + (i === frame ? ' on' : '')}
                  onClick={() => { setPlaying(false); setFrame(i); }}
                  title={fn}
                >
                  <div style={{ width: f.w * k, height: f.h * k, backgroundImage: `url(${sheet.image.src})`, backgroundSize: `${sheet.image.width * k}px ${sheet.image.height * k}px`, backgroundPosition: `${-f.x * k}px ${-f.y * k}px`, imageRendering: 'auto' }} />
                  <small>{i}</small>
                </button>
              );
            })}
          </div>
        </div>
        <div className="ed-panel">
          <h3>{anim.label}</h3>
          <label>
            <span>Velocidad: <b>{fps}</b> fps</span>
            <input type="range" min="1" max="60" value={fps} onChange={(e) => change(e.target.value)} />
          </label>
          <div className="ed-row">
            <button className="secondary" onClick={() => change(fps - 1)}>−1</button>
            <input type="number" min="1" max="60" value={fps} onChange={(e) => change(e.target.value)} />
            <button className="secondary" onClick={() => change(fps + 1)}>+1</button>
          </div>
          <div className="ed-row">
            {[6, 8, 12, 15, 24, 30].map((v) => (
              <button key={v} className={'secondary' + (fps === v ? ' on' : '')} onClick={() => change(v)}>{v}</button>
            ))}
          </div>
          <p className="ed-info">
            {n} frames · ciclo de {dur} s{anim.note ? ' ' + anim.note : ''}
            <br />Original: {anim.def} fps
          </p>
          <div className="ed-row">
            <button className="secondary" onClick={() => { setPlaying(false); setFrame((frame + n - 1) % n); }}>◀</button>
            <button onClick={() => setPlaying(!playing)}>{playing ? 'Pausa' : 'Play'}</button>
            <button className="secondary" onClick={() => { setPlaying(false); setFrame((frame + 1) % n); }}>▶</button>
          </div>
          <label className="ed-check"><input type="checkbox" checked={pingpong} onChange={(e) => setPingpong(e.target.checked)} /> Ida y vuelta</label>
          <label className="ed-check"><input type="checkbox" checked={mirror} onChange={(e) => setMirror(e.target.checked)} /> Mirar a la izquierda</label>
          <p className="ed-info small">Los cambios se guardan solos y valen en la partida.</p>
        </div>
      </div>
    </div>
  );
}
