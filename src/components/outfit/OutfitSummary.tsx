"use client";

import { useState } from "react";
import type { Card, Slot } from "@/lib/types";
import { isCompleteOutfit, useCart, useOutfit, useUI, type Outfit } from "@/lib/stores";
import { price } from "@/lib/format";
import { SITE } from "@/lib/site";
import { ProductImage } from "@/components/product/ProductImage";
import { IconBag, IconCheck, IconClose } from "@/components/ui/icons";
import { SLOT_ORDER } from "./figure";
import { SLOT_SHORT } from "./labels";

export function outfitTotals(outfit: Outfit) {
  const items = SLOT_ORDER.map((s) => outfit[s]).filter(Boolean) as Card[];
  const subtotal = items.reduce((n, c) => n + c.p, 0);
  const complete = isCompleteOutfit(items.map((c) => c.gs?.[0]));
  const discount = complete ? Math.round(subtotal * SITE.outfitDiscount) : 0;
  return { items, subtotal, complete, discount, total: subtotal - discount };
}

const NEEDS: { label: string; ok: (slots: Slot[]) => boolean }[] = [
  { label: "Arriba", ok: (s) => s.includes("top") || s.includes("outer") },
  { label: "Abajo", ok: (s) => s.includes("bottom") },
  { label: "Calzado", ok: (s) => s.includes("shoes") },
];

/** Progress toward the complete-outfit discount, shown in the summary and the compact bar. */
export function Completeness({ outfit, dense = false }: { outfit: Outfit; dense?: boolean }) {
  const slots = (Object.keys(outfit) as Slot[]).filter((s) => outfit[s]);
  return (
    <ul className={`flex flex-wrap gap-1.5 ${dense ? "text-[11px]" : "text-xs"}`} aria-label="Qué falta para el descuento">
      {NEEDS.map((n) => {
        const ok = n.ok(slots);
        return (
          <li key={n.label} className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-bold ${ok ? "bg-volt/15 text-volt" : "bg-white/6 text-mist"}`}>
            {ok ? <IconCheck size={12} strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-mist/60" />}
            {n.label}
          </li>
        );
      })}
    </ul>
  );
}

export function OutfitSummary({ onDone }: { onDone?: () => void }) {
  const gender = useOutfit((s) => s.gender);
  const outfit = useOutfit((s) => s.outfits[s.gender]);
  const sizes = useOutfit((s) => s.sizes);
  const setSize = useOutfit((s) => s.setSize);
  const takeOff = useOutfit((s) => s.takeOff);
  const addBundle = useCart((s) => s.addBundle);
  const { setCartOpen, showToast, openSheet } = useUI();
  const [tried, setTried] = useState(false);

  const { items, subtotal, complete, discount, total } = outfitTotals(outfit);
  const needsSize = (c: Card) => c.sz.length > 1 && !sizes[c.id];
  const missing = items.filter(needsSize);

  const addAll = () => {
    if (missing.length) {
      setTried(true);
      return;
    }
    addBundle(items.map((c) => ({ card: c, size: sizes[c.id] ?? c.sz[0] ?? null })));
    showToast(complete ? "Outfit agregado con 10% OFF" : "Outfit agregado al carrito");
    onDone?.();
    setCartOpen(true);
  };

  if (!items.length) {
    return (
      <div className="rounded-2xl bg-white/5 p-5 text-sm text-fog">
        Todavía no elegiste nada. Tocá el maniquí o una prenda para empezar.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="eyebrow text-mist">Tu outfit · {gender === "hombre" ? "Hombre" : "Mujer"}</p>
        <Completeness outfit={outfit} />
      </div>

      <ul className="flex flex-col divide-y divide-white/8">
        {items.map((c) => {
          const slot = c.gs![0];
          const bad = tried && needsSize(c);
          return (
            <li key={c.id} className="flex items-center gap-3 py-3">
              <button onClick={() => openSheet(c)} className="photo-tile size-16 shrink-0 overflow-hidden rounded-xl" aria-label={`Ver ${c.n}`}>
                <ProductImage path={c.im[0]} alt="" size={160} className="p-1" />
              </button>
              <div className="min-w-0 flex-1">
                <p className="eyebrow !text-[10px] text-volt">{SLOT_SHORT[slot]}</p>
                <p className="truncate text-sm font-semibold text-chalk">{c.n}</p>
                <div className="mt-1 flex items-center gap-2">
                  {c.sz.length > 1 ? (
                    <select
                      value={sizes[c.id] ?? ""}
                      onChange={(e) => setSize(c.id, e.target.value)}
                      aria-label={`Talle de ${c.n}`}
                      aria-invalid={bad}
                      className={`h-8 rounded-lg bg-deep px-2 text-xs font-bold text-chalk ring-1 ${bad ? "ring-magenta" : "ring-white/15"}`}
                    >
                      <option value="" disabled>
                        Talle
                      </option>
                      {c.sz.map((s, i) => (
                        <option key={s} value={s} disabled={c.sa[i] === "0"}>
                          {s}
                          {c.sa[i] === "0" ? " (agotado)" : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-mist">Talle único</span>
                  )}
                  <span className="text-sm font-extrabold text-chalk">{price(c.p)}</span>
                </div>
              </div>
              <button onClick={() => takeOff(slot)} className="grid size-9 shrink-0 place-items-center rounded-full text-mist hover:bg-white/10 hover:text-chalk" aria-label={`Quitar ${c.n}`}>
                <IconClose size={18} />
              </button>
            </li>
          );
        })}
      </ul>

      <dl className="flex flex-col gap-1.5 rounded-2xl bg-white/5 p-4 text-sm">
        <div className="flex justify-between text-fog">
          <dt>Subtotal</dt>
          <dd>{price(subtotal)}</dd>
        </div>
        <div className={`flex justify-between ${complete ? "text-volt" : "text-mist"}`}>
          <dt>Outfit completo -10%</dt>
          <dd>{complete ? `-${price(discount)}` : "Sumá arriba, abajo y calzado"}</dd>
        </div>
        <div className="mt-1 flex items-baseline justify-between border-t border-white/10 pt-2">
          <dt className="font-bold text-chalk">Total</dt>
          <dd className="text-2xl font-black text-chalk">{price(total)}</dd>
        </div>
        <p className="text-xs text-mist">
          o {SITE.installments} cuotas sin interés de {price(total / SITE.installments)}
        </p>
      </dl>

      {tried && missing.length > 0 && (
        <p role="alert" className="text-sm font-semibold text-magenta">
          Elegí el talle de {missing.length === 1 ? missing[0].n : `${missing.length} prendas`} para seguir.
        </p>
      )}
      <button onClick={addAll} className="btn btn-volt w-full">
        <IconBag size={20} /> Agregar outfit al carrito
      </button>
    </div>
  );
}
