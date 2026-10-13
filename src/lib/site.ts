/** Store identity. Change these to the client's real data before going live. */
export const SITE = {
  name: "CANCHA",
  tagline: "Sport Store",
  description:
    "Ropa, calzado y equipamiento para fútbol, tenis, vóley y hockey. Armá tu outfit completo y llevate 10% OFF.",
  whatsapp: "5493810000000",
  instagram: "cancha.sportstore",
  city: "Tucumán, Argentina",
  installments: 6,
  freeShippingFrom: 199999,
  outfitDiscount: 0.1,
} as const;

export function whatsappLink(text: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}
