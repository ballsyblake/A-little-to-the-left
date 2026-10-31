// Tiny SVG "art" generators. Everything is drawn in code: no image files.

/** A horizontal pencil `length` px long. */
export function pencil(length: number, body = '#f6d38b'): string {
  const h = 18;
  const tip = 16;
  const eraser = 12;
  const shaft = length - tip - eraser;
  return `
<svg width="${length}" height="${h}" viewBox="0 0 ${length} ${h}" aria-hidden="true">
  <rect x="0" y="1" width="${eraser + 4}" height="${h - 2}" rx="5" fill="#f2b8c0"/>
  <rect x="${eraser}" y="1" width="5" height="${h - 2}" fill="#c9c4bc"/>
  <rect x="${eraser + 4}" y="1" width="${shaft}" height="${h - 2}" fill="${body}"/>
  <rect x="${eraser + 4}" y="${h / 2 - 1}" width="${shaft}" height="2" fill="#000" opacity="0.06"/>
  <path d="M${length - tip} 1 L${length} ${h / 2} L${length - tip} ${h - 1} Z" fill="#f3e2c7"/>
  <path d="M${length - 5} ${h / 2 - 3} L${length} ${h / 2} L${length - 5} ${h / 2 + 3} Z" fill="#6b6058"/>
</svg>`;
}

/** Height of every book's canvas; the book itself is bottom-aligned in it. */
export const BOOK_CANVAS = 130;

/** An upright book spine of the given hue (0..360) and height. */
export function book(hue: number, height: number, width = 32): string {
  const top = BOOK_CANVAS - height;
  const fill = `hsl(${hue} 60% 78%)`;
  const band = `hsl(${hue} 45% 64%)`;
  return `
<svg width="${width}" height="${BOOK_CANVAS}" viewBox="0 0 ${width} ${BOOK_CANVAS}" aria-hidden="true">
  <rect x="1" y="${top}" width="${width - 2}" height="${height}" rx="5" fill="${fill}"/>
  <rect x="1" y="${top + 12}" width="${width - 2}" height="5" fill="${band}"/>
  <rect x="1" y="${BOOK_CANVAS - 20}" width="${width - 2}" height="5" fill="${band}"/>
  <rect x="${width / 2 - 5}" y="${top + 26}" width="10" height="${Math.max(10, height - 60)}" rx="3" fill="#fff" opacity="0.45"/>
</svg>`;
}

// Cutlery: drawn upright, handle at the bottom, 22x120.
const CUT_W = 22;
const CUT_H = 120;
const METAL = '#aeb7c2';
const HANDLE = '#b7d3e6';

const svgWrap = (inner: string) =>
  `<svg width="${CUT_W}" height="${CUT_H}" viewBox="0 0 ${CUT_W} ${CUT_H}" aria-hidden="true">${inner}</svg>`;
const handle = `<rect x="6" y="64" width="10" height="54" rx="5" fill="${HANDLE}"/>`;

export function knife(): string {
  return svgWrap(`
  <path d="M8 4 Q16 6 15 40 L15 66 L8 66 Z" fill="${METAL}"/>
  ${handle}`);
}

export function fork(): string {
  return svgWrap(`
  <rect x="4" y="4" width="2.5" height="22" rx="1.2" fill="${METAL}"/>
  <rect x="8.5" y="4" width="2.5" height="22" rx="1.2" fill="${METAL}"/>
  <rect x="13" y="4" width="2.5" height="22" rx="1.2" fill="${METAL}"/>
  <path d="M4 24 L15.5 24 Q15.5 34 12.5 38 L12.5 66 L9 66 L9 38 Q4 34 4 24 Z" fill="${METAL}"/>
  ${handle}`);
}

export function spoon(): string {
  return svgWrap(`
  <ellipse cx="11" cy="20" rx="9" ry="16" fill="${METAL}"/>
  <ellipse cx="11" cy="18" rx="5" ry="10" fill="#fff" opacity="0.35"/>
  <rect x="9" y="34" width="4" height="32" fill="${METAL}"/>
  ${handle}`);
}

/** A chunky fridge-magnet letter on a soft rounded tile. */
export function magnet(letter: string, colour: string, size = 50): string {
  return `
<svg width="${size}" height="${size + 6}" viewBox="0 0 50 56" aria-hidden="true">
  <rect x="2" y="2" width="46" height="52" rx="12" fill="${colour}"/>
  <text x="25" y="40" text-anchor="middle" font-size="32" font-weight="800"
    font-family="ui-rounded, 'SF Pro Rounded', Nunito, system-ui, sans-serif" fill="#5b5149">${letter}</text>
</svg>`;
}

// Standard pip positions on a 3x3 grid (0..2 in each axis) for 0-6.
const PIPS: Record<number, [number, number][]> = {
  0: [],
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};

/** A horizontal domino showing `a` on the left half and `b` on the right. */
export function domino(a: number, b: number): string {
  const half = 28;
  const pips = (n: number, ox: number) =>
    PIPS[n].map(([cx, cy]) => `<circle cx="${ox + 7 + cx * 7}" cy="${7 + cy * 7}" r="2.6" fill="#6b6058"/>`).join('');
  return `
<svg width="${half * 2}" height="${half}" viewBox="0 0 ${half * 2} ${half}" aria-hidden="true">
  <rect x="0.5" y="0.5" width="${half * 2 - 1}" height="${half - 1}" rx="6" fill="#fffdf8" stroke="#d9cdbd"/>
  <line x1="${half}" y1="4" x2="${half}" y2="${half - 4}" stroke="#d9cdbd" stroke-width="1.5"/>
  ${pips(a, 0)}${pips(b, half)}
</svg>`;
}

/** Height of every weight's canvas; weights are bottom-aligned so they sit on the pan. */
export const WEIGHT_CANVAS = 52;

/** A little brass kitchen weight; bigger value = bigger weight. */
export function weight(kg: number): string {
  const w = 24 + kg * 2;            // 26..42 px wide
  const h = 22 + kg * 2;            // body height
  const top = WEIGHT_CANVAS - h;
  return `
<svg width="${w}" height="${WEIGHT_CANVAS}" viewBox="0 0 ${w} ${WEIGHT_CANVAS}" aria-hidden="true">
  <rect x="${w / 2 - 5}" y="${top - 6}" width="10" height="9" rx="4" fill="#d8b97f"/>
  <path d="M4 ${top + 2} Q4 ${top} 6 ${top} L${w - 6} ${top} Q${w - 4} ${top} ${w - 4} ${top + 2}
    L${w - 1} ${WEIGHT_CANVAS - 3} Q${w - 1} ${WEIGHT_CANVAS} ${w - 4} ${WEIGHT_CANVAS}
    L4 ${WEIGHT_CANVAS} Q1 ${WEIGHT_CANVAS} 1 ${WEIGHT_CANVAS - 3} Z" fill="#ecd3a0"/>
  <text x="${w / 2}" y="${WEIGHT_CANVAS - h / 2 + 5}" text-anchor="middle" font-size="14" font-weight="800"
    font-family="ui-rounded, 'SF Pro Rounded', Nunito, system-ui, sans-serif" fill="#8a6d3b">${kg}</text>
</svg>`;
}

/** A paint chip: a strip of one colour with a little white label band. */
export function swatch(colour: string, w: number, h = 64): string {
  return `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="6" fill="#fffdf8" stroke="#e3d8c8"/>
  <rect x="4" y="4" width="${w - 8}" height="${h - 20}" rx="4" fill="${colour}"/>
  <rect x="${w / 2 - 7}" y="${h - 12}" width="14" height="3" rx="1.5" fill="#d9cdbd"/>
</svg>`;
}

/** A sewing button: a disc with a rim and 2 or 4 holes. */
export function button(colour: string, d: number, holes: 2 | 4): string {
  const c = d / 2;
  const o = d * 0.13; // hole offset from centre
  const pts: [number, number][] = holes === 2 ? [[-o, 0], [o, 0]] : [[-o, -o], [o, -o], [-o, o], [o, o]];
  return `
<svg width="${d}" height="${d}" viewBox="0 0 ${d} ${d}" aria-hidden="true">
  <circle cx="${c}" cy="${c}" r="${c - 1}" fill="${colour}"/>
  <circle cx="${c}" cy="${c}" r="${c - 5}" fill="none" stroke="#000" stroke-opacity="0.08" stroke-width="2"/>
  ${pts.map(([x, y]) => `<circle cx="${c + x}" cy="${c + y}" r="${d * 0.06}" fill="#5b5149" opacity="0.55"/>`).join('')}
</svg>`;
}
