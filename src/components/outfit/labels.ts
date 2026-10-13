import type { Slot } from "@/lib/types";

export const SLOT_LABEL: Record<Slot, string> = {
  head: "Gorras y vinchas",
  top: "Remeras y tops",
  outer: "Buzos y camperas",
  bottom: "Shorts y pantalones",
  socks: "Medias",
  shoes: "Calzado",
  hands: "Guantes y muñequeras",
  protect: "Canilleras y rodilleras",
  gear: "Pelotas, palos y raquetas",
};

export const SLOT_SHORT: Record<Slot, string> = {
  head: "Cabeza",
  top: "Arriba",
  outer: "Abrigo",
  bottom: "Abajo",
  socks: "Medias",
  shoes: "Calzado",
  hands: "Manos",
  protect: "Protección",
  gear: "Equipo",
};

export const COLOR_FILTERS: { id: string; hex: string; label: string }[] = [
  { id: "negro", hex: "#15161A", label: "Negro" },
  { id: "blanco", hex: "#F3F3F1", label: "Blanco" },
  { id: "gris", hex: "#8E9299", label: "Gris" },
  { id: "azul", hex: "#2449C9", label: "Azul" },
  { id: "celeste", hex: "#7FB2E5", label: "Celeste" },
  { id: "rojo", hex: "#D3202E", label: "Rojo" },
  { id: "rosa", hex: "#E5258A", label: "Rosa" },
  { id: "verde", hex: "#1F9A4E", label: "Verde" },
  { id: "fluor", hex: "#D9FF1E", label: "Flúor" },
  { id: "naranja", hex: "#FF6A1A", label: "Naranja" },
  { id: "violeta", hex: "#6E3FC4", label: "Violeta" },
  { id: "beige", hex: "#C8B48E", label: "Beige" },
];
