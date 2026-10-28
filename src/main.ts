// Entry point: a tiny router that swaps between screens.
import './style.css';
import { LEVELS } from './levels';
import { unlockAudioOnFirstGesture } from './ui/audio';
import { loadSolved, markSolved } from './ui/progress';
import { showGame, showLevelSelect } from './ui/screens';

const app = document.querySelector<HTMLDivElement>('#app')!;
let cleanup: () => void = () => {};

function levelSelect(): void {
  cleanup();
  cleanup = showLevelSelect(app, { levels: LEVELS, solved: loadSolved(), onPick: play });
}

function play(index: number): void {
  cleanup();
  const level = LEVELS[index];
  cleanup = showGame(app, {
    level,
    levelNumber: index + 1,
    onSolved: () => markSolved(level.id),
    // After the last level, go back to the level list.
    onNext: () => (index + 1 < LEVELS.length ? play(index + 1) : levelSelect()),
    onBack: levelSelect,
  });
}

unlockAudioOnFirstGesture();
levelSelect();
