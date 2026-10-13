import type { Dept, Gender, SportSlug } from "./types";

export const GENDERS: Record<Gender, { label: string; plural: string; accent: string }> = {
  hombre: { label: "Hombre", plural: "Para él", accent: "var(--color-cyan)" },
  mujer: { label: "Mujer", plural: "Para ella", accent: "var(--color-magenta)" },
};

export const DEPTS: Record<Dept, string> = {
  ropa: "Ropa",
  calzado: "Calzado",
  accesorios: "Accesorios",
};

type Sub = { slug: string; label: string; only?: Gender };

/** Subcategories follow nike.com.ar's own menu, simplified. */
export const SUBS: Record<Dept, Sub[]> = {
  ropa: [
    { slug: "remeras", label: "Remeras y musculosas" },
    { slug: "camisetas", label: "Camisetas" },
    { slug: "tops-deportivos", label: "Tops deportivos", only: "mujer" },
    { slug: "buzos", label: "Buzos" },
    { slug: "camperas", label: "Camperas y chalecos" },
    { slug: "shorts", label: "Shorts" },
    { slug: "polleras-vestidos", label: "Polleras", only: "mujer" },
    { slug: "pantalones", label: "Pantalones" },
    { slug: "calzas", label: "Calzas" },
    { slug: "medias", label: "Medias" },
    { slug: "gorras", label: "Gorras" },
    { slug: "trajes-de-bano", label: "Trajes de baño" },
  ],
  calzado: [
    { slug: "urbanas", label: "Urbanas" },
    { slug: "running", label: "Running" },
    { slug: "botines", label: "Botines" },
    { slug: "deportivas", label: "Deportivas y training" },
    { slug: "basquet", label: "Básquet" },
    { slug: "sandalias", label: "Ojotas y sandalias" },
  ],
  accesorios: [
    { slug: "pelotas", label: "Pelotas y bochas" },
    { slug: "palos-de-hockey", label: "Palos de hockey" },
    { slug: "raquetas", label: "Raquetas" },
    { slug: "guantes", label: "Guantes" },
    { slug: "canilleras", label: "Canilleras" },
    { slug: "proteccion", label: "Rodilleras y protección" },
    { slug: "bolsos-mochilas", label: "Bolsos y mochilas" },
    { slug: "botellas", label: "Botellas" },
    { slug: "vinchas-munequeras", label: "Vinchas y muñequeras" },
    { slug: "entrenamiento", label: "Entrenamiento" },
    { slug: "natacion", label: "Natación" },
    { slug: "otros", label: "Otros" },
  ],
};

export function subLabel(dept: Dept, slug: string) {
  return SUBS[dept].find((s) => s.slug === slug)?.label ?? slug;
}

export const MAIN_SPORTS = ["futbol", "tenis", "voley", "hockey"] as const;

export const SPORTS: Record<SportSlug, { label: string; color: string; tagline: string }> = {
  futbol: { label: "Fútbol", color: "#D4FF1E", tagline: "Botines, camisetas, pelotas y guantes de arquero" },
  tenis: { label: "Tenis", color: "#19E3FF", tagline: "Raquetas, pelotas, vinchas y zapatillas de cancha" },
  voley: { label: "Vóley", color: "#FF2D87", tagline: "Pelotas, rodilleras y zapatillas indoor" },
  hockey: { label: "Hockey", color: "#FF8A1E", tagline: "Palos, bochas, canilleras, bucales y paleros" },
  running: { label: "Running", color: "#9B8CFF", tagline: "Zapatillas, ropa liviana y botellas" },
  training: { label: "Training", color: "#2DE0A0", tagline: "Guantes, mats, sogas y ropa de gym" },
  basquet: { label: "Básquet", color: "#FF6A1A", tagline: "Pelotas, zapatillas y medias de básquet" },
};

export const isGender = (g: string): g is Gender => g === "hombre" || g === "mujer";
export const isDept = (d: string): d is Dept => d === "ropa" || d === "calzado" || d === "accesorios";
export const isSport = (s: string): s is SportSlug => s in SPORTS;
