// Saved progress: which level ids are solved. Stored as JSON in localStorage.
const KEY = 'justso.progress.v1'; // bump the version if the shape changes

export function loadSolved(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    const ids: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set(); // storage blocked or corrupt: play on without saves
  }
}

export function markSolved(levelId: string): void {
  const solved = loadSolved();
  solved.add(levelId);
  try {
    localStorage.setItem(KEY, JSON.stringify([...solved]));
  } catch {
    /* ignore: progress just won't persist */
  }
}
