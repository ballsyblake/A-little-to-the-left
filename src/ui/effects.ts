// Visual + haptic feedback. Animations run on each piece's inner <svg>,
// because the outer element's transform is already used for position.

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Short vibration where supported (Android; iOS Safari ignores it). */
export function haptic(pattern: number | number[] = 10): void {
  navigator.vibrate?.(pattern);
}

/** Tiny squash when a piece lands in a slot. */
export function plop(pieceEl: HTMLElement): void {
  if (reducedMotion()) return;
  pieceEl.firstElementChild?.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(0.94)' }, { transform: 'scale(1)' }],
    { duration: 220, easing: 'ease-out' },
  );
}

/**
 * Win "settle": pieces pulse one after another, then the board breathes.
 * Resolves when finished so the caller can reveal the Next button after.
 */
export async function settle(board: HTMLElement, pieceEls: HTMLElement[]): Promise<void> {
  if (reducedMotion()) return;
  const stagger = 70;
  const pulses = pieceEls.map((el, i) =>
    el.firstElementChild?.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }],
      { duration: 360, delay: i * stagger, easing: 'cubic-bezier(.3,.7,.4,1)' },
    ),
  );
  // Literal colours: var() inside script keyframes isn't reliable everywhere.
  const edge = 'inset 0 0 0 2px #dccfbe';
  const breathe = board.animate(
    [
      { transform: 'scale(1)', boxShadow: edge },
      { transform: 'scale(1.015)', boxShadow: 'inset 0 0 0 4px #9cc5b0' },
      { transform: 'scale(1)', boxShadow: edge },
    ],
    { duration: 600, delay: pieceEls.length * stagger, easing: 'ease-in-out' },
  );
  await Promise.all([...pulses, breathe].map((a) => a?.finished));
}

/** Draw a few soft streaks sweeping across the board: the gust arriving. */
export function gustStreaks(board: HTMLElement, fromLeft: boolean): void {
  if (reducedMotion()) return;
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('div');
    s.className = 'gust';
    s.style.top = `${30 + Math.random() * 40}%`;
    board.append(s);
    const dx = board.clientWidth + 160;
    s.animate(
      [
        { transform: `translateX(${fromLeft ? -160 : dx}px)`, opacity: 0 },
        { opacity: 0.7, offset: 0.3 },
        { transform: `translateX(${fromLeft ? dx : -160}px)`, opacity: 0 },
      ],
      { duration: 900, delay: i * 90, easing: 'ease-in-out' },
    ).finished.then(() => s.remove());
  }
}

/** A short shiver on a piece just before the wind moves it. */
export function shiver(pieceEl: HTMLElement): void {
  if (reducedMotion()) return;
  pieceEl.firstElementChild?.animate(
    [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(2deg)' },
      { transform: 'rotate(-2deg)' },
      { transform: 'rotate(0deg)' },
    ],
    { duration: 300, iterations: 1 },
  );
}
