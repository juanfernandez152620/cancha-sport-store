// Renders mannequin outfits to a PNG contact sheet to check garment alignment by eye.
//   node scripts/preview-figure.ts <out.png>
import sharp from "sharp";
import { compose, zones, VIEW, type Paint, type Worn } from "../src/components/outfit/figure.ts";

const out = process.argv[2] ?? "figure-preview.png";

const SETS: { g: "hombre" | "mujer"; label: string; worn: Worn }[] = [
  { g: "hombre", label: "body", worn: {} },
  {
    g: "hombre", label: "futbol",
    worn: {
      top: { id: "a", shape: "jersey", main: "#7FB2E5", accent: "#F3F3F1" },
      bottom: { id: "b", shape: "shorts", main: "#15161A", accent: "#D9FF1E" },
      socks: { id: "c", shape: "high", main: "#F3F3F1", accent: "#2449C9" },
      shoes: { id: "d", shape: "cleats", main: "#E5258A", accent: "#15161A" },
      protect: { id: "e", shape: "shinguards", main: "#15161A", accent: "#00E5FF" },
      gear: { id: "f", shape: "football", main: "#F3F3F1", accent: "#15161A" },
    },
  },
  {
    g: "hombre", label: "hockey",
    worn: {
      top: { id: "a", shape: "tee", main: "#1A2445", accent: "#D9FF1E" },
      bottom: { id: "b", shape: "shorts", main: "#F3F3F1", accent: "#1A2445" },
      socks: { id: "c", shape: "high", main: "#1A2445", accent: "#D9FF1E" },
      shoes: { id: "d", shape: "sneaker", main: "#15161A", accent: "#D9FF1E" },
      head: { id: "h", shape: "cap", main: "#15161A", accent: "#D9FF1E" },
      hands: { id: "i", shape: "gloves", main: "#15161A", accent: "#D9FF1E" },
      gear: { id: "f", shape: "hockeyStick", main: "#15161A", accent: "#D9FF1E" },
    },
  },
  {
    g: "hombre", label: "street",
    worn: {
      outer: { id: "a", shape: "hoodie", main: "#8E9299", accent: "#15161A" },
      top: { id: "t", shape: "tee", main: "#F3F3F1", accent: "#15161A" },
      bottom: { id: "b", shape: "joggers", main: "#15161A", accent: "#F3F3F1" },
      shoes: { id: "d", shape: "hightop", main: "#F3F3F1", accent: "#D3202E" },
      head: { id: "h", shape: "beanie", main: "#D3202E", accent: "#15161A" },
    },
  },
  {
    g: "hombre", label: "gk",
    worn: {
      top: { id: "a", shape: "jerseyLong", main: "#FF6A1A", accent: "#15161A" },
      bottom: { id: "b", shape: "pants", main: "#15161A", accent: "#FF6A1A" },
      shoes: { id: "d", shape: "cleats", main: "#D9FF1E", accent: "#15161A" },
      hands: { id: "i", shape: "gkgloves", main: "#D9FF1E", accent: "#15161A" },
      outer: undefined,
    },
  },
  { g: "mujer", label: "body", worn: {} },
  {
    g: "mujer", label: "hockey",
    worn: {
      top: { id: "a", shape: "tee", main: "#7FB2E5", accent: "#F3F3F1" },
      bottom: { id: "b", shape: "skirt", main: "#1A2445", accent: "#7FB2E5" },
      socks: { id: "c", shape: "high", main: "#1A2445", accent: "#7FB2E5" },
      shoes: { id: "d", shape: "sneaker", main: "#F3F3F1", accent: "#FF2D87" },
      head: { id: "h", shape: "headband", main: "#F3F3F1", accent: "#FF2D87" },
      gear: { id: "f", shape: "hockeyStick", main: "#F3F3F1", accent: "#FF2D87" },
    },
  },
  {
    g: "mujer", label: "tenis",
    worn: {
      top: { id: "a", shape: "tank", main: "#F3F3F1", accent: "#19E3FF" },
      bottom: { id: "b", shape: "skirt", main: "#F3F3F1", accent: "#19E3FF" },
      socks: { id: "c", shape: "ankle", main: "#F3F3F1", accent: "#19E3FF" },
      shoes: { id: "d", shape: "sneaker", main: "#F3F3F1", accent: "#2449C9" },
      head: { id: "h", shape: "visor", main: "#F3F3F1", accent: "#2449C9" },
      hands: { id: "i", shape: "wristband", main: "#F3F3F1", accent: "#2449C9" },
      gear: { id: "f", shape: "tennisRacket", main: "#15161A", accent: "#D9FF1E" },
    },
  },
  {
    g: "mujer", label: "voley",
    worn: {
      top: { id: "a", shape: "bra", main: "#E5258A", accent: "#15161A" },
      bottom: { id: "b", shape: "bikeshorts", main: "#15161A", accent: "#E5258A" },
      socks: { id: "c", shape: "crew", main: "#F3F3F1", accent: "#E5258A" },
      shoes: { id: "d", shape: "sneaker", main: "#F3F3F1", accent: "#E5258A" },
      protect: { id: "e", shape: "kneepads", main: "#15161A", accent: "#D9FF1E" },
      gear: { id: "f", shape: "volleyball", main: "#FFD31A", accent: "#2449C9" },
    },
  },
  {
    g: "mujer", label: "winter",
    worn: {
      outer: { id: "a", shape: "puffer", main: "#6B1D33", accent: "#F3F3F1" },
      top: { id: "t", shape: "longsleeve", main: "#F3F3F1", accent: "#15161A" },
      bottom: { id: "b", shape: "leggings", main: "#15161A", accent: "#6B1D33" },
      shoes: { id: "d", shape: "sneaker", main: "#ECE4D2", accent: "#6B1D33" },
      head: { id: "h", shape: "cap", main: "#ECE4D2", accent: "#6B1D33" },
    },
  },
  {
    g: "hombre", label: "jacket",
    worn: {
      outer: { id: "a", shape: "windbreaker", main: "#2449C9", accent: "#D9FF1E" },
      top: { id: "t", shape: "polo", main: "#F3F3F1", accent: "#15161A" },
      bottom: { id: "b", shape: "pants", main: "#5E6440", accent: "#15161A" },
      shoes: { id: "d", shape: "slides", main: "#15161A", accent: "#F3F3F1" },
      head: { id: "h", shape: "bucket", main: "#C8B48E", accent: "#15161A" },
      hands: { id: "i", shape: "wristband", main: "#D9FF1E", accent: "#15161A" },
      gear: { id: "f", shape: "basketball", main: "#FF6A1A", accent: "#15161A" },
    },
  },
  {
    g: "mujer", label: "track",
    worn: {
      outer: { id: "a", shape: "jacket", main: "#15161A", accent: "#FF2D87" },
      top: { id: "t", shape: "crop", main: "#FF2D87", accent: "#15161A" },
      bottom: { id: "b", shape: "pants", main: "#15161A", accent: "#FF2D87" },
      shoes: { id: "d", shape: "hightop", main: "#15161A", accent: "#FF2D87" },
      head: { id: "h", shape: "beanie", main: "#F39BC0", accent: "#15161A" },
    },
  },
];

const attr = (p: Paint) =>
  [
    `d="${p.d}"`,
    `fill="${p.fill ?? "none"}"`,
    p.stroke ? `stroke="${p.stroke}"` : "",
    p.sw ? `stroke-width="${p.sw}"` : "",
    p.op !== undefined ? `opacity="${p.op}"` : "",
    p.dash ? `stroke-dasharray="${p.dash}"` : "",
    p.cap ? `stroke-linecap="${p.cap}" stroke-linejoin="round"` : "",
    p.under ? `paint-order="stroke" stroke-linejoin="round"` : "",
  ].join(" ");

function svgFor(set: (typeof SETS)[number]) {
  const groups = compose(set.g, set.worn);
  const z = zones(set.g);
  const pins = Object.values(z).map((zz) => `<circle cx="${zz.pin.x}" cy="${zz.pin.y}" r="9" fill="#D4FF1E" stroke="#040a1c" stroke-width="3"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW.w} ${VIEW.h}" width="${VIEW.w}" height="${VIEW.h}">
  <defs><linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b3bccd"/><stop offset="1" stop-color="#8b95ab"/></linearGradient></defs>
  <rect width="100%" height="100%" fill="#071331"/>
  <ellipse cx="200" cy="975" rx="150" ry="18" fill="#19e3ff" opacity=".15"/>
  ${groups.map((g) => `<g>${g.paints.map((p) => `<path ${attr(p)}/>`).join("")}</g>`).join("\n")}
  ${set.label === "body" ? pins : ""}
  <text x="12" y="30" fill="#D4FF1E" font-family="Arial" font-size="24">${set.g} ${set.label}</text>
</svg>`;
}

const W = 400, H = 1000, cols = 6;
const tiles = await Promise.all(
  SETS.map(async (s, i) => ({
    input: await sharp(Buffer.from(svgFor(s))).png().toBuffer(),
    left: (i % cols) * W,
    top: Math.floor(i / cols) * H,
  })),
);
await sharp({ create: { width: cols * W, height: Math.ceil(SETS.length / cols) * H, channels: 3, background: "#000" } })
  .composite(tiles)
  .png()
  .toFile(out);
console.log("wrote", out);
