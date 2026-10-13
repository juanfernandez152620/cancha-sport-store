export type Gender = "hombre" | "mujer";
export type ProductGender = Gender | "unisex";
export type Dept = "ropa" | "calzado" | "accesorios";
export type SportSlug = "futbol" | "tenis" | "voley" | "hockey" | "running" | "training" | "basquet";

export type Slot = "head" | "top" | "outer" | "bottom" | "socks" | "shoes" | "hands" | "protect" | "gear";
export type Shape =
  | "cap" | "visor" | "beanie" | "bucket" | "headband"
  | "tee" | "longsleeve" | "crop" | "jersey" | "jerseyLong" | "tank" | "polo" | "bra"
  | "hoodie" | "halfzip" | "crew" | "jacket" | "windbreaker" | "puffer" | "vest"
  | "shorts" | "bikeshorts" | "pants" | "joggers" | "leggings" | "skirt"
  | "ankle" | "high"
  | "sneaker" | "hightop" | "cleats" | "slides"
  | "gloves" | "gkgloves" | "wristband"
  | "shinguards" | "kneepads"
  | "football" | "volleyball" | "basketball" | "hockeyStick" | "hockeyBall" | "tennisRacket" | "tennisBall";

/** Compact product shape shared by listings, rails, the outfit builder and the product sheet. */
export type Card = {
  id: string;
  /** slug */
  s: string;
  /** name */
  n: string;
  /** subtitle, e.g. "Remera de Entrenamiento para Hombre" */
  t: string;
  g: ProductGender;
  d: Dept;
  /** subcategory slug */
  c: string;
  /** product type label */
  ty: string;
  sp: string[];
  /** price and list price, ARS */
  p: number;
  lp: number;
  /** images: "vtexId/file.webp" or a local "/gear/x.svg" */
  im: string[];
  /** colour name, primary and accent hex, colour family */
  cn: string;
  hx: string;
  hx2: string;
  fm: string;
  /** size labels and availability bits ("1101") */
  sz: string[];
  sa: string;
  /** flags: n = new, s = sale, b = best seller, x = store line */
  f: string;
  /** how the item is drawn on the mannequin */
  gs: [Slot, Shape] | null;
};

export type Product = Card & { ref: string; desc: string; src: string };

export type SearchItem = Pick<Card, "s" | "n" | "t" | "g" | "ty" | "p" | "lp" | "cn"> & { im: string };
