# Survival Contra

Juego 2D de supervivencia estilo Contra: un escenario, oleadas de enemigos.
Stack: **JavaScript + React (solo interfaz) + Vite**. El motor es propio y no depende de React.

## Arrancar

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # versión final en /dist
npm run preview  # probar la versión final
```

Controles: A/D mover · W apuntar arriba · S agacharse · K/Espacio saltar · S+salto bajar de plataforma · J/Z disparar · Enter/R empezar o reintentar.

## Idea de la arquitectura

Tres capas, y cada una solo conoce a la de debajo:

```
ui (React)  ──►  Game (orquestador)  ──►  core + entities + systems + data
```

- **React** solo pinta menús, HUD y pantalla de fin. No guarda posiciones ni balas.
- **Game** no sabe que existe React. Se comunica con la interfaz por eventos (`hud`, `gameover`).
- **Los datos** (niveles, oleadas, animaciones, estadísticas) están separados del código. Ampliar el juego es casi siempre añadir datos, no tocar el motor.

## Estructura

```
public/sprites/          Atlas PNG + frames.json (se sirven tal cual)
src/
  main.jsx, App.jsx      Entrada de React y control de pantallas
  styles.css
  ui/                    Componentes React: GameCanvas, Hud, MainMenu, GameOver
  game/
    Game.js              Orquesta una partida (update / render / estado)
    config.js            Resolución, física, jugador, controles
    core/                Motor genérico, reutilizable en otros juegos
      Loop.js            Bucle de paso fijo (60 pasos/s)
      Input.js           Teclado -> acciones
      Renderer.js        Único sitio que toca el canvas (escala, sprites, volteo)
      Assets.js          Carga de atlas
      physics.js         Gravedad, plataformas, colisiones AABB
      EventBus.js        Eventos juego -> UI
    entities/            Todo lo que existe en el mundo
      Entity.js, Player.js, Projectile.js, Pickup.js
      enemies/           Enemy (base), Runner, Shooter, Turret, index.js (registro)
    systems/             Lógica que afecta a varias entidades
      WaveSystem.js      Oleadas y ritmo de aparición
      CollisionSystem.js Balas, daño, contacto, recogidas
      Particles.js
    render/drawLevel.js  Fondo y plataformas
    data/                Solo datos
      assets.js          Manifiesto de atlas
      animations.js      Qué frames usa cada acción
      enemies.js         Vida, tamaño, puntos
      waves.js           Composición de cada oleada
      levels/level01.js  Plataformas y aspecto del nivel
```

## Cómo ampliar

**Cambiar los sprites.** Sustituye los PNG y `frames.json` de `public/sprites/` y ajusta `data/animations.js`. Cada frame es `{ x, y, w, h, ax }` (`ax` = X de los pies dentro del frame). Si el tamaño cambia, ajusta `SPRITE_SCALE` y las cajas de colisión (`PLAYER` en `config.js`, `data/enemies.js`).

**Subir la resolución.** `RENDER.scale` en `config.js` (1 = 960x540, 2 = 1920x1080, 3 = 2880x1620). Con arte de alta resolución pon `RENDER.smooth = true`. La lógica del mundo no cambia.

**Añadir un enemigo.**
1. Stats en `data/enemies.js`.
2. Animaciones en `data/animations.js`.
3. Clase en `entities/enemies/` que herede de `Enemy` (`update` y `draw`).
4. Regístrala en `entities/enemies/index.js`.
5. Úsala en `data/waves.js`.

**Añadir un nivel.** Copia `data/levels/level01.js`, cambia plataformas y colores, y pásalo a `new Game({ level })`. Para encadenar niveles, el siguiente paso natural es que `Game` reciba una lista de niveles y pase al siguiente al acabar sus oleadas.

**Cambiar controles.** `CONTROLS` en `config.js`. El juego pregunta por acciones (`jump`, `fire`), nunca por teclas.

**Nueva arma.** Añade el tipo en `Player.shoot()` y su cooldown en `config.js`; el objeto recogible está en `entities/Pickup.js`.

## Reglas para mantenerlo escalable

- Nada de estado del juego en `useState`. Si la UI necesita un dato, se añade a `Game.getHud()`.
- `core/` no importa nada de `entities/` ni `data/`. Las entidades no importan React.
- Números mágicos a `config.js` o a `data/`.
- Un archivo por entidad o sistema.

## Siguientes pasos sugeridos

- Pausa y sonido (un `core/Audio.js` con el mismo patrón que `Assets.js`).
- Jefe final como un `Enemy` más con fases.
- Varios niveles encadenados.
- Mando (Gamepad API) dentro de `Input.js`, sin tocar el resto.
- Pruebas automáticas de `physics.js` y `WaveSystem` (no dependen del navegador).

## Nota sobre el arte

Los sprites actuales son temporales, de una hoja de Contra de Konami. Hay que sustituirlos antes de publicar el juego.
