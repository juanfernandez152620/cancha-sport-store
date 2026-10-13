import type { Card, Gender, Shape, Slot } from "@/lib/types";

export type QuizSport = "futbol" | "tenis" | "voley" | "hockey";
export type Use = "partido" | "entreno" | "frio";
export type Answers = { sport: QuizSport; position: string; palette: string; use: Use };

export const POSITIONS: Record<QuizSport, { id: string; label: string; hint: string }[]> = {
  futbol: [
    { id: "arquero", label: "Arquero/a", hint: "Guantes, buzo de manga larga y pantalón si hace frío" },
    { id: "defensor", label: "Defensor/a", hint: "Canilleras firmes y medias altas" },
    { id: "medio", label: "Mediocampista", hint: "Liviano para correr los 90 minutos" },
    { id: "delantero", label: "Delantero/a", hint: "Botines que se hacen notar" },
  ],
  tenis: [
    { id: "fondo", label: "Fondo de cancha", hint: "Raqueta con potencia y zapatillas de polvo" },
    { id: "red", label: "Saque y red", hint: "Raqueta de control y ropa liviana" },
    { id: "dobles", label: "Dobles", hint: "Visera o vincha y muñequeras" },
    { id: "recreativo", label: "Recreativo", hint: "Raqueta liviana y cómoda" },
  ],
  voley: [
    { id: "armador", label: "Armador/a", hint: "Muñequeras y zapatillas indoor" },
    { id: "libero", label: "Líbero", hint: "Camiseta de otro color y rodilleras" },
    { id: "punta", label: "Punta / Opuesto", hint: "Amortiguación para saltar" },
    { id: "central", label: "Central", hint: "Rodilleras y medias altas" },
  ],
  hockey: [
    { id: "delantero", label: "Delantera/o", hint: "Palo de carbono para pegarle fuerte" },
    { id: "volante", label: "Volante", hint: "Palo equilibrado y canilleras livianas" },
    { id: "defensa", label: "Defensa", hint: "Canilleras con tobillera y guante" },
    { id: "arquero", label: "Arquera/o", hint: "Guantes y toda la protección" },
  ],
};

export const PALETTES: { id: string; label: string; colors: string[]; families: string[] }[] = [
  { id: "negro", label: "Negro total", colors: ["#15161A", "#3B3F46"], families: ["negro", "gris"] },
  { id: "blanco", label: "Blanco limpio", colors: ["#F3F3F1", "#C9CCD1"], families: ["blanco", "gris", "beige"] },
  { id: "azul", label: "Azul y celeste", colors: ["#2449C9", "#7FB2E5"], families: ["azul", "celeste"] },
  { id: "neon", label: "Flúor", colors: ["#D9FF1E", "#1F9A4E"], families: ["fluor", "verde", "amarillo"] },
  { id: "rojo", label: "Rojo y naranja", colors: ["#D3202E", "#FF6A1A"], families: ["rojo", "naranja"] },
  { id: "rosa", label: "Rosa y violeta", colors: ["#E5258A", "#6E3FC4"], families: ["rosa", "violeta"] },
];

export const USES: { id: Use; label: string; hint: string }[] = [
  { id: "partido", label: "Para el partido", hint: "Lo mejor para competir" },
  { id: "entreno", label: "Para entrenar", hint: "Cómodo y resistente" },
  { id: "frio", label: "Para días fríos", hint: "Suma abrigo y manga larga" },
];

type Recipe = Partial<Record<Slot, Shape[]>>;

function recipe(a: Answers, g: Gender): Recipe {
  const her = g === "mujer";
  const cold = a.use === "frio";
  const r: Recipe = (() => {
    switch (a.sport) {
      case "futbol":
        return {
          top: cold ? ["jerseyLong", "longsleeve", "jersey"] : ["jersey", "tee"],
          bottom: ["shorts"],
          socks: ["high", "crew"],
          shoes: ["cleats"],
          protect: ["shinguards"],
          gear: ["football"],
        };
      case "tenis":
        return {
          top: her ? ["tank", "tee", "polo"] : ["polo", "tee", "tank"],
          bottom: her ? ["skirt", "shorts"] : ["shorts"],
          socks: ["ankle", "crew"],
          shoes: ["sneaker"],
          head: a.position === "dobles" ? ["visor", "cap", "headband"] : ["headband", "cap", "visor"],
          hands: ["wristband"],
          gear: ["tennisRacket"],
        };
      case "voley":
        return {
          top: her ? ["tank", "tee", "bra"] : ["tank", "tee"],
          bottom: her ? ["bikeshorts", "shorts"] : ["shorts"],
          socks: a.position === "central" ? ["high", "crew"] : ["crew", "ankle"],
          shoes: ["sneaker"],
          protect: ["kneepads"],
          hands: a.position === "armador" ? ["wristband"] : [],
          gear: ["volleyball"],
        };
      case "hockey":
        return {
          top: ["tee", "polo", "jersey"],
          bottom: her ? ["skirt", "shorts"] : ["shorts"],
          socks: ["high", "crew"],
          shoes: ["sneaker", "cleats"],
          protect: ["shinguards"],
          hands: ["gloves"],
          gear: ["hockeyStick"],
        };
    }
  })();
  if (a.sport === "futbol" && a.position === "arquero") {
    r.hands = ["gkgloves"];
    r.top = ["jerseyLong", "longsleeve", "jersey"];
    if (cold) r.bottom = ["pants", "joggers", "shorts"];
  }
  if (cold) r.outer = ["jacket", "windbreaker", "hoodie", "halfzip", "crew"];
  return r;
}

const PRICE_TIER: Record<string, "high" | "mid" | "low"> = {
  delantero: "high", defensa: "high", volante: "mid", arquero: "mid",
  fondo: "mid", red: "high", dobles: "mid", recreativo: "low",
  punta: "high",
};

/** Store-line extras that make a combo complete even though they are not drawn (the mouthguard). */
const EXTRAS: Record<QuizSport, string[]> = { hockey: ["cl-hk-09"], futbol: [], tenis: ["cl-tn-04"], voley: [] };

export type Combo = { id: string; title: string; note: string; items: Card[]; extras: Card[] };

export function buildCombos(all: Card[], g: Gender, a: Answers): Combo[] {
  const r = recipe(a, g);
  const families = PALETTES.find((p) => p.id === a.palette)?.families ?? [];
  const libero = a.sport === "voley" && a.position === "libero";
  const tier = PRICE_TIER[a.position] ?? "mid";

  const ranked = (slot: Slot) => {
    const shapes = r[slot] ?? [];
    if (!shapes.length) return [];
    return all
      .filter((c) => c.gs && c.gs[0] === slot && shapes.includes(c.gs[1]))
      .map((c) => {
        let s = 0;
        s += (shapes.length - shapes.indexOf(c.gs![1])) * 3;
        if (c.sp.includes(a.sport)) s += 8;
        else if (c.sp.includes("training") || c.sp.includes("running")) s += a.use === "entreno" ? 4 : 2;
        // the libero wears a contrasting colour on top
        const wantsPalette = libero && slot === "top" ? !families.includes(c.fm) : families.includes(c.fm);
        if (wantsPalette) s += 6;
        if (c.f.includes("n")) s += 1;
        if (c.f.includes("b")) s += 1;
        if (slot === "gear" || slot === "shoes") {
          const rel = c.p / 100000;
          s += tier === "high" ? rel : tier === "low" ? -rel : 0;
        }
        return { c, s };
      })
      .sort((x, y) => y.s - x.s)
      .map((x) => x.c);
  };

  const slots: Slot[] = ["top", "outer", "bottom", "socks", "shoes", "protect", "head", "hands", "gear"];
  const lists = Object.fromEntries(slots.map((s) => [s, ranked(s)])) as Record<Slot, Card[]>;
  const extras = EXTRAS[a.sport].map((id) => all.find((c) => c.id === id)).filter(Boolean) as Card[];

  const pick = (variant: 0 | 1 | 2) =>
    slots
      .map((s) => {
        const l = lists[s];
        if (!l.length) return null;
        if (variant === 0) return l[0];
        if (variant === 1) return l[Math.min(1, l.length - 1)];
        // premium: the priciest of the five best matches
        return [...l.slice(0, 5)].sort((x, y) => y.p - x.p)[0];
      })
      .filter(Boolean) as Card[];

  const combos: Combo[] = [
    { id: "titular", title: "Combo Titular", note: "El que mejor matchea con lo que elegiste", items: pick(0), extras },
    { id: "alternativo", title: "Combo Alternativo", note: "Otra vuelta, mismos colores", items: pick(1), extras },
    { id: "pro", title: "Combo Pro", note: "Lo más alto de la línea", items: pick(2), extras },
  ];
  // drop duplicates when a sport has few options
  const seen = new Set<string>();
  return combos.filter((c) => {
    const key = c.items.map((i) => i.id).join(",");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** First outfit shown on the mannequin so the section never opens on a bare body. */
export function starterOutfit(all: Card[], g: Gender) {
  return buildCombos(all, g, { sport: "futbol", position: "medio", palette: g === "hombre" ? "azul" : "rosa", use: "partido" })[0]?.items ?? [];
}
