"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Card, Gender, Slot } from "./types";
import { SITE } from "./site";

// ---------------------------------------------------------------- cart

export type CartLine = {
  key: string;
  id: string;
  s: string;
  n: string;
  t: string;
  im: string;
  cn: string;
  p: number;
  lp: number;
  sz: string[];
  sa: string;
  size: string | null;
  qty: number;
  /** outfit bundle id; bundle lines share the outfit discount */
  bundle: string | null;
  slot: Slot | null;
};

const lineKey = (id: string, size: string | null, bundle: string | null) => `${id}:${size ?? "-"}:${bundle ?? ""}`;

function toLine(card: Card, size: string | null, qty: number, bundle: string | null): CartLine {
  return {
    key: lineKey(card.id, size, bundle),
    id: card.id, s: card.s, n: card.n, t: card.t, im: card.im[0], cn: card.cn, p: card.p, lp: card.lp,
    sz: card.sz, sa: card.sa, size, qty, bundle, slot: card.gs?.[0] ?? null,
  };
}

/** An outfit counts as complete with something for the torso, something for the legs and shoes. */
export function isCompleteOutfit(slots: (Slot | null | undefined)[]) {
  return (slots.includes("top") || slots.includes("outer")) && slots.includes("bottom") && slots.includes("shoes");
}

export function cartTotals(lines: CartLine[]) {
  let subtotal = 0;
  let discount = 0;
  const bundles = new Map<string, CartLine[]>();
  for (const l of lines) {
    subtotal += l.p * l.qty;
    if (l.bundle) {
      if (!bundles.has(l.bundle)) bundles.set(l.bundle, []);
      bundles.get(l.bundle)!.push(l);
    }
  }
  for (const group of bundles.values()) {
    if (isCompleteOutfit(group.map((l) => l.slot))) {
      discount += group.reduce((sum, l) => sum + l.p * l.qty, 0) * SITE.outfitDiscount;
    }
  }
  const count = lines.reduce((n, l) => n + l.qty, 0);
  return { subtotal, discount: Math.round(discount), total: Math.round(subtotal - discount), count };
}

type CartState = {
  lines: CartLine[];
  add: (card: Card, size: string | null, qty?: number) => void;
  addBundle: (items: { card: Card; size: string | null }[]) => void;
  setQty: (key: string, qty: number) => void;
  setSize: (key: string, size: string) => void;
  remove: (key: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (card, size, qty = 1) =>
        set((st) => {
          const key = lineKey(card.id, size, null);
          const found = st.lines.find((l) => l.key === key);
          if (found) return { lines: st.lines.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l)) };
          return { lines: [...st.lines, toLine(card, size, qty, null)] };
        }),
      addBundle: (items) =>
        set((st) => {
          const bundle = `o${Date.now().toString(36)}`;
          return { lines: [...st.lines, ...items.map((i) => toLine(i.card, i.size, 1, bundle))] };
        }),
      setQty: (key, qty) =>
        set((st) => ({
          lines: qty <= 0 ? st.lines.filter((l) => l.key !== key) : st.lines.map((l) => (l.key === key ? { ...l, qty } : l)),
        })),
      setSize: (key, size) =>
        set((st) => {
          const line = st.lines.find((l) => l.key === key);
          if (!line) return st;
          const next = lineKey(line.id, size, line.bundle);
          const twin = st.lines.find((l) => l.key === next && l.key !== key);
          // picking a size that is already in the cart merges both lines
          if (twin) return { lines: st.lines.filter((l) => l.key !== key).map((l) => (l === twin ? { ...l, qty: l.qty + line.qty } : l)) };
          return { lines: st.lines.map((l) => (l.key === key ? { ...l, size, key: next } : l)) };
        }),
      remove: (key) => set((st) => ({ lines: st.lines.filter((l) => l.key !== key) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "cancha-cart", storage: createJSONStorage(() => localStorage), skipHydration: true, version: 1 },
  ),
);

// ---------------------------------------------------------------- overlays

type UIState = {
  sheet: Card | null;
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  toast: { id: number; text: string; cart: boolean } | null;
  openSheet: (card: Card) => void;
  closeSheet: () => void;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  showToast: (text: string, cart?: boolean) => void;
};

export const useUI = create<UIState>()((set) => ({
  sheet: null,
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  toast: null,
  openSheet: (card) => set({ sheet: card }),
  closeSheet: () => set({ sheet: null }),
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  showToast: (text, cart = false) => set({ toast: { id: Date.now(), text, cart } }),
}));

// ---------------------------------------------------------------- outfit

export type Outfit = Partial<Record<Slot, Card>>;

type OutfitState = {
  gender: Gender;
  outfits: Record<Gender, Outfit>;
  sizes: Record<string, string>;
  /** card id that was just put on, used to flash it on the mannequin */
  lastWorn: string | null;
  setGender: (g: Gender) => void;
  wear: (card: Card) => void;
  takeOff: (slot: Slot) => void;
  apply: (gender: Gender, cards: Card[]) => void;
  clear: () => void;
  setSize: (id: string, size: string) => void;
};

export const useOutfit = create<OutfitState>()(
  persist(
    (set) => ({
      gender: "hombre",
      outfits: { hombre: {}, mujer: {} },
      sizes: {},
      lastWorn: null,
      setGender: (gender) => set({ gender }),
      wear: (card) =>
        set((st) => {
          if (!card.gs) return st;
          const slot = card.gs[0];
          const current = st.outfits[st.gender];
          const next: Outfit = { ...current };
          // tapping the item already worn takes it off
          if (current[slot]?.id === card.id) delete next[slot];
          else next[slot] = card;
          return { outfits: { ...st.outfits, [st.gender]: next }, lastWorn: card.id };
        }),
      takeOff: (slot) =>
        set((st) => {
          const next = { ...st.outfits[st.gender] };
          delete next[slot];
          return { outfits: { ...st.outfits, [st.gender]: next } };
        }),
      apply: (gender, cards) =>
        set((st) => {
          const next: Outfit = {};
          for (const c of cards) if (c.gs) next[c.gs[0]] = c;
          return { gender, outfits: { ...st.outfits, [gender]: next }, lastWorn: null };
        }),
      clear: () => set((st) => ({ outfits: { ...st.outfits, [st.gender]: {} } })),
      setSize: (id, size) => set((st) => ({ sizes: { ...st.sizes, [id]: size } })),
    }),
    {
      name: "cancha-outfit",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 1,
      partialize: (st) => ({ gender: st.gender, outfits: st.outfits, sizes: st.sizes }),
    },
  ),
);
