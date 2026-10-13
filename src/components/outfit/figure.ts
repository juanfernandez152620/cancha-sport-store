// Geometry for the outfit mannequin. Pure functions, no React, so the same code renders in the
// browser and in scripts/preview-figure.mjs. Everything is derived from one skeleton per body
// (torso rows + limb centrelines), which is what keeps every garment aligned with the body.
//
// viewBox: 0 0 400 1000, figure centred on x = 200.
import type { Gender, Shape, Slot } from "@/lib/types";

export const VIEW = { w: 400, h: 1000 } as const;
const CX = 200;

type Pt = { x: number; y: number };
/** x, y, half-width */
type LP = [number, number, number];
/** y, half-width */
type Row = [number, number];

export type Paint = {
  d: string;
  fill?: string;
  stroke?: string;
  sw?: number;
  op?: number;
  dash?: string;
  cap?: "round" | "butt";
  /** stroke painted under the fill: outlines the union of all subpaths without internal seams */
  under?: boolean;
};
export type Art = { back: Paint[]; front: Paint[] };

type Rig = {
  head: { cy: number; rx: number; ry: number };
  neck: Row[];
  torso: Row[];
  crotchY: number;
  waistY: number;
  hipY: number;
  arm: LP[];
  hand: LP[];
  thumb: LP[];
  leg: LP[];
  foot: LP[];
};

// ------------------------------------------------------------------ skeletons

const RIGS: Record<Gender, Rig> = {
  hombre: {
    head: { cy: 100, rx: 38, ry: 47 },
    neck: [[136, 16.5], [160, 17.5], [182, 21]],
    torso: [
      [176, 22], [187, 54], [199, 80], [214, 85], [250, 81], [290, 76], [335, 68], [395, 62],
      [440, 66], [475, 72], [505, 70],
    ],
    crotchY: 532,
    waistY: 395,
    hipY: 475,
    arm: [[121, 214, 24], [109, 282, 20.5], [99, 362, 17], [91, 440, 15.5], [83, 512, 11]],
    hand: [[83, 506, 11], [80, 540, 14], [78, 570, 12.5], [77, 590, 8.5]],
    thumb: [[89, 526, 5.5], [95, 548, 5], [97, 562, 3.5]],
    leg: [[163, 470, 40], [160, 560, 36.5], [158, 640, 29], [157, 705, 22], [156, 772, 25.5], [157, 842, 17.5], [158, 902, 12]],
    foot: [[158, 896, 12.5], [155, 924, 17], [151, 950, 20]],
  },
  mujer: {
    head: { cy: 104, rx: 35, ry: 44.5 },
    neck: [[140, 13.5], [162, 14.5], [182, 17.5]],
    torso: [
      [176, 18], [187, 46], [199, 68], [214, 72], [262, 72], [300, 62], [345, 54], [382, 52],
      [425, 62], [466, 78], [502, 76],
    ],
    crotchY: 530,
    waistY: 382,
    hipY: 466,
    arm: [[133, 214, 19], [122, 282, 16.5], [112, 362, 13.5], [105, 440, 12.5], [98, 510, 9]],
    hand: [[98, 505, 9], [95, 536, 11.5], [93, 563, 10.5], [92, 581, 7]],
    thumb: [[103, 522, 4.5], [108, 543, 4], [110, 555, 3]],
    leg: [[162, 466, 42], [161, 556, 38], [161, 640, 28.5], [162, 708, 19.5], [161, 775, 22.5], [162, 845, 14.5], [164, 903, 10.5]],
    foot: [[164, 897, 10.5], [161, 924, 14.5], [157, 948, 17.5]],
  },
};

// ------------------------------------------------------------------ path helpers

const f = (n: number) => (Math.round(n * 10) / 10).toString();
const P = (p: Pt) => `${f(p.x)} ${f(p.y)}`;

/** Catmull-Rom through pts as cubic Béziers, assuming the pen is already at pts[0]. */
function cr(pts: Pt[]) {
  let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d;
}

const mirrorX = (x: number) => 2 * CX - x;
const mirrorLP = (l: LP[]): LP[] => l.map(([x, y, w]) => [mirrorX(x), y, w]);

function tangents(l: LP[]) {
  return l.map((_, i) => {
    const a = l[Math.max(0, i - 1)];
    const b = l[Math.min(l.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return { x: dx / len, y: dy / len };
  });
}

/**
 * Outline of a limb that runs top to bottom. Always drawn counter-clockwise, so several limbs
 * combined in one path union cleanly under the nonzero fill rule.
 */
function limb(l: LP[], caps: { start?: "round" | "flat"; end?: "round" | "flat" } = {}) {
  const t = tangents(l);
  // normal = (-ty, tx): with a downward tangent (0,1) it points to screen-left
  const L = l.map(([x, y, w], i) => ({ x: x - t[i].y * w, y: y + t[i].x * w }));
  const R = l.map(([x, y, w], i) => ({ x: x + t[i].y * w, y: y - t[i].x * w }));
  const n = l.length - 1;
  const endT = t[n];
  const startT = t[0];
  let d = `M${P(L[0])}${cr(L)}`;
  if (caps.end === "flat") d += ` L${P(R[n])}`;
  else {
    const k = l[n][2] * 1.25;
    const c = { x: l[n][0] + endT.x * k, y: l[n][1] + endT.y * k };
    d += ` Q${P({ x: c.x + (L[n].x - l[n][0]) * 0.9, y: c.y + (L[n].y - l[n][1]) * 0.9 })} ${P(c)}`;
    d += ` Q${P({ x: c.x + (R[n].x - l[n][0]) * 0.9, y: c.y + (R[n].y - l[n][1]) * 0.9 })} ${P(R[n])}`;
  }
  d += cr([...R].reverse());
  if (caps.start === "flat") d += " Z";
  else {
    const k = l[0][2] * 1.1;
    const c = { x: l[0][0] - startT.x * k, y: l[0][1] - startT.y * k };
    d += ` Q${P({ x: c.x + (R[0].x - l[0][0]) * 0.9, y: c.y + (R[0].y - l[0][1]) * 0.9 })} ${P(c)}`;
    d += ` Q${P({ x: c.x + (L[0].x - l[0][0]) * 0.9, y: c.y + (L[0].y - l[0][1]) * 0.9 })} ${P(L[0])} Z`;
  }
  return d;
}

function lengths(l: LP[]) {
  const acc = [0];
  for (let i = 1; i < l.length; i++) acc.push(acc[i - 1] + Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]));
  return acc;
}

function pointAt(l: LP[], t: number): LP {
  const acc = lengths(l);
  const target = acc[acc.length - 1] * Math.min(1, Math.max(0, t));
  for (let i = 1; i < l.length; i++) {
    if (acc[i] >= target) {
      const k = (target - acc[i - 1]) / (acc[i] - acc[i - 1] || 1);
      const a = l[i - 1];
      const b = l[i];
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
    }
  }
  return l[l.length - 1];
}

/** Fraction along the limb where it reaches height y (limbs only ever go down). */
function tAtY(l: LP[], y: number) {
  const acc = lengths(l);
  const total = acc[acc.length - 1];
  if (y <= l[0][1]) return 0;
  for (let i = 1; i < l.length; i++) {
    if (l[i][1] >= y) {
      const k = (y - l[i - 1][1]) / (l[i][1] - l[i - 1][1] || 1);
      return (acc[i - 1] + (acc[i] - acc[i - 1]) * k) / total;
    }
  }
  return 1;
}

/** Part of a limb between t0 and t1, widened by `ease` (a number or a function of t). */
function slice(l: LP[], t0: number, t1: number, ease: number | ((t: number) => number) = 0): LP[] {
  const acc = lengths(l);
  const total = acc[acc.length - 1];
  const e = (t: number) => (typeof ease === "number" ? ease : ease(t));
  const out: LP[] = [];
  const first = pointAt(l, t0);
  out.push([first[0], first[1], first[2] + e(t0)]);
  for (let i = 0; i < l.length; i++) {
    const t = acc[i] / total;
    if (t > t0 + 0.01 && t < t1 - 0.01) out.push([l[i][0], l[i][1], l[i][2] + e(t)]);
  }
  const last = pointAt(l, t1);
  out.push([last[0], last[1], last[2] + e(t1)]);
  return out;
}

function hwAt(rows: Row[], y: number) {
  if (y <= rows[0][0]) return rows[0][1];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] >= y) {
      const k = (y - rows[i - 1][0]) / (rows[i][0] - rows[i - 1][0]);
      return rows[i - 1][1] + (rows[i][1] - rows[i - 1][1]) * k;
    }
  }
  return rows[rows.length - 1][1];
}

function rowsBetween(rows: Row[], y0: number, y1: number): Row[] {
  const inner = rows.filter(([y]) => y > y0 + 2 && y < y1 - 2);
  return [[y0, hwAt(rows, y0)], ...inner, [y1, hwAt(rows, y1)]];
}

type ColumnOpts = {
  ease: number | ((y: number) => number);
  /** neckline: half-width at the top edge and how far it dips */
  neck?: { hw: number; dip: number; v?: boolean };
  /** hem curve: positive bulges down */
  hem?: number;
  /** replaces the straight top edge with a crotch-less flat top (waistbands) */
};

/** A symmetric torso-shaped piece between y0 and y1, counter-clockwise. */
function column(rows: Row[], y0: number, y1: number, o: ColumnOpts) {
  const e = (y: number) => (typeof o.ease === "number" ? o.ease : o.ease(y));
  const rs = rowsBetween(rows, y0, y1).map(([y, hw]) => [y, hw + e(y)] as Row);
  const left = rs.map(([y, hw]) => ({ x: CX - hw, y }));
  const right = [...rs].reverse().map(([y, hw]) => ({ x: CX + hw, y }));
  let d = `M${P(left[0])}${cr(left)}`;
  d += o.hem ? ` Q${f(CX)} ${f(y1 + o.hem * 2)} ${P(right[0])}` : ` L${P(right[0])}`;
  d += cr(right);
  if (o.neck) {
    const { hw, dip, v } = o.neck;
    const top = rs[0][1];
    // shoulder line runs from the outer top corner in to the neck opening
    d += ` L${f(CX + Math.min(hw, top))} ${f(y0)}`;
    d += v
      ? ` L${f(CX)} ${f(y0 + dip)} L${f(CX - Math.min(hw, top))} ${f(y0)}`
      : ` Q${f(CX + hw * 0.55)} ${f(y0 + dip * 1.15)} ${f(CX)} ${f(y0 + dip)} Q${f(CX - hw * 0.55)} ${f(y0 + dip * 1.15)} ${f(CX - Math.min(hw, top))} ${f(y0)}`;
  }
  return d + " Z";
}

/** A shape with arbitrary left-side points, mirrored to the right. Points go top to bottom. */
function mirrored(leftPts: Pt[], opts: { closeTop?: "flat" | Pt[] } = {}) {
  const right = [...leftPts].reverse().map((p) => ({ x: mirrorX(p.x), y: p.y }));
  let d = `M${P(leftPts[0])}${cr(leftPts)} L${P(right[0])}${cr(right)}`;
  if (Array.isArray(opts.closeTop)) for (const p of opts.closeTop) d += ` L${P(p)}`;
  return d + " Z";
}

/** Highlight or shadow strip hugging one side of a limb, for a cylindrical feel. */
function edge(l: LP[], side: "in" | "out" | "left" | "right", frac: number) {
  const t = tangents(l);
  const sgn = (i: number) => {
    if (side === "left") return 1;
    if (side === "right") return -1;
    // "out" = away from the body's centre line
    const isLeftOfCentre = l[i][0] < CX;
    return (side === "out") === isLeftOfCentre ? 1 : -1;
  };
  const outer = l.map(([x, y, w], i) => ({ x: x - t[i].y * w * sgn(i), y: y + t[i].x * w * sgn(i) }));
  const inner = l.map(([x, y, w], i) => ({ x: x - t[i].y * w * (1 - frac) * sgn(i), y: y + t[i].x * w * (1 - frac) * sgn(i) }));
  return `M${P(outer[0])}${cr(outer)} L${P(inner[inner.length - 1])}${cr([...inner].reverse())} Z`;
}

/** Soft shading band along one side of a torso-shaped piece, tapered at both ends. side 1 = right. */
function sideBand(rows: Row[], y0: number, y1: number, ease: number, width: number, side: 1 | -1) {
  const rs = rowsBetween(rows, y0, y1);
  const n = rs.length - 1;
  const outerPts = rs.map(([y, hw]) => ({ x: CX + side * (hw + ease), y }));
  const innerPts = rs
    .map(([y, hw], i) => ({ x: CX + side * (hw + ease - width * (0.25 + 0.75 * Math.sin((Math.PI * i) / n))), y }))
    .reverse();
  return `M${P(outerPts[0])}${cr(outerPts)} L${P(innerPts[0])}${cr(innerPts)} Z`;
}

const join = (...ds: string[]) => ds.join(" ");

/** Closed ellipse as a path (two arcs), so it can live in the same lists as every other shape. */
const ellipse = (cx: number, cy: number, rx: number, ry = rx) =>
  `M${f(cx - rx)} ${f(cy)} a${f(rx)} ${f(ry)} 0 1 0 ${f(rx * 2)} 0 a${f(rx)} ${f(ry)} 0 1 0 ${f(-rx * 2)} 0 Z`;

// ------------------------------------------------------------------ colours

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function shade(hex: string, amt: number) {
  const [r, g, b] = hexToRgb(hex);
  const mix = (c: number) => Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

/** Accent that reads on top of the main colour. */
function contrastOn(main: string, accent: string) {
  const a = luminance(accent);
  const m = luminance(main);
  const ratio = (Math.max(a, m) + 0.05) / (Math.min(a, m) + 0.05);
  if (ratio >= 1.6) return accent;
  return m > 0.35 ? "#15161A" : "#F3F3F1";
}

type Colors = { main: string; accent: string };

/** The main fill plus a soft rim so dark garments still separate from the navy stage. */
function base(d: string, main: string): Paint[] {
  const dark = luminance(main) < 0.08;
  return [
    { d, fill: main, stroke: dark ? "rgba(190,210,255,.34)" : "rgba(4,10,28,.3)", sw: 2.6, under: true },
  ];
}

const shadow = (d: string, op = 0.2): Paint => ({ d, fill: "#000", op });
const light = (d: string, op = 0.14): Paint => ({ d, fill: "#fff", op });
const line = (d: string, stroke: string, sw = 2, op = 1, dash?: string): Paint => ({ d, fill: "none", stroke, sw, op, dash, cap: "round" });

// ------------------------------------------------------------------ body

export const SKIN = { base: "#9aa5bb", light: "#c3cbdb", dark: "#6f7a91", hair: "#5b6478" };

function headPath(r: Rig) {
  const { cy, rx, ry } = r.head;
  const top = cy - ry;
  const chin = cy + ry;
  return `M${f(CX)} ${f(top)} C${f(CX - rx * 0.72)} ${f(top)} ${f(CX - rx)} ${f(cy - ry * 0.55)} ${f(CX - rx)} ${f(cy)} C${f(CX - rx)} ${f(cy + ry * 0.5)} ${f(CX - rx * 0.62)} ${f(chin - ry * 0.12)} ${f(CX)} ${f(chin)} C${f(CX + rx * 0.62)} ${f(chin - ry * 0.12)} ${f(CX + rx)} ${f(cy + ry * 0.5)} ${f(CX + rx)} ${f(cy)} C${f(CX + rx)} ${f(cy - ry * 0.55)} ${f(CX + rx * 0.72)} ${f(top)} ${f(CX)} ${f(top)} Z`;
}

function neckPath(r: Rig) {
  const rows = r.neck;
  return mirrored(rows.map(([y, hw]) => ({ x: CX - hw, y })));
}

function torsoPath(r: Rig) {
  const rows = r.torso;
  const left = rows.map(([y, hw]) => ({ x: CX - hw, y }));
  const last = rows[rows.length - 1];
  const right = [...rows].reverse().map(([y, hw]) => ({ x: CX + hw, y }));
  return `M${P(left[0])}${cr(left)} Q${f(CX - last[1] * 0.5)} ${f(r.crotchY)} ${f(CX)} ${f(r.crotchY)} Q${f(CX + last[1] * 0.5)} ${f(r.crotchY)} ${P(right[0])}${cr(right)} Z`;
}

const sides = <T,>(fn: (s: "L" | "R") => T) => [fn("L"), fn("R")];
const pick = (l: LP[], s: "L" | "R") => (s === "L" ? l : mirrorLP(l));

export function body(g: Gender): Art {
  const r = RIGS[g];
  const arms = sides((s) => pick(r.arm, s));
  const hands = sides((s) => pick(r.hand, s));
  const thumbs = sides((s) => pick(r.thumb, s));
  const legs = sides((s) => pick(r.leg, s));
  const feet = sides((s) => pick(r.foot, s));
  const silhouette = join(
    neckPath(r),
    torsoPath(r),
    ...arms.map((a) => limb(a)),
    ...hands.map((h) => limb(h)),
    ...thumbs.map((t) => limb(t)),
    ...legs.map((l) => limb(l)),
    ...feet.map((l) => limb(l)),
  );
  const freeArms = arms.map((a) => slice(a, tAtY(a, 250), 1));
  const freeLegs = legs.map((l) => slice(l, tAtY(l, r.crotchY), 1));
  const { cy, rx, ry } = r.head;
  const front: Paint[] = [
    { d: silhouette, fill: "url(#skin)", stroke: "rgba(4,10,28,.4)", sw: 2.4, under: true },
    // sculpted shading: shadow on the outer side of every limb, light on the inner side
    ...freeArms.map((l) => shadow(edge(l, "out", 0.32), 0.16)),
    ...freeLegs.map((l) => shadow(edge(l, "out", 0.32), 0.16)),
    ...[...freeArms, ...freeLegs].map((l) => light(edge(l, "in", 0.22), 0.12)),
    shadow(sideBand(r.torso, 250, r.hipY + 20, 0, 15, 1), 0.13),
    light(sideBand(r.torso, 250, r.hipY + 10, 0, 12, -1), 0.1),
    // anatomy hints
    line(`M${f(CX - 46)} ${f(214)} Q${f(CX - 20)} ${f(222)} ${f(CX - 6)} ${f(210)}`, SKIN.dark, 1.6, 0.55),
    line(`M${f(CX + 46)} ${f(214)} Q${f(CX + 20)} ${f(222)} ${f(CX + 6)} ${f(210)}`, SKIN.dark, 1.6, 0.55),
    line(`M${f(CX)} ${f(g === "hombre" ? 300 : 320)} L${f(CX)} ${f(r.waistY + 30)}`, SKIN.dark, 1.4, 0.35),
    ...(g === "hombre"
      ? [
          line(`M${f(CX - 64)} ${f(282)} Q${f(CX - 30)} ${f(300)} ${f(CX - 4)} ${f(286)}`, SKIN.dark, 1.5, 0.45),
          line(`M${f(CX + 64)} ${f(282)} Q${f(CX + 30)} ${f(300)} ${f(CX + 4)} ${f(286)}`, SKIN.dark, 1.5, 0.45),
        ]
      : [
          line(`M${f(CX - 62)} ${f(270)} Q${f(CX - 34)} ${f(298)} ${f(CX - 8)} ${f(276)}`, SKIN.dark, 1.5, 0.45),
          line(`M${f(CX + 62)} ${f(270)} Q${f(CX + 34)} ${f(298)} ${f(CX + 8)} ${f(276)}`, SKIN.dark, 1.5, 0.45),
        ]),
    ...sides((s) => {
      const l = pick(r.leg, s);
      const k = pointAt(l, tAtY(l, l[3][1]));
      return line(`M${f(k[0] - 9)} ${f(k[1] - 2)} Q${f(k[0])} ${f(k[1] + 7)} ${f(k[0] + 9)} ${f(k[1] - 2)}`, SKIN.dark, 1.4, 0.5);
    }),
    // head on top of the neck
    { d: headPath(r), fill: "url(#skin)", stroke: "rgba(4,10,28,.35)", sw: 1.2 },
    { d: join(ellipse(CX - rx + 1, cy + 4, 5, 10), ellipse(CX + rx - 1, cy + 4, 5, 10)), fill: SKIN.base },
    light(`M${f(CX - rx * 0.55)} ${f(cy - ry * 0.75)} Q${f(CX - rx * 0.85)} ${f(cy - ry * 0.1)} ${f(CX - rx * 0.6)} ${f(cy + ry * 0.4)} Q${f(CX - rx * 0.4)} ${f(cy - ry * 0.2)} ${f(CX - rx * 0.55)} ${f(cy - ry * 0.75)} Z`, 0.22),
  ];
  // hair: short crop for him, high ponytail for her
  const back: Paint[] = [];
  if (g === "hombre") {
    front.push({
      d: `M${f(CX - rx - 1)} ${f(cy - 6)} C${f(CX - rx - 3)} ${f(cy - ry - 8)} ${f(CX + rx + 3)} ${f(cy - ry - 8)} ${f(CX + rx + 1)} ${f(cy - 6)} C${f(CX + rx - 6)} ${f(cy - 26)} ${f(CX + 12)} ${f(cy - 34)} ${f(CX - 4)} ${f(cy - 30)} C${f(CX - 18)} ${f(cy - 27)} ${f(CX - rx + 6)} ${f(cy - 22)} ${f(CX - rx - 1)} ${f(cy - 6)} Z`,
      fill: SKIN.hair,
    });
  } else {
    back.push({
      d: `M${f(CX + 10)} ${f(cy - ry + 6)} C${f(CX + 58)} ${f(cy - ry - 18)} ${f(CX + 62)} ${f(cy + 10)} ${f(CX + 52)} ${f(cy + 70)} C${f(CX + 46)} ${f(cy + 100)} ${f(CX + 58)} ${f(cy + 118)} ${f(CX + 50)} ${f(cy + 128)} C${f(CX + 36)} ${f(cy + 104)} ${f(CX + 30)} ${f(cy + 60)} ${f(CX + 28)} ${f(cy - 4)} Z`,
      fill: SKIN.hair,
    });
    front.push({
      d: `M${f(CX - rx - 1)} ${f(cy + 4)} C${f(CX - rx - 4)} ${f(cy - ry - 10)} ${f(CX + rx + 4)} ${f(cy - ry - 10)} ${f(CX + rx + 1)} ${f(cy + 4)} C${f(CX + rx - 4)} ${f(cy - 24)} ${f(CX + 10)} ${f(cy - 36)} ${f(CX - 8)} ${f(cy - 32)} C${f(CX - 24)} ${f(cy - 28)} ${f(CX - rx + 4)} ${f(cy - 16)} ${f(CX - rx - 1)} ${f(cy + 4)} Z`,
      fill: SKIN.hair,
    });
    front.push({ d: ellipse(CX + 20, cy - ry + 4, 8, 6), fill: shade(SKIN.hair, -0.25) });
  }
  return { back, front };
}

// ------------------------------------------------------------------ garments

type Ctx = { r: Rig; g: Gender; c: Colors; acc: string; dark: string; lite: string };

function sleeves(x: Ctx, toY: number | null, ease: number, cuff?: string): Paint[] {
  const out: Paint[] = [];
  for (const s of ["L", "R"] as const) {
    const arm = pick(x.r.arm, s);
    const t1 = toY === null ? 0.985 : tAtY(arm, toY);
    const sl = slice(arm, 0, t1, (t) => ease + (1 - t) * 2);
    out.push({ d: limb(sl, { end: "flat" }), fill: x.c.main });
    const free = slice(arm, Math.min(tAtY(arm, 236), t1 - 0.04), t1, (t) => ease + (1 - t) * 2);
    out.push(shadow(edge(free, "out", 0.3), 0.16));
    out.push(light(edge(free, "in", 0.2), 0.08));
    if (cuff) {
      const band = slice(arm, Math.max(0, t1 - (toY === null ? 0.07 : 0.06)), t1, ease + 0.6);
      out.push({ d: limb(band, { start: "flat", end: "flat" }), fill: cuff });
    }
  }
  return out;
}

/** All silhouettes of a garment as one union path, so the rim stroke follows the outer edge only. */
function unionWithRim(paints: Paint[], main: string): Paint[] {
  const shapes = paints.filter((p) => p.fill === main && p.op === undefined && !p.stroke);
  const rest = paints.filter((p) => !shapes.includes(p));
  if (!shapes.length) return paints;
  return [...base(join(...shapes.map((p) => p.d)), main), ...rest];
}

function top(x: Ctx, shape: Shape): Art {
  const { r, c, g } = x;
  const neckY = 178;
  const mainEase = (y: number) => (y < 200 ? 3 + (y - 176) * 0.25 : 9);
  const hemY = r.hipY + 22;
  const back: Paint[] = [];
  let p: Paint[] = [];

  if (shape === "bra") {
    const band = 318;
    const left: Pt[] = [
      { x: CX - 34, y: 184 }, { x: CX - 52, y: 214 }, { x: CX - hwAt(r.torso, 248) - 1, y: 248 },
      { x: CX - hwAt(r.torso, 290) - 1, y: 290 }, { x: CX - hwAt(r.torso, band) - 1, y: band },
    ];
    const d = mirrored(left, { closeTop: [{ x: CX + 22, y: 184 }, { x: CX, y: 246 }, { x: CX - 22, y: 184 }] });
    p = [
      { d, fill: c.main },
      { d: column(r.torso, band - 16, band, { ease: 1.5 }), fill: x.acc },
      line(`M${f(CX - 52)} ${f(214)} Q${f(CX - 30)} ${f(250)} ${f(CX)} ${f(250)}`, x.dark, 1.5, 0.6),
      line(`M${f(CX + 52)} ${f(214)} Q${f(CX + 30)} ${f(250)} ${f(CX)} ${f(250)}`, x.dark, 1.5, 0.6),
    ];
    return { back, front: unionWithRim(p, c.main) };
  }

  if (shape === "tank") {
    const left: Pt[] = [
      { x: CX - 40, y: 184 }, { x: CX - 50, y: 214 }, { x: CX - hwAt(r.torso, 262) - 4, y: 262 },
      { x: CX - hwAt(r.torso, 330) - 6, y: 330 }, { x: CX - hwAt(r.torso, r.waistY) - 7, y: r.waistY },
      { x: CX - hwAt(r.torso, hemY) - 8, y: hemY },
    ];
    const d = mirrored(left, { closeTop: [{ x: CX + 26, y: 184 }, { x: CX, y: 232 }, { x: CX - 26, y: 184 }] });
    p = [
      { d, fill: c.main },
      line(`M${f(CX - 26)} ${f(184)} Q${f(CX)} ${f(250)} ${f(CX + 26)} ${f(184)}`, x.acc, 3),
      line(`M${f(CX - 50)} ${f(214)} Q${f(CX - hwAt(r.torso, 240) + 2)} ${f(250)} ${f(CX - hwAt(r.torso, 262) - 4)} ${f(262)}`, x.acc, 3),
      line(`M${f(CX + 50)} ${f(214)} Q${f(CX + hwAt(r.torso, 240) - 2)} ${f(250)} ${f(CX + hwAt(r.torso, 262) + 4)} ${f(262)}`, x.acc, 3),
    ];
    return { back, front: unionWithRim(p, c.main) };
  }

  const crop = shape === "crop";
  const hem = crop ? r.waistY - 22 : hemY;
  const v = shape === "jersey" || shape === "jerseyLong";
  const torso = column(r.torso, neckY, hem, { ease: mainEase, neck: { hw: g === "hombre" ? 27 : 23, dip: v ? 34 : 14, v }, hem: 2 });
  const long = shape === "longsleeve" || shape === "jerseyLong";
  const sleeveTo = long ? null : g === "hombre" ? 300 : 290;
  p = [{ d: torso, fill: c.main }, ...sleeves(x, sleeveTo, long ? 4.5 : 7, long ? x.dark : undefined)];
  // shading down the sides of the torso
  p.push(shadow(sideBand(r.torso, 300, hem, 9, 16, 1), 0.14));
  p.push(light(sideBand(r.torso, 300, hem, 9, 12, -1), 0.08));

  if (v) {
    // v-neck trim, sleeve trims, a crest and a sponsor-free chest band
    p.push(line(`M${f(CX - 27)} ${f(neckY)} L${f(CX)} ${f(neckY + 34)} L${f(CX + 27)} ${f(neckY)}`, x.acc, 4.5));
    if (!long) p.push(...sides((s) => {
      const arm = pick(r.arm, s);
      const t1 = tAtY(arm, sleeveTo!);
      return { d: limb(slice(arm, t1 - 0.05, t1, 7.4), { start: "flat", end: "flat" }), fill: x.acc } as Paint;
    }));
    p.push({ d: `M${f(CX - 50)} 252 l14 0 l0 12 q-7 9 -7 9 q-7 -3 -7 -9 Z`, fill: x.acc });
    p.push({ d: `M${f(CX + 30)} 254 l22 -6 l-4 9 l-22 6 Z`, fill: x.acc, op: 0.85 });
    p.push(line(`M${f(CX - hwAt(r.torso, 300) - 8)} 300 L${f(CX - hwAt(r.torso, hem) - 8)} ${f(hem)}`, x.acc, 3, 0.8));
    p.push(line(`M${f(CX + hwAt(r.torso, 300) + 8)} 300 L${f(CX + hwAt(r.torso, hem) + 8)} ${f(hem)}`, x.acc, 3, 0.8));
  } else if (shape === "polo") {
    p.push({ d: `M${f(CX - 26)} ${f(neckY)} L${f(CX - 4)} ${f(neckY + 18)} L${f(CX - 18)} ${f(neckY + 30)} L${f(CX - 36)} ${f(neckY + 4)} Z`, fill: shade(c.main, -0.12) });
    p.push({ d: `M${f(CX + 26)} ${f(neckY)} L${f(CX + 4)} ${f(neckY + 18)} L${f(CX + 18)} ${f(neckY + 30)} L${f(CX + 36)} ${f(neckY + 4)} Z`, fill: shade(c.main, -0.12) });
    p.push(line(`M${f(CX)} ${f(neckY + 16)} L${f(CX)} ${f(neckY + 64)}`, x.dark, 2));
    p.push({ d: `M${f(CX)} ${f(neckY + 32)} a2.5 2.5 0 1 0 .1 0 M${f(CX)} ${f(neckY + 50)} a2.5 2.5 0 1 0 .1 0`, fill: x.acc });
    p.push({ d: `M${f(CX + 36)} 258 l18 -5 l-3 7 l-18 5 Z`, fill: x.acc });
  } else {
    // crew collar + a small chest mark in the accent colour
    p.push(line(`M${f(CX - (g === "hombre" ? 27 : 23))} ${f(neckY)} Q${f(CX)} ${f(neckY + 30)} ${f(CX + (g === "hombre" ? 27 : 23))} ${f(neckY)}`, x.dark, 4));
    p.push({ d: `M${f(CX + 34)} 256 l20 -5.5 l-3.5 8 l-20 5.5 Z`, fill: x.acc });
  }
  return { back, front: unionWithRim(p, c.main) };
}

function outer(x: Ctx, shape: Shape): Art {
  const { r, c, g } = x;
  const neckY = 172;
  const puffy = shape === "puffer" || shape === "vest";
  const ease = (y: number) => (y < 198 ? 6 + (y - 172) * 0.4 : puffy ? 20 : 14);
  const hem = r.hipY + (shape === "jacket" || shape === "windbreaker" ? 34 : 28);
  const neckHw = g === "hombre" ? 30 : 26;
  const back: Paint[] = [];
  const p: Paint[] = [];
  const zip = shape !== "crew" && shape !== "hoodie";

  const hasSleeves = shape !== "vest";
  if (hasSleeves) p.push(...sleeves(x, null, puffy ? 12 : 8.5, x.dark));
  else {
    const left: Pt[] = [
      { x: CX - 40, y: 176 }, { x: CX - 66, y: 196 }, { x: CX - hwAt(r.torso, 262) - 8, y: 266 },
      { x: CX - hwAt(r.torso, 340) - 18, y: 340 }, { x: CX - hwAt(r.torso, hem) - 18, y: hem },
    ];
    p.push({ d: mirrored(left, { closeTop: [{ x: CX + 30, y: 176 }, { x: CX, y: 200 }, { x: CX - 30, y: 176 }] }), fill: c.main });
  }
  if (hasSleeves) p.push({ d: column(r.torso, neckY, hem, { ease, neck: { hw: neckHw, dip: zip ? 10 : 16 }, hem: 1 }), fill: c.main });

  // ribbed hem
  p.push({ d: column(r.torso, hem - 15, hem, { ease: puffy ? 20 : 14, hem: 1 }), fill: x.dark });
  if (hasSleeves) p.push(shadow(sideBand(r.torso, 300, hem - 15, puffy ? 20 : 14, 16, 1), 0.16));

  if (shape === "hoodie" || shape === "windbreaker") {
    // hood bunched behind the neck + the rim around it
    back.push({ d: `M${f(CX - 56)} 198 C${f(CX - 60)} 166 ${f(CX - 38)} 150 ${f(CX)} 150 C${f(CX + 38)} 150 ${f(CX + 60)} 166 ${f(CX + 56)} 198 Z`, fill: shade(c.main, -0.25) });
    p.push({ d: `M${f(CX - 58)} 194 C${f(CX - 50)} 168 ${f(CX - 34)} 164 ${f(CX - 22)} 172 L${f(CX - 14)} 196 C${f(CX - 30)} 192 ${f(CX - 44)} 196 ${f(CX - 58)} 206 Z`, fill: shade(c.main, -0.1) });
    p.push({ d: `M${f(CX + 58)} 194 C${f(CX + 50)} 168 ${f(CX + 34)} 164 ${f(CX + 22)} 172 L${f(CX + 14)} 196 C${f(CX + 30)} 192 ${f(CX + 44)} 196 ${f(CX + 58)} 206 Z`, fill: shade(c.main, -0.1) });
  }
  if (shape === "hoodie") {
    p.push(line(`M${f(CX - 10)} 196 L${f(CX - 13)} 262`, x.lite, 2.4));
    p.push(line(`M${f(CX + 10)} 196 L${f(CX + 13)} 262`, x.lite, 2.4));
    p.push({ d: `M${f(CX - 13)} 262 m-2.5 0 a2.5 4 0 1 0 5 0 a2.5 4 0 1 0 -5 0 M${f(CX + 13)} 262 m-2.5 0 a2.5 4 0 1 0 5 0 a2.5 4 0 1 0 -5 0`, fill: x.acc });
    // kangaroo pocket
    p.push({ d: `M${f(CX - 54)} ${f(hem - 22)} L${f(CX - 40)} ${f(hem - 88)} L${f(CX + 40)} ${f(hem - 88)} L${f(CX + 54)} ${f(hem - 22)} Z`, fill: shade(c.main, -0.08) });
    p.push(line(`M${f(CX - 54)} ${f(hem - 22)} L${f(CX - 40)} ${f(hem - 88)} L${f(CX + 40)} ${f(hem - 88)} L${f(CX + 54)} ${f(hem - 22)}`, x.dark, 1.6, 0.7));
  }
  if (shape === "crew") {
    p.push({ d: `M${f(CX - neckHw)} ${f(neckY)} Q${f(CX)} ${f(neckY + 34)} ${f(CX + neckHw)} ${f(neckY)} L${f(CX + neckHw - 7)} ${f(neckY - 1)} Q${f(CX)} ${f(neckY + 22)} ${f(CX - neckHw + 7)} ${f(neckY - 1)} Z`, fill: x.dark });
    p.push({ d: `M${f(CX + 36)} 258 l22 -6 l-4 9 l-22 6 Z`, fill: x.acc });
  }
  if (zip) {
    // stand collar and zip
    p.push({ d: `M${f(CX - neckHw + 2)} ${f(neckY + 2)} L${f(CX - neckHw + 4)} ${f(neckY - 18)} Q${f(CX)} ${f(neckY - 26)} ${f(CX + neckHw - 4)} ${f(neckY - 18)} L${f(CX + neckHw - 2)} ${f(neckY + 2)} Q${f(CX)} ${f(neckY + 12)} ${f(CX - neckHw + 2)} ${f(neckY + 2)} Z`, fill: shade(c.main, -0.14) });
    const zipEnd = shape === "halfzip" ? 280 : hem;
    p.push(line(`M${f(CX)} ${f(neckY + 6)} L${f(CX)} ${f(zipEnd)}`, x.dark, 3));
    p.push({ d: `M${f(CX - 3.5)} ${f(neckY + 16)} h7 v14 h-7 Z`, fill: x.acc });
    if (shape !== "halfzip") {
      p.push(line(`M${f(CX - 62)} ${f(hem - 70)} L${f(CX - 50)} ${f(hem - 30)}`, x.dark, 2.4, 0.8));
      p.push(line(`M${f(CX + 62)} ${f(hem - 70)} L${f(CX + 50)} ${f(hem - 30)}`, x.dark, 2.4, 0.8));
    }
  }
  if (shape === "jacket") {
    // track-jacket stripes down the sleeves
    for (const s of ["L", "R"] as const) {
      const arm = pick(r.arm, s);
      p.push(line(limbCentre(arm, 0.08, 0.9, s === "L" ? -6 : 6), x.acc, 4, 0.95));
    }
  }
  if (shape === "windbreaker") {
    p.push({ d: `M${f(CX - hwAt(r.torso, 240) - 14)} 240 L${f(CX)} 300 L${f(CX + hwAt(r.torso, 240) + 14)} 240 L${f(CX + hwAt(r.torso, 270) + 14)} 270 L${f(CX)} 330 L${f(CX - hwAt(r.torso, 270) - 14)} 270 Z`, fill: x.acc, op: 0.95 });
  }
  if (puffy) {
    for (let y = 222; y < hem - 18; y += 34) {
      const hw = hwAt(r.torso, y) + 19;
      p.push(line(`M${f(CX - hw)} ${f(y)} Q${f(CX)} ${f(y + 8)} ${f(CX + hw)} ${f(y)}`, x.dark, 2, 0.55));
    }
    if (hasSleeves)
      for (const s of ["L", "R"] as const) {
        const arm = pick(r.arm, s);
        for (const t of [0.22, 0.42, 0.62, 0.82]) {
          const [ax, ay, aw] = pointAt(arm, t);
          p.push(line(`M${f(ax - aw - 11)} ${f(ay - 3)} Q${f(ax)} ${f(ay + 5)} ${f(ax + aw + 11)} ${f(ay - 3)}`, x.dark, 2, 0.5));
        }
      }
  }
  return { back, front: unionWithRim(p, c.main) };
}

/** A centre line along a limb, offset sideways, for stripes and seams. */
function limbCentre(l: LP[], t0: number, t1: number, off: number) {
  const pts: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const [x, y] = pointAt(l, t0 + ((t1 - t0) * i) / 8);
    pts.push({ x: x + off, y });
  }
  return `M${P(pts[0])}${cr(pts)}`;
}

function bottom(x: Ctx, shape: Shape): Art {
  const { r, c, g } = x;
  const waist = r.waistY + (g === "hombre" ? 14 : 18);
  const p: Paint[] = [];
  const legs = sides((s) => pick(r.leg, s));

  if (shape === "skirt") {
    const hem = g === "hombre" ? 640 : 600;
    const left: Pt[] = [
      { x: CX - hwAt(r.torso, waist) - 3, y: waist },
      { x: CX - hwAt(r.torso, r.hipY) - 9, y: r.hipY },
      { x: CX - hwAt(r.torso, r.hipY) - 30, y: hem },
    ];
    p.push({ d: mirrored(left), fill: c.main });
    for (const k of [-0.66, -0.33, 0, 0.33, 0.66]) {
      p.push(line(`M${f(CX + k * 70)} ${f(r.hipY - 6)} L${f(CX + k * 104)} ${f(hem - 2)}`, x.dark, 1.8, 0.55));
    }
    p.push({ d: column(r.torso, waist, waist + 16, { ease: 3 }), fill: x.acc });
    p.push(shadow(`M${f(CX + hwAt(r.torso, r.hipY) - 6)} ${f(r.hipY)} L${f(CX + hwAt(r.torso, r.hipY) + 9)} ${f(r.hipY)} L${f(CX + hwAt(r.torso, r.hipY) + 30)} ${f(hem)} L${f(CX + hwAt(r.torso, r.hipY) + 6)} ${f(hem)} Z`, 0.18));
    return { back: [], front: unionWithRim(p, c.main) };
  }

  const cfg: Record<string, { hemY: number; ease: (t: number) => number }> = {
    shorts: { hemY: g === "hombre" ? 652 : 610, ease: () => 11 },
    bikeshorts: { hemY: g === "hombre" ? 640 : 632, ease: () => 1.8 },
    leggings: { hemY: 898, ease: () => 1.6 },
    pants: { hemY: 914, ease: (t) => 9 - t * 2 },
    joggers: { hemY: 900, ease: (t) => 11 - t * 6 },
  };
  const k = cfg[shape] ?? cfg.shorts;
  const ease0 = k.ease(0);
  p.push({ d: column(r.torso, waist, r.torso[r.torso.length - 1][0], { ease: ease0 > 4 ? ease0 - 3 : 2 }) + " " + crotchFill(r, ease0), fill: c.main });
  for (const l of legs) {
    const t1 = tAtY(l, k.hemY);
    const sl = slice(l, 0, t1, k.ease);
    p.push({ d: limb(sl, { end: "flat" }), fill: c.main });
    if (t1 > tAtY(l, r.crotchY) + 0.04) {
      const free = slice(l, tAtY(l, r.crotchY), t1, k.ease);
      p.push(shadow(edge(free, "out", 0.28), 0.2));
      p.push(light(edge(free, "in", 0.18), 0.08));
    }
    if (shape === "joggers") p.push({ d: limb(slice(l, t1 - 0.05, t1, k.ease(1) + 0.8), { start: "flat", end: "flat" }), fill: x.dark });
    // side stripe
    if (shape !== "leggings" || g === "hombre") {
      const side = l[0][0] < CX ? -1 : 1;
      p.push(line(limbCentre(slice(l, 0.02, t1 - 0.02, k.ease), 0, 1, side * (k.ease(0.5) + l[2][2] * 0.7)), x.acc, shape === "shorts" ? 3.2 : 2.6, 0.95));
    }
  }
  // waistband
  p.push({ d: column(r.torso, waist, waist + 14, { ease: Math.max(2, ease0 - 3) }), fill: shape === "leggings" || shape === "bikeshorts" ? x.acc : x.dark });
  if (shape === "shorts" || shape === "pants" || shape === "joggers") {
    p.push(line(`M${f(CX - 6)} ${f(waist + 12)} q-3 18 -6 26 M${f(CX + 6)} ${f(waist + 12)} q3 18 6 26`, x.lite, 2));
  }
  p.push(line(`M${f(CX)} ${f(waist + 18)} L${f(CX)} ${f(r.crotchY - 8)}`, x.dark, 1.6, 0.45));
  return { back: [], front: unionWithRim(p, c.main) };
}

/** Closes the gap between the legs under the waistband. */
function crotchFill(r: Rig, ease: number) {
  const y0 = r.torso[r.torso.length - 1][0] - 6;
  const hw = hwAt(r.torso, y0) + ease - 3;
  return `M${f(CX - hw)} ${f(y0)} Q${f(CX - hw * 0.4)} ${f(r.crotchY + 8)} ${f(CX)} ${f(r.crotchY + 10)} Q${f(CX + hw * 0.4)} ${f(r.crotchY + 8)} ${f(CX + hw)} ${f(y0)} Z`;
}

function socks(x: Ctx, shape: Shape): Art {
  const { r, c } = x;
  const topY = shape === "high" ? 690 : shape === "ankle" ? 884 : 812;
  const p: Paint[] = [];
  for (const s of ["L", "R"] as const) {
    const l = pick(r.leg, s);
    const sl = slice(l, tAtY(l, topY), 1, 2.2);
    const foot = pick(r.foot, s).map(([fx, fy, fw]) => [fx, fy, fw + 1.6] as LP);
    p.push({ d: limb(sl, { start: "flat" }), fill: c.main });
    p.push({ d: limb(foot), fill: c.main });
    p.push(shadow(edge(sl, "out", 0.3), 0.2));
    p.push({ d: limb(slice(l, tAtY(l, topY), tAtY(l, topY + 12), 2.6), { start: "flat", end: "flat" }), fill: x.acc });
    if (shape === "high") p.push({ d: limb(slice(l, tAtY(l, topY + 22), tAtY(l, topY + 30), 2.4), { start: "flat", end: "flat" }), fill: x.acc });
  }
  return { back: [], front: unionWithRim(p, c.main) };
}

function shoes(x: Ctx, shape: Shape): Art {
  const { r, c } = x;
  const p: Paint[] = [];
  const sole = luminance(c.main) > 0.5 ? "#e9e6dd" : contrastOn(c.main, "#F3F3F1");
  for (const s of ["L", "R"] as const) {
    const ft = pick(r.foot, s);
    const [ax, , aw] = ft[0];
    const [tx, ty, tw] = ft[ft.length - 1];
    const dir = s === "L" ? -1 : 1;
    const bottomY = ty + tw * 0.95;
    if (shape === "slides") {
      p.push({ d: `M${f(tx - tw - 5)} ${f(bottomY - 4)} L${f(tx + tw + 5)} ${f(bottomY - 4)} L${f(tx + tw + 4)} ${f(bottomY + 7)} L${f(tx - tw - 4)} ${f(bottomY + 7)} Z`, fill: sole });
      p.push({ d: `M${f(tx - tw - 3)} ${f(ty - 14)} Q${f(tx)} ${f(ty - 26)} ${f(tx + tw + 3)} ${f(ty - 14)} L${f(tx + tw + 4)} ${f(ty + 4)} Q${f(tx)} ${f(ty - 6)} ${f(tx - tw - 4)} ${f(ty + 4)} Z`, fill: c.main });
      p.push({ d: `M${f(tx - 8)} ${f(ty - 14)} l16 -4 l-3 6 l-16 4 Z`, fill: x.acc });
      continue;
    }
    const topY = shape === "hightop" ? 848 : 884;
    const upper: LP[] = [
      [ax + dir * 0.5, topY, aw + (shape === "hightop" ? 6 : 3.5)],
      [ax - dir * 1, (topY + ty) / 2 + 6, (aw + tw) / 2 + 6],
      [tx - dir * 0.5, ty + 2, tw + 6],
    ];
    p.push({ d: limb(upper, { start: "flat" }), fill: c.main });
    p.push(shadow(edge(upper, "out", 0.35), 0.22));
    // sole, toe cap, laces, side stripe
    p.push({ d: `M${f(tx - tw - 8)} ${f(bottomY - 3)} Q${f(tx)} ${f(bottomY - 9)} ${f(tx + tw + 8)} ${f(bottomY - 3)} L${f(tx + tw + 7)} ${f(bottomY + 8)} Q${f(tx)} ${f(bottomY + 12)} ${f(tx - tw - 7)} ${f(bottomY + 8)} Z`, fill: shape === "cleats" ? x.acc : sole });
    p.push({ d: `M${f(tx - tw - 3)} ${f(bottomY - 6)} Q${f(tx)} ${f(bottomY - 26)} ${f(tx + tw + 3)} ${f(bottomY - 6)} Z`, fill: shade(c.main, 0.12), op: 0.9 });
    for (let i = 0; i < (shape === "hightop" ? 5 : 3); i++) {
      const y = topY + 8 + i * 9;
      p.push(line(`M${f(ax - 5)} ${f(y)} L${f(ax + 5)} ${f(y + 2)}`, x.lite, 2));
    }
    p.push(line(`M${f(ax + dir * (aw + 2))} ${f(topY + 22)} Q${f(tx + dir * (tw + 2))} ${f(ty - 6)} ${f(tx + dir * (tw - 6))} ${f(bottomY - 10)}`, x.acc, 4));
    if (shape === "cleats") {
      for (const dx of [-0.75, -0.25, 0.25, 0.75]) p.push({ d: `M${f(tx + dx * tw - 3)} ${f(bottomY + 10)} h6 v6 h-6 Z`, fill: shade(x.acc, -0.3) });
    }
  }
  return { back: [], front: unionWithRim(p, c.main) };
}

function head(x: Ctx, shape: Shape): Art {
  const { r, c } = x;
  const { cy, rx, ry } = r.head;
  const top = cy - ry;
  const p: Paint[] = [];
  if (shape === "headband") {
    p.push({ d: `M${f(CX - rx - 1)} ${f(cy - 20)} Q${f(CX)} ${f(cy - 36)} ${f(CX + rx + 1)} ${f(cy - 20)} L${f(CX + rx + 1)} ${f(cy - 6)} Q${f(CX)} ${f(cy - 22)} ${f(CX - rx - 1)} ${f(cy - 6)} Z`, fill: c.main });
    p.push({ d: `M${f(CX - 7)} ${f(cy - 26)} l14 -4 l-3 6 l-14 4 Z`, fill: x.acc });
    return { back: [], front: unionWithRim(p, c.main) };
  }
  const domeBottom = cy - 14;
  if (shape !== "visor") {
    const tall = shape === "beanie" ? 14 : 4;
    p.push({ d: `M${f(CX - rx - 3)} ${f(domeBottom)} C${f(CX - rx - 4)} ${f(top - 14 - tall)} ${f(CX + rx + 4)} ${f(top - 14 - tall)} ${f(CX + rx + 3)} ${f(domeBottom)} Q${f(CX)} ${f(domeBottom - 8)} ${f(CX - rx - 3)} ${f(domeBottom)} Z`, fill: c.main });
    p.push(light(`M${f(CX - rx * 0.7)} ${f(domeBottom - 10)} C${f(CX - rx * 0.8)} ${f(top - 4)} ${f(CX - 6)} ${f(top - 8 - tall)} ${f(CX + 4)} ${f(top - 6 - tall)} C${f(CX - 16)} ${f(top + 4)} ${f(CX - rx * 0.5)} ${f(top + 16)} ${f(CX - rx * 0.7)} ${f(domeBottom - 10)} Z`, 0.16));
  }
  if (shape === "cap" || shape === "visor") {
    if (shape === "visor") p.push({ d: `M${f(CX - rx - 2)} ${f(domeBottom - 10)} Q${f(CX)} ${f(domeBottom - 24)} ${f(CX + rx + 2)} ${f(domeBottom - 10)} L${f(CX + rx + 2)} ${f(domeBottom + 2)} Q${f(CX)} ${f(domeBottom - 10)} ${f(CX - rx - 2)} ${f(domeBottom + 2)} Z`, fill: c.main });
    p.push({ d: `M${f(CX - rx - 8)} ${f(domeBottom - 2)} Q${f(CX)} ${f(domeBottom - 12)} ${f(CX + rx + 8)} ${f(domeBottom - 2)} Q${f(CX + rx + 2)} ${f(domeBottom + 16)} ${f(CX)} ${f(domeBottom + 18)} Q${f(CX - rx - 2)} ${f(domeBottom + 16)} ${f(CX - rx - 8)} ${f(domeBottom - 2)} Z`, fill: shade(c.main, -0.12) });
    if (shape === "cap") {
      p.push(line(`M${f(CX)} ${f(top - 13)} L${f(CX)} ${f(domeBottom - 6)}`, x.dark, 1.5, 0.6));
      p.push({ d: `M${f(CX - 9)} ${f(top + 14)} l18 -5 l-3 7 l-18 5 Z`, fill: x.acc });
    }
  }
  if (shape === "beanie") {
    p.push({ d: `M${f(CX - rx - 4)} ${f(domeBottom - 18)} Q${f(CX)} ${f(domeBottom - 28)} ${f(CX + rx + 4)} ${f(domeBottom - 18)} L${f(CX + rx + 4)} ${f(domeBottom + 2)} Q${f(CX)} ${f(domeBottom - 8)} ${f(CX - rx - 4)} ${f(domeBottom + 2)} Z`, fill: shade(c.main, -0.1) });
  }
  if (shape === "bucket") {
    p.push({ d: `M${f(CX - rx - 4)} ${f(domeBottom - 6)} Q${f(CX)} ${f(domeBottom - 14)} ${f(CX + rx + 4)} ${f(domeBottom - 6)} L${f(CX + rx + 20)} ${f(domeBottom + 12)} Q${f(CX)} ${f(domeBottom + 4)} ${f(CX - rx - 20)} ${f(domeBottom + 12)} Z`, fill: shade(c.main, -0.1) });
  }
  return { back: [], front: unionWithRim(p, c.main) };
}

function hands(x: Ctx, shape: Shape): Art {
  const { r, c } = x;
  const p: Paint[] = [];
  for (const s of ["L", "R"] as const) {
    const arm = pick(r.arm, s);
    const hand = pick(r.hand, s);
    if (shape === "wristband") {
      p.push({ d: limb(slice(arm, 0.85, 0.975, 4.2), { start: "flat", end: "flat" }), fill: c.main });
      p.push({ d: limb(slice(arm, 0.905, 0.92, 4.4), { start: "flat", end: "flat" }), fill: x.acc });
      continue;
    }
    const big = shape === "gkgloves";
    const g = hand.map(([hx, hy, hw], i) => [hx, hy + (big && i === hand.length - 1 ? 6 : 0), hw + (big ? 6.5 : 1.8)] as LP);
    p.push({ d: limb(g), fill: c.main });
    p.push({ d: limb(pick(r.thumb, s).map(([tx, ty, tw]) => [tx, ty, tw + (big ? 4.5 : 1.5)] as LP)), fill: c.main });
    p.push({ d: limb(slice(arm, 0.92, 0.995, big ? 7 : 3), { start: "flat", end: "flat" }), fill: x.acc });
    if (big) {
      const [hx, hy] = hand[2];
      for (const dx of [-7, 0, 7]) p.push(line(`M${f(hx + dx)} ${f(hy - 6)} L${f(hx + dx)} ${f(hy + 24)}`, x.dark, 1.6, 0.6));
    }
  }
  return { back: [], front: unionWithRim(p, c.main) };
}

function protect(x: Ctx, shape: Shape): Art {
  const { r, c } = x;
  const p: Paint[] = [];
  for (const s of ["L", "R"] as const) {
    const l = pick(r.leg, s);
    if (shape === "kneepads") {
      const kneeY = l[3][1];
      const sl = slice(l, tAtY(l, kneeY - 34), tAtY(l, kneeY + 30), 7);
      p.push({ d: limb(sl, { start: "round", end: "round" }), fill: c.main });
      p.push({ d: limb(slice(l, tAtY(l, kneeY - 14), tAtY(l, kneeY + 14), 3), { start: "round", end: "round" }), fill: shade(c.main, 0.1) });
      p.push({ d: limb(slice(l, tAtY(l, kneeY + 18), tAtY(l, kneeY + 24), 7.2), { start: "flat", end: "flat" }), fill: x.acc });
    } else {
      const sl = slice(l, tAtY(l, 742), tAtY(l, 858), (t) => -l[4][2] * 0.38 - t * 2);
      p.push({ d: limb(sl, { start: "round", end: "round" }), fill: c.main });
      p.push(line(limbCentre(sl, 0.12, 0.88, 0), x.acc, 3));
      p.push(light(edge(sl, "in", 0.3), 0.18));
    }
  }
  return { back: [], front: unionWithRim(p, c.main) };
}

/** Gear is held or placed: sticks and rackets go behind the hand so the hand grips them. */
function gear(x: Ctx, shape: Shape): Art {
  const { r, c, g } = x;
  const hand = r.hand;
  const [hx, hy] = hand[2];
  const rightHand = mirrorLP(hand)[2];
  const foot = mirrorLP(r.foot)[2];
  const back: Paint[] = [];
  const front: Paint[] = [];
  if (shape === "hockeyStick") {
    const top = { x: hx + 16, y: hy - 98 };
    const toe = { x: hx - 34, y: 948 };
    back.push(line(`M${P(top)} L${P(toe)}`, c.main, 11));
    back.push(line(`M${P(top)} L${f(top.x - (top.x - toe.x) * 0.3)} ${f(top.y + (toe.y - top.y) * 0.3)}`, "#18191d", 12));
    back.push(line(`M${f(top.x - (top.x - toe.x) * 0.5)} ${f(top.y + (toe.y - top.y) * 0.5)} L${f(top.x - (top.x - toe.x) * 0.62)} ${f(top.y + (toe.y - top.y) * 0.62)}`, x.acc, 11.5));
    back.push(line(`M${P(toe)} C${f(toe.x - 6)} ${f(toe.y + 22)} ${f(toe.x + 26)} ${f(toe.y + 30)} ${f(toe.x + 40)} ${f(toe.y + 14)}`, c.main, 12));
    back.push(line(`M${f(toe.x - 2)} ${f(toe.y + 8)} C${f(toe.x - 2)} ${f(toe.y + 22)} ${f(toe.x + 22)} ${f(toe.y + 26)} ${f(toe.x + 34)} ${f(toe.y + 16)}`, x.acc, 3.5));
    front.push({ d: `M${f(toe.x + 62)} ${f(toe.y + 22)} m-10 0 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0`, fill: "#F3F3F1", stroke: "rgba(4,10,28,.3)", sw: 1 });
  } else if (shape === "tennisRacket") {
    const handleTop = { x: hx + 6, y: hy - 30 };
    const throat = { x: hx - 16, y: hy + 70 };
    const ang = Math.atan2(throat.y - handleTop.y, throat.x - handleTop.x);
    const headC = { x: throat.x + Math.cos(ang) * 64, y: throat.y + Math.sin(ang) * 64 };
    back.push(line(`M${P(handleTop)} L${P(throat)}`, "#18191d", 10));
    back.push(line(`M${f(throat.x)} ${f(throat.y)} L${f(headC.x - 16)} ${f(headC.y - 44)} M${f(throat.x)} ${f(throat.y)} L${f(headC.x + 22)} ${f(headC.y - 40)}`, c.main, 6));
    back.push({ d: `M${f(headC.x)} ${f(headC.y)} m-34 0 a34 48 0 1 0 68 0 a34 48 0 1 0 -68 0`, fill: "rgba(220,226,240,.18)", stroke: c.main, sw: 7, dash: undefined });
    const strings: string[] = [];
    for (let i = -3; i <= 3; i++) strings.push(`M${f(headC.x + i * 8.5)} ${f(headC.y - 44 * Math.sqrt(1 - (i / 4.2) ** 2))} L${f(headC.x + i * 8.5)} ${f(headC.y + 44 * Math.sqrt(1 - (i / 4.2) ** 2))}`);
    for (let j = -4; j <= 4; j++) strings.push(`M${f(headC.x - 31 * Math.sqrt(1 - (j / 5.4) ** 2))} ${f(headC.y + j * 10)} L${f(headC.x + 31 * Math.sqrt(1 - (j / 5.4) ** 2))} ${f(headC.y + j * 10)}`);
    back.push({ d: strings.join(" "), fill: "none", stroke: "rgba(230,236,250,.7)", sw: 1.1 });
    back.push(line(`M${f(headC.x - 34)} ${f(headC.y + 8)} A34 48 0 0 0 ${f(headC.x - 8)} ${f(headC.y + 47)}`, x.acc, 4));
  } else if (shape === "tennisBall") {
    front.push({ d: `M${f(rightHand[0])} ${f(rightHand[1] + 18)} m-13 0 a13 13 0 1 0 26 0 a13 13 0 1 0 -26 0`, fill: c.main, stroke: "rgba(4,10,28,.25)", sw: 1 });
    front.push(line(`M${f(rightHand[0] - 11)} ${f(rightHand[1] + 12)} Q${f(rightHand[0])} ${f(rightHand[1] + 20)} ${f(rightHand[0] + 11)} ${f(rightHand[1] + 12)}`, "#fff", 1.6));
  } else if (shape === "football") {
    const bx = foot[0] + 58;
    const by = 948;
    front.push({ d: `M${f(bx)} ${f(by)} m-28 0 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0`, fill: c.main, stroke: "rgba(4,10,28,.35)", sw: 1.2 });
    front.push({ d: `M${f(bx)} ${f(by - 10)} l9.5 7 -3.6 11 h-11.8 l-3.6 -11 Z`, fill: x.acc });
    front.push(line(`M${f(bx)} ${f(by - 10)} L${f(bx)} ${f(by - 27)} M${f(bx + 9.5)} ${f(by - 3)} L${f(bx + 25)} ${f(by - 9)} M${f(bx + 6)} ${f(by + 8)} L${f(bx + 15)} ${f(by + 22)} M${f(bx - 6)} ${f(by + 8)} L${f(bx - 15)} ${f(by + 22)} M${f(bx - 9.5)} ${f(by - 3)} L${f(bx - 25)} ${f(by - 9)}`, x.acc, 1.8));
    front.push(light(`M${f(bx - 18)} ${f(by - 14)} q8 -10 20 -10 q-14 6 -16 18 Z`, 0.35));
  } else {
    // balls carried in the free hand: volleyball, basketball
    const bx = rightHand[0] + (g === "hombre" ? 12 : 10);
    const by = rightHand[1] + 4;
    const R = 34;
    front.push({ d: `M${f(bx)} ${f(by)} m-${R} 0 a${R} ${R} 0 1 0 ${R * 2} 0 a${R} ${R} 0 1 0 -${R * 2} 0`, fill: c.main, stroke: "rgba(4,10,28,.35)", sw: 1.2 });
    if (shape === "volleyball") {
      front.push({ d: `M${f(bx)} ${f(by)} C${f(bx - 14)} ${f(by - 14)} ${f(bx - 16)} ${f(by - 28)} ${f(bx - 8)} ${f(by - R + 1)} L${f(bx - 22)} ${f(by - 26)} C${f(bx - 26)} ${f(by - 12)} ${f(bx - 14)} ${f(by)} ${f(bx)} ${f(by)} Z M${f(bx)} ${f(by)} C${f(bx + 18)} ${f(by - 2)} ${f(bx + 30)} ${f(by + 6)} ${f(bx + R - 2)} ${f(by + 14)} L${f(bx + 28)} ${f(by + 20)} C${f(bx + 20)} ${f(by + 10)} ${f(bx + 10)} ${f(by + 4)} ${f(bx)} ${f(by)} Z`, fill: c.accent });
      front.push(line(`M${f(bx)} ${f(by)} C${f(bx - 14)} ${f(by - 14)} ${f(bx - 16)} ${f(by - 28)} ${f(bx - 8)} ${f(by - R + 1)} M${f(bx)} ${f(by)} C${f(bx + 18)} ${f(by - 2)} ${f(bx + 30)} ${f(by + 6)} ${f(bx + R - 2)} ${f(by + 14)} M${f(bx)} ${f(by)} C${f(bx - 2)} ${f(by + 18)} ${f(bx - 12)} ${f(by + 28)} ${f(bx - 22)} ${f(by + 26)}`, "rgba(4,10,28,.35)", 1.6));
    } else {
      front.push(line(`M${f(bx - R)} ${f(by)} L${f(bx + R)} ${f(by)} M${f(bx)} ${f(by - R)} L${f(bx)} ${f(by + R)} M${f(bx - 22)} ${f(by - 26)} Q${f(bx - 8)} ${f(by)} ${f(bx - 22)} ${f(by + 26)} M${f(bx + 22)} ${f(by - 26)} Q${f(bx + 8)} ${f(by)} ${f(bx + 22)} ${f(by + 26)}`, "#1a1a1a", 1.8));
    }
    front.push(light(`M${f(bx - 22)} ${f(by - 16)} q8 -12 24 -12 q-16 6 -20 20 Z`, 0.3));
  }
  return { back, front };
}

/** Drawing order. Socks under protection under shoes under trousers under tops under jackets. */
export const SLOT_ORDER: Slot[] = ["socks", "protect", "shoes", "bottom", "top", "outer", "head", "hands", "gear"];

export function garment(g: Gender, slot: Slot, shape: Shape, main: string, accent: string): Art {
  const r = RIGS[g];
  const acc = contrastOn(main, accent);
  const x: Ctx = {
    r, g, c: { main, accent }, acc,
    dark: shade(main, luminance(main) < 0.05 ? 0.18 : -0.22),
    lite: luminance(main) > 0.45 ? "#2a2c33" : "#eef1f6",
  };
  switch (slot) {
    case "top": return top(x, shape);
    case "outer": return outer(x, shape);
    case "bottom": return bottom(x, shape);
    case "socks": return socks(x, shape);
    case "shoes": return shoes(x, shape);
    case "head": return head(x, shape);
    case "hands": return hands(x, shape);
    case "protect": return protect(x, shape);
    case "gear": return gear(x, shape);
  }
}

export type Worn = Partial<Record<Slot, { id: string; shape: Shape; main: string; accent: string }>>;
export type LayerGroup = { key: string; slot: Slot | null; paints: Paint[] };

/** Every layer of a dressed mannequin, back to front. */
export function compose(g: Gender, worn: Worn): LayerGroup[] {
  const b = body(g);
  const arts = SLOT_ORDER.filter((s) => worn[s]).map((s) => {
    const w = worn[s]!;
    return { slot: s, id: w.id, art: garment(g, s, w.shape, w.main, w.accent) };
  });
  return [
    ...arts.filter((a) => a.art.back.length).map((a) => ({ key: `back-${a.slot}-${a.id}`, slot: a.slot, paints: a.art.back })),
    { key: `body-back-${g}`, slot: null, paints: b.back },
    { key: `body-${g}`, slot: null, paints: b.front },
    ...arts.map((a) => ({ key: `${a.slot}-${a.id}`, slot: a.slot, paints: a.art.front })),
  ];
}

// ------------------------------------------------------------------ tap zones

export type ZoneId = "cabeza" | "torso" | "piernas" | "pies" | "manos";

export const ZONES: Record<ZoneId, { label: string; slots: Slot[] }> = {
  cabeza: { label: "Cabeza", slots: ["head"] },
  torso: { label: "Torso", slots: ["top", "outer"] },
  piernas: { label: "Piernas", slots: ["bottom", "protect"] },
  pies: { label: "Pies", slots: ["shoes", "socks"] },
  manos: { label: "Manos", slots: ["hands", "gear"] },
};

export function zoneFor(slot: Slot): ZoneId {
  return (Object.keys(ZONES) as ZoneId[]).find((z) => ZONES[z].slots.includes(slot)) ?? "torso";
}

/** Hit areas and the pin that marks each one, in viewBox units. */
export function zones(g: Gender) {
  const r = RIGS[g];
  const hand = r.hand[2];
  const rHand = mirrorLP(r.hand)[2];
  const leg = r.leg;
  return {
    cabeza: { hit: `M${CX} ${r.head.cy} m-62 0 a62 64 0 1 0 124 0 a62 64 0 1 0 -124 0`, pin: { x: CX + r.head.rx + 6, y: r.head.cy - r.head.ry + 2 } },
    torso: { hit: `M${CX - 96} 168 H${CX + 96} V${r.waistY + 6} H${CX - 96} Z`, pin: { x: CX + 34, y: 300 } },
    piernas: { hit: `M${CX - 92} ${r.waistY + 6} H${CX + 92} V${leg[4][1] - 30} H${CX - 92} Z`, pin: { x: mirrorX(leg[2][0]) + 4, y: leg[2][1] - 30 } },
    pies: { hit: `M${CX - 96} ${leg[4][1] - 30} H${CX + 96} V995 H${CX - 96} Z`, pin: { x: mirrorX(r.foot[1][0]), y: r.foot[1][1] - 6 } },
    manos: {
      hit: `M${hand[0]} ${hand[1]} m-46 0 a46 58 0 1 0 92 0 a46 58 0 1 0 -92 0 M${rHand[0]} ${rHand[1]} m-46 0 a46 58 0 1 0 92 0 a46 58 0 1 0 -92 0`,
      pin: { x: rHand[0], y: rHand[1] - 4 },
    },
  } satisfies Record<ZoneId, { hit: string; pin: Pt }>;
}
