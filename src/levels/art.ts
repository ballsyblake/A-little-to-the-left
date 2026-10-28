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
