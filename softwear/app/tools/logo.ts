// The logo: a soft teddy bear with the S on its chest, drawn here and written to `assets/brand/`.
//
//   bun tools/logo.ts            writes mark.svg, mark-ink.png, mark-paper.png and icon-1024.png
//   bun tools/logo.ts --out dir  writes them to dir instead
//   COAT=honey bun tools/logo.ts draws the icon's brown bear on cream, in place of the oat bear on clay
//
// Two drawings of one bear. `icon-1024.png` is the plush one, shaded by SVG filters that only a browser
// draws, so it is rendered through Chrome. `mark.svg` is the design's `icon.mark`, which every host draws
// and which may hold only filled paths in one colour, so it is a silhouette: its holes wind against its
// solids, so the header's background shows through the S, the eyes and the muzzle.
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { tmpdir } from "node:os";

type Point = [number, number];

const argAt = process.argv.indexOf("--out");
const out = resolve(argAt > 0 ? process.argv[argAt + 1] : resolve(import.meta.dir, "../assets/brand"));
const chrome = process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

// The colours are the design's, in app.tamber.
const clay = "#a8492a";
const ink = "#1a1917";
const paper = "#f7f4ee";

// The S's spine, the brand's one soft stroke, in a 100-unit box.
const spine: [Point, Point, Point, Point][] = [
  [[71.6, 26.7], [69, 16], [60, 11], [49, 11]],
  [[49, 11], [36, 11], [26, 19], [26, 30]],
  [[26, 30], [26, 40], [35, 45], [50, 50]],
  [[50, 50], [65, 55], [74, 60], [74, 70]],
  [[74, 70], [74, 81], [64, 89], [51, 89]],
  [[51, 89], [40, 89], [31, 84], [28.5, 73]],
];

function along(): Point[] {
  const points: Point[] = [];
  for (const [a, b, c, d] of spine) {
    for (let i = 0; i < 24; i++) {
      const t = i / 24, u = 1 - t;
      const at = (k: 0 | 1) => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k];
      points.push([at(0), at(1)]);
    }
  }
  points.push(spine[spine.length - 1][3]);
  return points;
}

/** The S as an outline, `height` tall about (cx, cy), its stroke `weight` wide, round at each end. */
function outlineS(cx: number, cy: number, height: number, weight: number): Point[] {
  const scale = height / (78 + weight * (100 / height));
  const line = along().map(([x, y]): Point => [cx + (x - 50) * scale, cy + (y - 50) * scale]);
  const half = weight / 2;
  const normal = (i: number): Point => {
    const [ax, ay] = line[Math.max(i - 1, 0)], [bx, by] = line[Math.min(i + 1, line.length - 1)];
    const length = Math.hypot(bx - ax, by - ay);
    return [-(by - ay) / length, (bx - ax) / length];
  };
  const cap = ([x, y]: Point, [nx, ny]: Point): Point[] => {
    const from = Math.atan2(ny, nx);
    return Array.from({ length: 11 }, (_, i): Point => {
      const angle = from - (Math.PI * (i + 1)) / 12;
      return [x + half * Math.cos(angle), y + half * Math.sin(angle)];
    });
  };
  const left = line.map(([x, y], i): Point => { const [nx, ny] = normal(i); return [x + nx * half, y + ny * half]; });
  const right = line.map(([x, y], i): Point => { const [nx, ny] = normal(i); return [x - nx * half, y - ny * half]; });
  const last = line.length - 1;
  return [...left, ...cap(line[last], normal(last)), ...right.reverse(), ...cap(line[0], [-normal(0)[0], -normal(0)[1]])];
}

const ellipse = (cx: number, cy: number, rx: number, ry: number, turn = 0): Point[] => {
  const cos = Math.cos(turn), sin = Math.sin(turn);
  return Array.from({ length: 72 }, (_, i): Point => {
    const a = (i / 72) * 2 * Math.PI, x = rx * Math.cos(a), y = ry * Math.sin(a);
    return [cx + x * cos - y * sin, cy + x * sin + y * cos];
  });
};

/** A shape's signed area: its sign is its winding. */
const area = (p: Point[]) => p.reduce((sum, [x, y], i) => { const [nx, ny] = p[(i + 1) % p.length]; return sum + x * ny - nx * y; }, 0) / 2;
const wound = (p: Point[], solid: boolean) => (area(p) > 0) === solid ? p : [...p].reverse();
const d = (p: Point[]) => "M" + p.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L") + "Z";

/** The silhouette: the solids wind one way, the holes the other, and what sits in a hole winds as a solid. */
function markPath(): string {
  const solids = [
    ellipse(30, 15, 11.5, 11.5), ellipse(78, 15, 11.5, 11.5), // ears
    ellipse(54, 34, 29, 25), // head
    ellipse(54, 77, 33, 29), // body
    ellipse(20, 71, 9.5, 15, 0.42), ellipse(88, 71, 9.5, 15, -0.42), // arms
    ellipse(29, 97, 14, 10), ellipse(79, 97, 14, 10), // feet
    ellipse(54, 44, 5, 3.6), // nose, in the muzzle's hole
  ];
  const holes = [
    ellipse(43, 30, 3.6, 3.6), ellipse(65, 30, 3.6, 3.6), // eyes
    ellipse(54, 44, 12.5, 8.8), // muzzle
    outlineS(54, 78, 40, 8.6),
  ];
  return [...solids.map((p) => d(wound(p, true))), ...holes.map((p) => d(wound(p, false)))].join("");
}

const markSvg = (fill: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><path fill="${fill}" d="${markPath()}"/></svg>\n`;

/** A colourway of the plush bear. */
type Coat = {
  ground: [string, string]; pale: string; fur: string; deep: string; shade: string; cast: string;
  padLight: string; pad: string; padDark: string; s: string; dark: string;
};

const coats: Record<string, Coat> = {
  oat: {
    ground: ["#bb5531", clay], pale: "#fbf4e7", fur: "#eedfc6", deep: "#e2cfb0", shade: "#c7a67f", cast: "#5e3216",
    padLight: "#e9b797", pad: "#dc9f7b", padDark: "#c98660", s: clay, dark: "#33241c",
  },
  honey: {
    ground: [paper, "#efe7da"], pale: "#deab79", fur: "#c98f5c", deep: "#b67c4b", shade: "#8e5a30", cast: "#4a2c14",
    padLight: "#f2d9b8", pad: "#e8c499", padDark: "#d3a877", s: clay, dark: "#33241c",
  },
};

/** A part's stuffing: lit high on its left, falling away to the lower right. */
const dome = (id: string, light: string, mid: string, dark: string) =>
  `<radialGradient id="${id}" cx="0.44" cy="0.36" r="0.74"><stop offset="0" stop-color="${light}"/><stop offset="0.55" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/></radialGradient>`;

function iconSvg(coat: Coat): string {
  const c = coat;
  const part = (shape: string) => `<g filter="url(#plush)">${shape}</g>`;
  const mirrored = (draw: (side: number, x: (v: number) => number) => string) =>
    draw(-1, (v) => v) + draw(1, (v) => 1024 - v);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<defs>
  <radialGradient id="ground" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="${c.ground[0]}"/><stop offset="1" stop-color="${c.ground[1]}"/></radialGradient>
  ${dome("fur", c.pale, c.fur, c.shade)}
  ${dome("limb", c.fur, c.deep, c.shade)}
  ${dome("muzzle", "#ffffff", c.pale, c.fur)}
  ${dome("pad", c.padLight, c.pad, c.padDark)}
  <filter id="plush" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
    <!-- A soft, tufted edge. -->
    <feTurbulence type="fractalNoise" baseFrequency="0.13" numOctaves="3" seed="7" result="tuft"/>
    <feDisplacementMap in="SourceGraphic" in2="tuft" scale="13" xChannelSelector="R" yChannelSelector="G" result="ragged"/>
    <feGaussianBlur in="ragged" stdDeviation="1.6" result="fuzzy"/>
    <!-- The nap: a fine pile, barely there. -->
    <feTurbulence type="fractalNoise" baseFrequency="0.34" numOctaves="3" seed="3" result="pile"/>
    <feColorMatrix in="pile" type="matrix" values="0.34 0 0 0 0.83 0.34 0 0 0 0.83 0.34 0 0 0 0.83 0 0 0 0 1" result="nap"/>
    <feComposite in="fuzzy" in2="nap" operator="arithmetic" k1="1" k2="0" k3="0" k4="0" result="pelt"/>
    <!-- Each part rests on the one behind it. -->
    <feDropShadow in="pelt" dx="0" dy="9" stdDeviation="13" flood-color="${c.cast}" flood-opacity="0.34"/>
  </filter>
  <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter>
  <filter id="thread" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.16" numOctaves="2" seed="11" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" result="s"/>
    <feGaussianBlur in="s" stdDeviation="0.7" result="edge"/>
    <feDropShadow in="edge" dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.22"/>
  </filter>
</defs>
<rect width="1024" height="1024" fill="url(#ground)"/>
<ellipse cx="512" cy="905" rx="340" ry="44" fill="#000000" opacity="0.2" filter="url(#soft)"/>
${mirrored((_, x) => part(`<circle cx="${x(296)}" cy="205" r="98" fill="url(#fur)"/>`))}
${mirrored((_, x) => `<circle cx="${x(298)}" cy="214" r="52" fill="url(#pad)" filter="url(#plush)"/>`)}
${part(`<ellipse cx="512" cy="680" rx="250" ry="232" fill="url(#fur)"/>`)}
${mirrored((side, x) => part(`<ellipse cx="${x(262)}" cy="640" rx="78" ry="136" fill="url(#limb)" transform="rotate(${side * -17} ${x(262)} 640)"/>`))}
${mirrored((_, x) => part(`<ellipse cx="${x(300)}" cy="838" rx="108" ry="92" fill="url(#limb)"/>`))}
${mirrored((_, x) => `<ellipse cx="${x(298)}" cy="846" rx="58" ry="48" fill="url(#pad)" filter="url(#plush)"/>`)}
${part(`<ellipse cx="512" cy="338" rx="262" ry="222" fill="url(#fur)"/>`)}
${part(`<ellipse cx="512" cy="424" rx="112" ry="86" fill="url(#muzzle)"/>`)}
<path d="${d(outlineS(512, 702, 236, 46))}" fill="${c.s}" filter="url(#thread)"/>
<g fill="${c.dark}">
  <circle cx="404" cy="318" r="27"/><circle cx="620" cy="318" r="27"/>
  <path d="M470 372 Q512 358 554 372 Q566 378 556 392 Q534 420 512 420 Q490 420 468 392 Q458 378 470 372Z"/>
</g>
<circle cx="395" cy="308" r="8" fill="#ffffff" opacity="0.9"/><circle cx="611" cy="308" r="8" fill="#ffffff" opacity="0.9"/>
<ellipse cx="500" cy="381" rx="16" ry="7" fill="#ffffff" opacity="0.28"/>
<path d="M512 420 V448 M512 448 Q486 472 460 452 M512 448 Q538 472 564 452" fill="none" stroke="${c.dark}" stroke-width="11" stroke-linecap="round"/>
</svg>
`;
}

/** Draws an SVG to a PNG through Chrome. */
function render(svg: string, png: string, size: number, background = "transparent") {
  const page = resolve(tmpdir(), `softwear-logo-${process.pid}.html`);
  writeFileSync(page, `<!doctype html><style>html,body{margin:0;background:${background}}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`);
  const made = Bun.spawnSync([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    `--window-size=${size},${size}`, "--default-background-color=00000000", `--screenshot=${png}`, `file://${page}`]);
  rmSync(page, { force: true });
  if (made.exitCode !== 0) throw new Error(`Chrome could not draw ${png}: ${made.stderr}`);
}

mkdirSync(out, { recursive: true });
const coat = process.env.COAT ?? "oat";
writeFileSync(resolve(out, "mark.svg"), markSvg("currentColor"));
render(markSvg(ink), resolve(out, "mark-ink.png"), 256);
render(markSvg(paper), resolve(out, "mark-paper.png"), 256);
render(iconSvg(coats[coat]), resolve(out, "icon-1024.png"), 1024);
console.log(`wrote the logo to ${dirname(resolve(out, "mark.svg"))} (${coat})`);
