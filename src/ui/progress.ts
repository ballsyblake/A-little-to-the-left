// Saved progress: for each level, which of its solutions have been found.
// Stored as JSON in localStorage: { "level-id": [0, 2], ... }.
const KEY = 'justso.progress.v2'; // bump the version if the shape changes
const OLD_KEY = 'justso.progress.v1'; // v1 was a list of solved level ids

export type Progress = Map<string, Set<number>>;

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data: unknown = JSON.parse(raw);
      if (data && typeof data === 'object') {
        return new Map(Object.entries(data as Record<string, unknown>)
          .filter(([, v]) => Array.isArray(v))
          .map(([k, v]) => [k, new Set((v as unknown[]).filter((x): x is number => typeof x === 'number'))]));
      }
    }
    // Carry over v1 saves: each solved level counts its first solution.
    const old: unknown = JSON.parse(localStorage.getItem(OLD_KEY) ?? '[]');
    return new Map((Array.isArray(old) ? old : []).filter((x): x is string => typeof x === 'string').map((id) => [id, new Set([0])]));
  } catch {
    return new Map(); // storage blocked or corrupt: play on without saves
  }
}

/** Record that solution `index` of a level has been found. */
export function markFound(levelId: string, index: number): void {
  const progress = loadProgress();
  const found = progress.get(levelId) ?? new Set<number>();
  found.add(index);
  progress.set(levelId, found);
  try {
    localStorage.setItem(KEY, JSON.stringify(Object.fromEntries([...progress].map(([k, v]) => [k, [...v]]))));
  } catch {
    /* ignore: progress just won't persist */
  }
}
