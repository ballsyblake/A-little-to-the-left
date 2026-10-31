// The hint: a sketch of one solution hidden under pencil scribble. Rub the
// scribble away with a finger to reveal as much (or as little) as you like.
import { bindGestures } from '../engine/input';
import type { LevelConfig, SolutionStep } from '../engine/types';

export interface HintOptions {
  level: LevelConfig;
  /** Which solution to sketch (the first one not found yet). */
  solutionIndex: number;
  /** The live board, for its size. */
  board: HTMLElement;
}

/** The recorded answer for a solution, if the level has one. */
function stepsFor(level: LevelConfig, i: number): SolutionStep[] | undefined {
  return level.solutions?.[i] ?? (i === 0 ? level.solution : undefined);
}

/** Open the hint panel over `app`. Returns a function that closes it. */
export function openHint(app: HTMLElement, o: HintOptions): () => void {
  const overlay = document.createElement('div');
  overlay.className = 'hint-overlay';
  const card = document.createElement('div');
  card.className = 'hint-card';
  overlay.append(card);

  const text = document.createElement('p');
  text.className = 'hint-text is-hidden';
  text.textContent = o.level.hint;
  text.title = 'Tap to read';
  text.addEventListener('click', () => text.classList.remove('is-hidden'));
  card.append(text);

  const steps = stepsFor(o.level, o.solutionIndex);
  let unbind = () => {};
  if (steps) {
    const { sketch, width, height } = drawSketch(o.level, steps, o.board);
    const wrap = document.createElement('div');
    wrap.className = 'hint-sketch';
    wrap.style.width = `${width}px`;
    wrap.style.height = `${height}px`;
    const canvas = document.createElement('canvas');
    wrap.append(sketch, canvas);
    card.append(wrap);
    const note = document.createElement('p');
    note.className = 'hint-note';
    note.textContent = o.level.rules.length > 1 ? `Rub to reveal way ${o.solutionIndex + 1} of ${o.level.rules.length}.` : 'Rub to reveal.';
    card.append(note);
    unbind = scribble(canvas, width, height);
  }

  const close = document.createElement('button');
  close.className = 'btn';
  close.textContent = 'Back to tidying';
  card.append(close);
  app.append(overlay);

  const done = () => {
    unbind();
    overlay.remove();
  };
  close.addEventListener('click', done);
  return done;
}

/** A small, non-interactive copy of the board showing one solution. */
function drawSketch(level: LevelConfig, steps: SolutionStep[], board: HTMLElement) {
  const W = board.clientWidth;
  const H = board.clientHeight - (level.trayHeight ?? 0);
  const scale = Math.min(1, 260 / W, 300 / H);
  const sketch = document.createElement('div');
  sketch.className = 'sketch-board';
  sketch.style.width = `${W}px`;
  sketch.style.height = `${H}px`;
  sketch.style.transform = `scale(${scale})`;

  const place = (html: string, x: number, y: number, rot: number, cls: string) => {
    const d = document.createElement('div');
    d.className = cls;
    d.innerHTML = html;
    d.style.left = `${x * W}px`;
    d.style.top = `${y * board.clientHeight}px`;
    d.style.transform = `translate(-50%, -50%) rotate(${rot}deg)`;
    sketch.append(d);
  };
  for (const s of level.slots) {
    place('', s.x, s.y, 0, 'sketch-slot');
    const last = sketch.lastElementChild as HTMLElement;
    last.style.width = `${s.w}px`;
    last.style.height = `${s.h}px`;
  }
  const at = (slotId: string) => level.slots.find((s) => s.id === slotId)!;
  // Givens, then the solution's pieces, each in its state and turn.
  const placed = [
    ...level.pieces.filter((p) => p.fixedIn && !steps.some((st) => st.piece === p.id))
      .map((p) => ({ def: p, slot: p.fixedIn!, rot: p.start.rot ?? 0, state: p.start.state ?? 0 })),
    ...steps.map((st) => ({ def: level.pieces.find((p) => p.id === st.piece)!, slot: st.slot, rot: st.rotation ?? 0, state: st.state ?? 0 })),
  ];
  for (const { def, slot, rot, state } of placed) {
    const s = at(slot);
    place(def.states?.[state]?.svg ?? def.svg, s.x, s.y, rot, 'sketch-piece');
  }
  return { sketch, width: Math.round(W * scale), height: Math.round(H * scale) };
}

/** Cover a canvas in pencil scribble and let the finger rub it away. */
function scribble(canvas: HTMLCanvasElement, width: number, height: number): () => void {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const g = canvas.getContext('2d');
  if (!g) return () => {};
  g.scale(dpr, dpr);
  g.fillStyle = '#f6efe6';
  g.fillRect(0, 0, width, height);
  g.strokeStyle = 'rgba(91, 81, 73, 0.5)';
  g.lineWidth = 2.2;
  g.lineCap = 'round';
  // Loose looping pencil strokes, back and forth across the sketch.
  for (let i = 0; i < 70; i++) {
    const y = (i / 70) * height;
    g.beginPath();
    g.moveTo(-10, y + Math.random() * 20);
    for (let x = 0; x < width + 20; x += 30) g.quadraticCurveTo(x + 15, y + (Math.random() - 0.5) * 40, x + 30, y + Math.random() * 20);
    g.stroke();
  }

  let last: { x: number; y: number } | null = null;
  const rub = (p: { x: number; y: number }) => {
    g.globalCompositeOperation = 'destination-out'; // erase instead of paint
    g.lineWidth = 34;
    g.beginPath();
    g.moveTo((last ?? p).x, (last ?? p).y);
    g.lineTo(p.x, p.y);
    g.stroke();
    last = p;
  };
  return bindGestures(canvas, canvas, {
    onDragStart: (start, now) => { last = start; rub(now); },
    onDragMove: rub,
    onDragEnd: () => { last = null; },
    onTap: () => {},
  });
}
