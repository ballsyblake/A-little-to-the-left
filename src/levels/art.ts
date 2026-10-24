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
