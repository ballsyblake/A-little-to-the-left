// Item builders: art + the facts rules read + footprint, in one call.
import { book, domino, fork, knife, magnet, pencil, spoon, swatch, weight, BOOK_CANVAS, WEIGHT_CANVAS } from './art';
import type { Item } from './kit';
import {
  block, candle, card, coin, coinSize, cutter, die, egg, isRed, jar, mug, paintPot, photoTile, poly, polySize,
  sock, stamp, stone, teacup, tile, CANDLE_CANVAS, JAR_CANVAS, MUG_CANVAS, type CoinValue, type Scene, type Shape, type Suit,
} from './objects';

/** Soft palette shared by many levels. */
export const C = {
  pink: '#f4b6a6', mint: '#a8d5c2', blue: '#b9c6ef', yellow: '#f6d38b', lilac: '#d9c2ea',
  peach: '#f7c9a0', teal: '#8fcfcf', rose: '#e9a3b8', sage: '#bcd3a1', sky: '#a9d3ef',
  cream: '#f3e3cf', cocoa: '#b98f6e', red: '#e58f86', green: '#9ccf9c',
};

export const pencilI = (length: number, colour: string): Item => ({ svg: pencil(length, colour), props: { len: length, c: colour }, w: length, h: 18 });
export const bookI = (hue: number, height: number, w = 30): Item => ({ svg: book(hue, height, w), props: { hue, h: height }, w, h: BOOK_CANVAS });
export const mugI = (colour: string, h: number): Item => ({ svg: mug(colour, h), props: { c: colour, h }, w: 44, h: MUG_CANVAS });
export const sockI = (colour: string, stripe?: string): Item => ({ svg: sock(colour, stripe), props: { look: `${colour}/${stripe ?? ''}`, c: colour }, w: 34, h: 56 });
export const jarI = (lid: string, h: number, label?: string): Item => ({ svg: jar(lid, h, label), props: { lid, h }, w: 32, h: JAR_CANVAS });
export const candleI = (h: number, colour: string): Item => ({ svg: candle(h, colour), props: { h, c: colour }, w: 24, h: CANDLE_CANVAS });
export const coinI = (v: CoinValue): Item => ({ svg: coin(v), props: { v }, w: coinSize(v), h: coinSize(v) });
export const blockI = (n: number, colour?: string, size = 42): Item => ({ svg: block(n, colour, size), props: { n }, w: size, h: size });
export const eggI = (colour: string): Item => ({ svg: egg(colour), props: { c: colour }, w: 34, h: 42 });
export const dieI = (n: number): Item => ({ svg: die(n), props: { n }, w: 40, h: 40 });
export const potI = (colour: string): Item => ({ svg: paintPot(colour), props: { c: colour }, w: 36, h: 40 });
export const stoneI = (n: number): Item => ({ svg: stone(n), props: { n }, w: 46, h: 38 });
export const cupI = (colour: string, big = false): Item => ({ svg: teacup(colour, big), props: { c: colour, big: big ? 1 : 0 }, w: big ? 44 : 35, h: big ? 34 : 27 });
export const stampI = (v: number, colour: string): Item => ({ svg: stamp(v, colour), props: { v, c: colour }, w: 40, h: 46 });
export const weightI = (kg: number): Item => ({ svg: weight(kg), props: { kg }, w: 24 + kg * 2, h: WEIGHT_CANVAS });
export const swatchI = (colour: string, rank: number, w = 34): Item => ({ svg: swatch(colour, w), props: { rank, c: colour }, w, h: 64 });
export const magnetI = (letter: string, colour: string, size = 46): Item => ({ svg: magnet(letter, colour, size), props: { l: letter }, w: size, h: size + 6 });

export const tileI = (colour: string, symbol?: Shape, size = 42, symColour?: string): Item => ({
  svg: tile(colour, symbol, symColour, size), props: { c: colour, sym: symbol ?? '' }, w: size, h: size,
});

const FACE: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
export const cardI = (rank: number, suit: Suit, w = 40): Item => ({
  svg: card(FACE[rank] ?? rank, suit, w), props: { rank, suit, red: isRed(suit) ? 1 : 0 }, w, h: Math.round((w * 54) / 40),
});

export const dominoI = (l: number, r: number): Item => ({
  svg: domino(l, r), props: { left: l, right: r }, w: 56, h: 28, rotatable: true, rotateStep: 180,
});

const CUTLERY = { knife, fork, spoon };
export const cutleryI = (type: keyof typeof CUTLERY, startRot = 0): Item => ({
  svg: CUTLERY[type](), props: { type }, w: 22, h: 120, rotatable: true, startRot,
});

/** Shapes and the rotation that makes them look the same again. */
const SYMMETRY: Record<Shape, number> = {
  heart: 360, star: 360, moon: 360, circle: 90, square: 90, triangle: 360, drop: 360, leaf: 180, diamond: 90, plus: 90,
};
export const cutterI = (shape: Shape, colour: string, solvedRot = 0, size = 46): Item => ({
  svg: cutter(shape, colour, size), props: { shape }, w: size, h: size, rotatable: true, solvedRot, rotMod: SYMMETRY[shape],
});

/** A polyomino; rotMod is how much turning leaves it looking the same. */
export const polyI = (name: string, cells: [number, number][], colour: string, solvedRot = 0, rotMod = 360): Item => ({
  svg: poly(cells, colour), props: { shape: name }, ...polySize(cells), rotatable: true, solvedRot, rotMod,
});

export const photoI = (r: number, c: number, n: number, size: number, scene: Scene = 'house'): Item => ({
  svg: photoTile(r, c, n, size, scene), props: { cell: `${r},${c}` }, w: size, h: size, rotatable: true,
});
