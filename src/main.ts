// Entry point. Stage 1: a sandbox with one draggable pencil and three slots.
import './style.css';
import { createBoard } from './engine/board';
import { pencil } from './levels/art';

const app = document.querySelector<HTMLDivElement>('#app')!;

const title = document.createElement('h1');
title.className = 'title';
title.textContent = 'Just So';

const hint = document.createElement('p');
hint.className = 'hint';
hint.textContent = 'Drag the pencil into a slot.';

const board = createBoard({
  snapRadius: 60,
  slots: [0.3, 0.45, 0.6].map((y, i) => ({ id: `s${i}`, x: 0.5, y, w: 220, h: 32 })),
  pieces: [{ id: 'p0', svg: pencil(180), start: { x: 0.5, y: 0.85 } }],
  onChange(_pieces, event) {
    hint.textContent = event === 'snap' ? 'Snapped. Try another slot.' : 'Close, but not in a slot.';
    if (event === 'snap') navigator.vibrate?.(10); // haptic tick where supported
  },
});

app.append(title, hint, board.el);
