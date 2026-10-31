// More objects drawn in code. Each function returns inline SVG; sizes are
// in px and exported so layouts can leave room for them.

const FONT = `font-family="ui-rounded, 'SF Pro Rounded', Nunito, system-ui, sans-serif" font-weight="800"`;
const INK = '#5b5149';

/** Simple shapes on a 24x24 grid: cookie cutters, tile symbols. */
export const SHAPES = {
  heart: 'M12 21C5 15 2 11 2 7.5A4.5 4.5 0 0 1 12 5A4.5 4.5 0 0 1 22 7.5C22 11 19 15 12 21Z',
  star: 'M12 2L14.9 8.6L22 9.3L16.6 14L18.2 21L12 17.3L5.8 21L7.4 14L2 9.3L9.1 8.6Z',
  moon: 'M15 2A10 10 0 1 0 22 16A8 8 0 1 1 15 2Z',
  circle: 'M12 2A10 10 0 1 1 11.99 2Z',
  square: 'M4 4H20V20H4Z',
  triangle: 'M12 3L22 21H2Z',
  drop: 'M12 2C12 2 4 11 4 15A8 8 0 0 0 20 15C20 11 12 2 12 2Z',
  leaf: 'M4 20C4 9 10 3 21 3C21 14 15 20 4 20Z',
  diamond: 'M12 2L21 12L12 22L3 12Z',
  plus: 'M9 3H15V9H21V15H15V21H9V15H3V9H9Z',
} as const;
export type Shape = keyof typeof SHAPES;

/** A cookie cutter: thick outline with a pale fill. */
export function cutter(shape: Shape, colour: string, size = 46): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
  <path d="${SHAPES[shape]}" fill="${colour}" fill-opacity="0.35" stroke="${colour}" stroke-width="2.2" stroke-linejoin="round"/></svg>`;
}

/** A square tile/coaster, optionally with a symbol on it. */
export function tile(colour: string, symbol?: Shape, symColour = '#ffffff', size = 42): string {
  const sym = symbol
    ? `<path d="${SHAPES[symbol]}" transform="translate(5 5) scale(0.58)" fill="${symColour}" fill-opacity="0.9"/>`
    : '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
  <rect x="0.5" y="0.5" width="23" height="23" rx="5" fill="${colour}"/>${sym}</svg>`;
}

/** A mug, bottom-aligned on a 60px-tall canvas so a row of mugs lines up. */
export const MUG_CANVAS = 60;
export function mug(colour: string, h: number): string {
  const top = MUG_CANVAS - h;
  return `<svg width="44" height="${MUG_CANVAS}" viewBox="0 0 44 ${MUG_CANVAS}" aria-hidden="true">
  <path d="M30 ${top + h * 0.25} h4 a7 7 0 0 1 0 ${h * 0.45} h-4" fill="none" stroke="${colour}" stroke-width="4"/>
  <rect x="3" y="${top}" width="29" height="${h}" rx="6" fill="${colour}"/>
  <rect x="3" y="${top}" width="29" height="5" rx="2.5" fill="#fff" opacity="0.35"/></svg>`;
}

/** A sock with an optional stripe colour. */
export function sock(colour: string, stripe?: string): string {
  const band = stripe ? `<rect x="9" y="14" width="14" height="5" fill="${stripe}"/><rect x="9" y="24" width="14" height="5" fill="${stripe}"/>` : '';
  return `<svg width="34" height="56" viewBox="0 0 34 56" aria-hidden="true">
  <path d="M9 2H23V34L30 42A7 7 0 0 1 22 53L6 41A6 6 0 0 1 9 34Z" fill="${colour}"/>
  <rect x="9" y="2" width="14" height="6" fill="#fff" opacity="0.5"/>${band}</svg>`;
}

/** A spice jar: coloured lid, glass body, little label. Bottom-aligned on 64px. */
export const JAR_CANVAS = 64;
export function jar(lid: string, h: number, label = '#f3e3cf'): string {
  const top = JAR_CANVAS - h;
  return `<svg width="32" height="${JAR_CANVAS}" viewBox="0 0 32 ${JAR_CANVAS}" aria-hidden="true">
  <rect x="3" y="${top + 6}" width="26" height="${h - 6}" rx="5" fill="#eef1ee" stroke="#d6dcd6"/>
  <rect x="2" y="${top}" width="28" height="9" rx="3" fill="${lid}"/>
  <rect x="7" y="${top + 6 + (h - 6) * 0.35}" width="18" height="${Math.max(8, (h - 6) * 0.35)}" rx="2" fill="${label}"/></svg>`;
}

/** A candle with a flame; height in px, bottom-aligned on a 96px canvas. */
export const CANDLE_CANVAS = 96;
export function candle(h: number, colour: string): string {
  const top = CANDLE_CANVAS - h;
  return `<svg width="24" height="${CANDLE_CANVAS}" viewBox="0 0 24 ${CANDLE_CANVAS}" aria-hidden="true">
  <path d="M12 ${top - 16}C16 ${top - 9} 15 ${top - 3} 12 ${top - 2}C9 ${top - 3} 8 ${top - 9} 12 ${top - 16}Z" fill="#f6c76b"/>
  <rect x="11.2" y="${top - 3}" width="1.6" height="4" fill="${INK}"/>
  <rect x="4" y="${top}" width="16" height="${h}" rx="3" fill="${colour}"/></svg>`;
}

const COIN = { 1: [26, '#e2b48c'], 2: [30, '#e2b48c'], 5: [32, '#d5dbe1'], 10: [36, '#d5dbe1'], 20: [38, '#d5dbe1'], 50: [42, '#e9d79a'] } as const;
export type CoinValue = keyof typeof COIN;
/** A coin; bigger value, bigger coin. */
export function coin(v: CoinValue): string {
  const [d, c] = COIN[v];
  return `<svg width="${d}" height="${d}" viewBox="0 0 ${d} ${d}" aria-hidden="true">
  <circle cx="${d / 2}" cy="${d / 2}" r="${d / 2 - 1}" fill="${c}"/>
  <circle cx="${d / 2}" cy="${d / 2}" r="${d / 2 - 4}" fill="none" stroke="#000" stroke-opacity="0.1"/>
  <text x="${d / 2}" y="${d / 2 + 5}" text-anchor="middle" font-size="${d * 0.4}" ${FONT} fill="${INK}" opacity="0.7">${v}</text></svg>`;
}
export const coinSize = (v: CoinValue) => COIN[v][0];

/** A wooden number block. */
export function block(n: number | string, colour = '#f1dcb8', size = 42): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 42 42" aria-hidden="true">
  <rect x="1" y="1" width="40" height="40" rx="8" fill="${colour}"/>
  <rect x="1" y="1" width="40" height="40" rx="8" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="2"/>
  <text x="21" y="29" text-anchor="middle" font-size="22" ${FONT} fill="${INK}">${n}</text></svg>`;
}

/** An egg. */
export function egg(colour: string): string {
  return `<svg width="34" height="42" viewBox="0 0 34 42" aria-hidden="true">
  <path d="M17 2C26 2 32 16 32 26A15 15 0 0 1 2 26C2 16 8 2 17 2Z" fill="${colour}"/>
  <ellipse cx="12" cy="14" rx="3" ry="5" fill="#fff" opacity="0.35"/></svg>`;
}

/** A polyomino block made of unit cells ([col, row] pairs). */
export function poly(cells: [number, number][], colour: string, unit = 15): string {
  const w = (Math.max(...cells.map(([c]) => c)) + 1) * unit;
  const h = (Math.max(...cells.map(([, r]) => r)) + 1) * unit;
  const rects = cells.map(([c, r]) => `<rect x="${c * unit + 0.5}" y="${r * unit + 0.5}" width="${unit - 1}" height="${unit - 1}" rx="3" fill="${colour}"/>`).join('');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${rects}</svg>`;
}
export const polySize = (cells: [number, number][], unit = 15) => ({
  w: (Math.max(...cells.map(([c]) => c)) + 1) * unit,
  h: (Math.max(...cells.map(([, r]) => r)) + 1) * unit,
});

const SUITS = { S: ['♠', INK], C: ['♣', INK], H: ['♥', '#d9776f'], D: ['♦', '#d9776f'] } as const;
export type Suit = keyof typeof SUITS;
/** A small playing card. */
export function card(rank: number | string, suit: Suit, w = 40): string {
  const [sym, col] = SUITS[suit];
  return `<svg width="${w}" height="${Math.round((w * 54) / 40)}" viewBox="0 0 40 54" aria-hidden="true">
  <rect x="0.5" y="0.5" width="39" height="53" rx="5" fill="#fffdf8" stroke="#e0d5c5"/>
  <text x="7" y="16" font-size="13" ${FONT} fill="${col}">${rank}</text>
  <text x="20" y="40" text-anchor="middle" font-size="22" fill="${col}">${sym}</text></svg>`;
}
export const isRed = (s: Suit) => s === 'H' || s === 'D';

const PIP: Record<number, [number, number][]> = {
  1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};
/** A die showing n. */
export function die(n: number, colour = '#fffdf8'): string {
  const pips = PIP[n].map(([x, y]) => `<circle cx="${10 + x * 10}" cy="${10 + y * 10}" r="3" fill="${INK}"/>`).join('');
  return `<svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
  <rect x="1" y="1" width="38" height="38" rx="8" fill="${colour}" stroke="#e0d5c5"/>${pips}</svg>`;
}

/** A pot of paint. */
export function paintPot(colour: string): string {
  return `<svg width="36" height="40" viewBox="0 0 36 40" aria-hidden="true">
  <path d="M4 10H32L30 36A3 3 0 0 1 27 39H9A3 3 0 0 1 6 36Z" fill="#e9e4dc"/>
  <ellipse cx="18" cy="10" rx="14" ry="4" fill="${colour}"/>
  <rect x="9" y="18" width="18" height="10" rx="2" fill="${colour}" opacity="0.8"/></svg>`;
}

/** A flat stepping stone with a number. */
export function stone(n: number): string {
  return `<svg width="46" height="38" viewBox="0 0 46 38" aria-hidden="true">
  <ellipse cx="23" cy="19" rx="22" ry="17" fill="#d9d4cc"/>
  <ellipse cx="20" cy="15" rx="12" ry="6" fill="#fff" opacity="0.25"/>
  <text x="23" y="26" text-anchor="middle" font-size="18" ${FONT} fill="${INK}">${n}</text></svg>`;
}

/** A teacup, seen from the side. `big` cups are a bit larger. */
export function teacup(colour: string, big = false): string {
  const s = big ? 1 : 0.8;
  return `<svg width="${Math.round(44 * s)}" height="${Math.round(34 * s)}" viewBox="0 0 44 34" aria-hidden="true">
  <path d="M33 10h3a6 6 0 0 1 0 12h-3" fill="none" stroke="${colour}" stroke-width="3.5"/>
  <path d="M4 6H34L31 26A6 6 0 0 1 25 31H13A6 6 0 0 1 7 26Z" fill="${colour}"/>
  <rect x="2" y="30" width="34" height="3" rx="1.5" fill="#e0d5c5"/></svg>`;
}

/** A postage stamp with a value. */
export function stamp(v: number, colour: string): string {
  const holes = Array.from({ length: 5 }, (_, i) => 6 + i * 7);
  const edge = holes.map((x) => `<circle cx="${x}" cy="1" r="1.6" fill="#fff"/><circle cx="${x}" cy="45" r="1.6" fill="#fff"/>`).join('');
  return `<svg width="40" height="46" viewBox="0 0 40 46" aria-hidden="true">
  <rect x="0" y="0" width="40" height="46" rx="2" fill="#fffdf8"/>
  <rect x="4" y="4" width="32" height="38" rx="2" fill="${colour}"/>${edge}
  <text x="20" y="30" text-anchor="middle" font-size="16" ${FONT} fill="${INK}">${v}</text></svg>`;
}

/** Three little pictures to cut into jigsaw tiles, each on a 120x120 canvas. */
const SCENES = {
  house: `<rect width="120" height="120" fill="#cfe5f0"/><circle cx="92" cy="26" r="13" fill="#f6d38b"/>
  <path d="M0 84Q30 60 60 80T120 74V120H0Z" fill="#a8d5c2"/><path d="M0 100Q40 86 80 98T120 96V120H0Z" fill="#8cc0a8"/>
  <rect x="26" y="58" width="34" height="30" fill="#f4b6a6"/><path d="M22 60L43 40L64 60Z" fill="#c98b7a"/>
  <rect x="38" y="70" width="10" height="18" fill="#8a6d3b"/>`,
  boat: `<rect width="120" height="120" fill="#f8e3cf"/><circle cx="30" cy="30" r="14" fill="#f4b6a6"/>
  <rect y="74" width="120" height="46" fill="#9cc7e0"/><path d="M0 84Q20 78 40 84T80 84T120 84V90H0Z" fill="#b9d8ea"/>
  <path d="M36 74H88L80 88H44Z" fill="#c98b7a"/><path d="M60 20V72H34Z" fill="#fffaf3"/><path d="M64 30V72H86Z" fill="#f6d38b"/>
  <rect x="59" y="18" width="3" height="56" fill="#8a6d3b"/>`,
  garden: `<rect width="120" height="120" fill="#e6f2ea"/><rect y="70" width="120" height="50" fill="#bcd3a1"/>
  <circle cx="22" cy="58" r="10" fill="#e9a3b8"/><rect x="21" y="66" width="2" height="18" fill="#6fae8f"/>
  <circle cx="60" cy="44" r="13" fill="#f6d38b"/><rect x="59" y="56" width="2" height="28" fill="#6fae8f"/>
  <circle cx="98" cy="62" r="9" fill="#b9c6ef"/><rect x="97" y="70" width="2" height="16" fill="#6fae8f"/>
  <path d="M0 96Q60 84 120 98V120H0Z" fill="#a8c98e"/><circle cx="90" cy="20" r="8" fill="#fff"/><circle cx="100" cy="22" r="7" fill="#fff"/>`,
} as const;
export type Scene = keyof typeof SCENES;

/** One tile of a picture cut into n x n pieces. */
export function photoTile(row: number, col: number, n: number, size: number, scene: Scene = 'house'): string {
  const c = 120 / n;
  return `<svg width="${size}" height="${size}" viewBox="${col * c} ${row * c} ${c} ${c}" aria-hidden="true">${SCENES[scene]}
  <rect x="${col * c}" y="${row * c}" width="${c}" height="${c}" fill="none" stroke="#fff" stroke-width="1.2"/></svg>`;
}
