// Level kit: describe a level by its SOLVED state (which item ends up in
// which slot) and assemble() derives pieces, givens, the scrambled start
// and the recorded solution. Layout helpers place slots on the board.
import type { AreaDef, LevelConfig, PieceDef, PieceProps, SlotDef, SolutionStep, WinRule } from '../engine/types';
import type { WindConfig } from '../engine/wind';
import { makeRng } from './rng';

/** Smallest board we design for (320x568 phone), in px. */
export const MIN_W = 288;
export const MIN_H = 380;

/** Something that can be placed: its art, the facts rules read, its size. */
export interface Item {
  svg: string;
  props: PieceProps;
  w: number;
  h: number;
  rotatable?: boolean;
  rotateStep?: number;
  /** Rotation it must end up at (default 0). */
  solvedRot?: number;
  /** Start rotation before the random tilt (e.g. 180 = upside down). */
  startRot?: number;
  /** Outline symmetry: rotations equal modulo this count as matching. */
  rotMod?: number;
  /** Tap-to-change looks; `startState` is how it starts, `solvedState` its answer. */
  states?: { svg: string; props?: PieceProps }[];
  startState?: number;
  solvedState?: number;
  /** Grimy: this many rubs with the cloth to polish. */
  dirt?: number;
  /** Turned freely by dragging (frames); start at `startRot`, answer `solvedRot`. */
  spin?: boolean;
  tool?: 'cloth';
}

/** Another way to solve the same level: a rearrangement of the solved items. */
export interface Alternative {
  rule: WinRule;
  /** order[i] = index (into `solved`) of the item in slot i; default unchanged. */
  order?: number[];
  /** Per slot: the state that item ends in for this way. */
  states?: (number | undefined)[];
  /** Per slot: the rotation for this way. */
  rotations?: (number | undefined)[];
}

export interface Spec {
  id: string;
  name: string;
  hint: string;
  slots: SlotDef[];
  /** solved[i] is the item that belongs in slots[i]. */
  solved: Item[];
  /** Slot indices that start filled and locked. */
  given?: number[];
  /** Extra pieces that don't belong anywhere. */
  decoys?: Item[];
  areas?: AreaDef[];
  rules: WinRule[];
  /** Slots show a ghost of their item; these props must match. */
  outlines?: { keys: string[]; rotation?: boolean; ghost?: boolean };
  /** Rotatable loose pieces start turned away from their answer. */
  turn?: boolean;
  /** Max random start tilt in degrees (default 6). */
  tilt?: number;
  wind?: WindConfig;
  decorate?: LevelConfig['decorate'];
  snapRadius?: number;
  unique?: boolean;
  /** Further ways to solve it (rules[0] is the first way). */
  also?: Alternative[];
  /** Tools to work with (the cloth), kept in the tray. */
  tools?: Item[];
  /** Rule only in the hint, as in the original game. */
  wordless?: boolean;
}

/** Tiny string hash so each level id gets its own random seed. */
const hash = (s: string) => [...s].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;

export function assemble(spec: Spec): LevelConfig {
  const rng = makeRng(hash(spec.id));
  const given = new Set(spec.given ?? []);
  const slots: SlotDef[] = spec.slots.map((s, i) => {
    if (!spec.outlines) return s;
    const it = spec.solved[i];
    const want = Object.fromEntries(spec.outlines.keys.map((k) => [k, it.props[k]]));
    return {
      ...s, want, ...(spec.outlines.ghost !== false && { ghost: it.svg }),
      ...(spec.outlines.rotation && { wantRot: it.solvedRot ?? 0, wantRotMod: it.rotMod ?? 360 }),
    };
  });

  const piece = (it: Item, id: string, fixedIn?: string): PieceDef => ({
    id, svg: it.svg, props: it.props, size: { w: it.w, h: it.h },
    rotatable: it.rotatable, rotateStep: it.rotateStep,
    // Givens sit at their answer, except things you must still turn or tap.
    start: {
      x: 0.5, y: 0.8,
      rot: it.spin ? it.startRot ?? 0 : fixedIn ? it.solvedRot ?? 0 : startRot(it),
      state: it.startState ?? 0,
    },
    ...(fixedIn && { fixedIn }),
    ...(it.states && { states: it.states }),
    ...(it.dirt && { dirt: it.dirt }),
    ...(it.spin && { spin: true }),
    ...(it.tool && { tool: it.tool }),
  });

  const startRot = (it: Item) => {
    const tilt = rng.range(-(spec.tilt ?? 6), spec.tilt ?? 6);
    if (!(spec.turn && it.rotatable)) return (it.startRot ?? 0) + tilt;
    // Turned away from its answer, by a turn that actually looks different.
    const step = it.rotateStep ?? 90;
    const mod = it.rotMod ?? 360;
    const options = [1, 2, 3].map((k) => k * step).filter((r) => r < 360 && r % mod !== 0);
    return (it.solvedRot ?? 0) + (options.length ? rng.pick(options) : 0) + tilt;
  };

  const fixed = spec.solved.flatMap((it, i) => (given.has(i) ? [piece(it, `p${i}`, slots[i].id)] : []));
  // Loose pieces start in the tray, in a shuffled order.
  const loose = rng.shuffle([
    ...spec.solved.flatMap((it, i) => (given.has(i) ? [] : [piece(it, `p${i}`)])),
    ...(spec.decoys ?? []).map((it, k) => piece(it, `x${k}`)),
  ]);
  const tools = (spec.tools ?? []).map((it, k) => piece(it, `t${k}`));

  /** One recorded answer: which piece ends in each slot, turned/tapped/polished. */
  const answer = (order: number[], states: (number | undefined)[] = [], rotations: (number | undefined)[] = []): SolutionStep[] =>
    order.flatMap((k, i) => {
      const it = spec.solved[k];
      if (given.has(i) && !it.spin && !it.states && !it.dirt) return []; // nothing to do
      return [{
        slot: slots[i].id, piece: `p${k}`,
        ...((it.rotatable || it.spin) && { rotation: rotations[i] ?? it.solvedRot ?? 0 }),
        ...(it.states && { state: states[i] ?? it.solvedState ?? 0 }),
        ...(it.dirt && { clean: true }),
      }];
    });
  const identity = spec.solved.map((_, i) => i);
  const solutions = [answer(identity), ...(spec.also ?? []).map((a) => answer(a.order ?? identity, a.states, a.rotations))];

  return {
    id: spec.id,
    name: spec.name,
    hint: spec.hint,
    snapRadius: spec.snapRadius ?? 34,
    slots,
    areas: spec.areas,
    pieces: [...fixed, ...loose, ...tools],
    rules: [...spec.rules, ...(spec.also ?? []).map((a) => a.rule)],
    wordless: spec.wordless,
    wind: spec.wind,
    decorate: spec.decorate,
    unique: spec.unique,
    trayHeight: loose.length + tools.length ? trayHeightFor([...loose, ...tools]) : undefined,
    solution: solutions[0],
    solutions,
  };
}

/** Tray tall enough for the tallest loose piece, at any rotation it may take. */
export function trayHeightFor(pieces: PieceDef[]): number {
  const tallest = Math.max(0, ...pieces.map((p) => (p.rotatable ? Math.max(p.size!.w, p.size!.h) : p.size!.h)));
  return Math.max(64, tallest + 22);
}

// ---- Layouts ----------------------------------------------------------------
// All return slots in reading order; ids are short and unique per level.

/** n slots in a row. */
export function row(n: number, o: { y: number; w: number; h: number; x0?: number; x1?: number; id?: string }): SlotDef[] {
  const [x0, x1] = [o.x0 ?? 0.12, o.x1 ?? 0.88];
  return Array.from({ length: n }, (_, i) => ({
    id: `${o.id ?? 's'}${i}`, x: n === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (n - 1), y: o.y, w: o.w, h: o.h,
  }));
}

/** n slots stacked top to bottom. */
export function column(n: number, o: { x: number; y0: number; y1: number; w: number; h: number }): SlotDef[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `s${i}`, x: o.x, y: n === 1 ? o.y0 : o.y0 + ((o.y1 - o.y0) * i) / (n - 1), w: o.w, h: o.h,
  }));
}

/** A rows x cols grid of square cells, centred, starting at y0. */
export function grid(rows: number, cols: number, o: { cell: number; h?: number; y0: number; gap?: number }): SlotDef[] {
  const h = o.h ?? o.cell;
  const sx = (o.cell + (o.gap ?? 5)) / MIN_W;
  const sy = (h + (o.gap ?? 5)) / MIN_H;
  const out: SlotDef[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push({ id: `r${r}c${c}`, row: r, col: c, x: 0.5 + (c - (cols - 1) / 2) * sx, y: o.y0 + r * sy, w: o.cell, h });
    }
  }
  return out;
}

/**
 * Containers side by side (jars, mats, pans...), each holding `sizes[g]`
 * slots in a row ('row') or stacked ('col'). Returns slots and backdrops.
 */
export function groups(
  sizes: number[],
  o: {
    y: number; w: number; h: number; dir?: 'row' | 'col'; gap?: number; area?: string;
    labels?: string[]; colours?: string[]; x0?: number; x1?: number;
    /** Number of the first group (for a second row of containers). */
    start?: number;
  },
): { slots: SlotDef[]; areas: AreaDef[] } {
  const dir = o.dir ?? 'row';
  const pitchX = (o.w + (o.gap ?? 6)) / MIN_W;
  const pitchY = (o.h + (o.gap ?? 6)) / MIN_H;
  const centres = row(sizes.length, { y: o.y, w: 0, h: 0, x0: o.x0 ?? 0.2, x1: o.x1 ?? 0.8 }).map((s) => s.x);
  const slots: SlotDef[] = [];
  const areas: AreaDef[] = [];
  sizes.forEach((n, k) => {
    const g = k + (o.start ?? 0);
    for (let i = 0; i < n; i++) {
      const off = i - (n - 1) / 2;
      slots.push({
        id: `g${g}s${i}`, group: `g${g}`, w: o.w, h: o.h,
        x: centres[k] + (dir === 'row' ? off * pitchX : 0),
        y: o.y + (dir === 'col' ? off * pitchY : 0),
      });
    }
    const spanW = dir === 'row' ? n * pitchX : pitchX;
    const spanH = dir === 'col' ? n * (o.h + (o.gap ?? 6)) : o.h + (o.gap ?? 6);
    areas.push({
      x: centres[k], y: o.y, w: spanW + 0.03, h: 0, hPx: spanH + 10 + (o.labels ? 14 : 0),
      className: o.area ?? 'compartment', label: o.labels?.[k], colour: o.colours?.[k],
    });
  });
  return { slots, areas };
}

/** n slots around a circle (e.g. seats at a round table), clockwise from the top. */
export function circle(n: number, o: { cy: number; r: number; w: number; h: number }): SlotDef[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { id: `s${i}`, x: 0.5 + (Math.cos(a) * o.r) / MIN_W, y: o.cy + (Math.sin(a) * o.r) / MIN_H, w: o.w, h: o.h };
  });
}
