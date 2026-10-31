import type { WindConfig } from './wind';

// Shared shapes used by the engine. Positions are normalised (0..1) relative
// to the board so the same layout works on any screen size.

export interface SlotDef {
  id: string;
  x: number; // centre, 0..1 of board width
  y: number; // centre, 0..1 of board height
  w: number; // px
  h: number; // px
  /** Slots sharing a group form one container, e.g. a drawer compartment. */
  group?: string;
  /** Grid position, for row/column rules. */
  row?: number;
  col?: number;
  /** Outline slot: the piece here must have these props... */
  want?: PieceProps;
  /** ...and this rotation (compared modulo wantRotMod, default 360). */
  wantRot?: number;
  wantRotMod?: number;
  /** Faint picture of what belongs here (inline SVG), drawn at wantRot. */
  ghost?: string;
}

/** Purely visual backdrop (shelf, tray compartment). Fully normalised. */
export interface AreaDef {
  x: number; // centre
  y: number;
  w: number; // fraction of board width
  h: number; // fraction of board height
  /** Fixed height in px instead of `h`, for backdrops that must hug pieces. */
  hPx?: number;
  className?: string;
  /** Text shown in the area, e.g. a target like "8p". */
  label?: string;
  /** Background tint, e.g. the colour a paint bowl should end up. */
  colour?: string;
}

/** Facts about a piece that win rules can inspect (length, hue, type...). */
export type PieceProps = Record<string, number | string>;

export interface PieceDef {
  id: string;
  /** Inline SVG markup for the object's art. */
  svg: string;
  /** Where it starts, normalised like slots; `rot` = starting tilt in degrees. */
  start: { x: number; y: number; rot?: number; state?: number };
  props?: PieceProps;
  rotatable?: boolean;
  /** Degrees turned per tap (default 90; dominoes use 180 to flip). */
  rotateStep?: number;
  /** A "given": starts in this slot and can't be moved. */
  fixedIn?: string;
  /** Visual size in px, used by layout checks in tests. */
  size?: { w: number; h: number };
  /** Tap cycles through these looks; each can change the piece's props. */
  states?: { svg: string; props?: PieceProps }[];
  /** Grime to polish off with the cloth (number of rubs). */
  dirt?: number;
  /** Turned freely by dragging around its centre (straightening frames). */
  spin?: boolean;
  /** A tool rather than a thing to tidy: the cloth polishes what it rubs. */
  tool?: 'cloth';
}

/** Live state of a piece on the board. */
export interface PieceState {
  def: PieceDef;
  el: HTMLElement;
  x: number;           // current centre, normalised 0..1 (survives resizes)
  y: number;
  rotation: number;    // degrees; snapped pieces sit on a multiple of 90
  slotId: string | null;
  state: number;       // index into def.states (0 if none)
  dirt: number;        // rubs left before it's clean (0 if none)
}

/** Read-only view of the board handed to win rules. */
export interface BoardView {
  slots: SlotDef[];
  pieces: PieceState[];
  /** The piece resting in a slot, if any. */
  pieceIn(slotId: string): PieceState | undefined;
}

/**
 * A win rule is just a predicate: "is the board solved under this rule?"
 * It may also offer `possible`: "could a half-filled board still pass?",
 * which lets the solver give up on dead ends early.
 */
export type WinRule = ((board: BoardView) => boolean) & { possible?: (board: BoardView) => boolean };

/** Everything needed to play one level. Pure data plus rule functions. */
export interface LevelConfig {
  id: string;
  name: string;
  hint: string;
  snapRadius: number;
  slots: SlotDef[];
  pieces: PieceDef[];
  areas?: AreaDef[];
  /** Optional live visuals: runs after every move (e.g. a scale's needle). */
  decorate?(view: BoardView, boardEl: HTMLElement): void;
  /** Optional nuisance: an occasional gust that nudges a placed piece. */
  wind?: WindConfig;
  /** The level is solved when ANY rule passes (= multiple valid solutions). */
  rules: WinRule[];
  /** One known answer (generated levels), used by tests. */
  solution?: SolutionStep[];
  /** A known answer for each rule (rules are the level's distinct solutions). */
  solutions?: SolutionStep[][];
  /** No written rule on screen: it lives in the hint, like the original game. */
  wordless?: boolean;
  /** Logic puzzle: tests check the givens leave exactly one answer. */
  unique?: boolean;
  /** Loose pieces live in a scrolling tray of this height (px) at the bottom. */
  trayHeight?: number;
}

/** "Put this piece in this slot, turned this far." */
export interface SolutionStep {
  slot: string;
  piece: string;
  rotation?: number;
  state?: number;
  /** Polished clean. */
  clean?: boolean;
}
