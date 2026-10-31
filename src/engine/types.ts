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
}

/** Facts about a piece that win rules can inspect (length, hue, type...). */
export type PieceProps = Record<string, number | string>;

export interface PieceDef {
  id: string;
  /** Inline SVG markup for the object's art. */
  svg: string;
  /** Where it starts, normalised like slots; `rot` = starting tilt in degrees. */
  start: { x: number; y: number; rot?: number };
  props?: PieceProps;
  rotatable?: boolean;
  /** Degrees turned per tap (default 90; dominoes use 180 to flip). */
  rotateStep?: number;
}

/** Live state of a piece on the board. */
export interface PieceState {
  def: PieceDef;
  el: HTMLElement;
  x: number;           // current centre, normalised 0..1 (survives resizes)
  y: number;
  rotation: number;    // degrees; snapped pieces sit on a multiple of 90
  slotId: string | null;
}

/** Read-only view of the board handed to win rules. */
export interface BoardView {
  slots: SlotDef[];
  pieces: PieceState[];
  /** The piece resting in a slot, if any. */
  pieceIn(slotId: string): PieceState | undefined;
}

/** A win rule is just a predicate: "is the board solved under this rule?" */
export type WinRule = (board: BoardView) => boolean;

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
}

/** "Put this piece in this slot, turned this far." */
export interface SolutionStep {
  slot: string;
  piece: string;
  rotation?: number;
}
