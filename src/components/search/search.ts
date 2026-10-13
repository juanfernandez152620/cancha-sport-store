import type { SearchItem } from "@/lib/types";

export const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

// everyday words people type vs. how the catalogue names things (keys are the stems built below)
const SYNONYMS: Record<string, string[]> = {
  zapatilla: ["zapatilla", "calzado"],
  arquero: ["arquero", "guantes de futbol", "grip"],
  remera: ["remera", "camiseta"],
  campera: ["campera", "chaleco"],
  buzo: ["buzo", "hoodie"],
  pantalon: ["pantalon", "jogger"],
  ojota: ["ojota", "sandalia"],
  bocha: ["bocha"],
  hockey: ["hockey"],
};

/** Every word must appear somewhere in name, subtitle, type, gender or colour. Name hits rank first. */
export function searchItems(items: SearchItem[], query: string) {
  const words = fold(query).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return [];
  const scored: { it: SearchItem; s: number }[] = [];
  for (const it of items) {
    const name = fold(it.n);
    const hay = `${name} ${fold(it.t)} ${fold(it.ty)} ${it.g} ${fold(it.cn)}`;
    let s = 0;
    let ok = true;
    for (const w of words) {
      const stem = w.length > 4 ? w.replace(/(es|s)$/, "") : w;
      const alts = SYNONYMS[stem] ?? [stem];
      const hit = alts.some((a) => hay.includes(a));
      if (!hit) {
        ok = false;
        break;
      }
      s += alts.some((a) => name.includes(a)) ? 3 : 1;
    }
    if (ok) scored.push({ it, s });
  }
  return scored.sort((a, b) => b.s - a.s).map((x) => x.it);
}
