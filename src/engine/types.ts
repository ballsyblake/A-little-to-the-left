// Shared shapes used by the engine. Positions are normalised (0..1) relative
// to the board so the same layout works on any screen size.

export interface SlotDef {
  id: string;
  x: number; // centre, 0..1 of board width
  y: number; // centre, 0..1 of board height
  w: number; // px
  h: number; // px
}

export interface PieceDef {
  id: string;
  /** Inline SVG markup for the object's art. */
  svg: string;
  /** Where it starts, normalised like slots. */
  start: { x: number; y: number };
  rotatable?: boolean;
}

/** Live state of a piece on the board. */
export interface PieceState {
  def: PieceDef;
  el: HTMLElement;
  x: number;           // current centre, normalised 0..1 (survives resizes)
  y: number;
  rotation: number;    // degrees, multiples of 90
  slotId: string | null;
}
