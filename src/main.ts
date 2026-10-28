// Entry point: decides which screen is showing.
import './style.css';
import { LEVELS } from './levels';
import { showGame } from './ui/screens';

const app = document.querySelector<HTMLDivElement>('#app')!;
let cleanup: (() => void) | null = null;

function play(index: number): void {
  cleanup?.();
  cleanup = showGame(app, {
    level: LEVELS[index],
    levelNumber: index + 1,
    onSolved: () => {},  // progress saving arrives in stage 3
    // Wraps to the first level until more levels exist.
    onNext: () => play((index + 1) % LEVELS.length),
  });
}

play(0);
