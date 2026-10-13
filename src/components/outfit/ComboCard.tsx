"use client";

import { isCompleteOutfit, useCart, useUI } from "@/lib/stores";
import { price } from "@/lib/format";
import { SITE } from "@/lib/site";
import { ProductImage } from "@/components/product/ProductImage";
import { IconBag } from "@/components/ui/icons";
import type { Combo } from "./quiz";

export function ComboCard({ combo, onTry, onAdded }: { combo: Combo; onTry: () => void; onAdded?: () => void }) {
  const addBundle = useCart((s) => s.addBundle);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const showToast = useUI((s) => s.showToast);
  const all = [...combo.items, ...combo.extras];
  const sub = all.reduce((n, x) => n + x.p, 0);
  const complete = isCompleteOutfit(combo.items.map((x) => x.gs?.[0]));
  const total = complete ? sub * (1 - SITE.outfitDiscount) : sub;

  return (
    <article className="flex min-w-0 flex-col rounded-3xl bg-deep p-4 ring-1 ring-white/10">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="display text-2xl">{combo.title}</h3>
          <p className="text-sm text-mist">{combo.note}</p>
        </div>
        {complete && <span className="shrink-0 rounded-full bg-volt px-2.5 py-1 text-xs font-black text-ink">-10%</span>}
      </header>
      <ul className="no-scrollbar -mx-1 mb-4 flex gap-2 overflow-x-auto px-1">
        {all.map((x) => (
          <li key={x.id} className="w-[84px] shrink-0">
            <div className="photo-tile overflow-hidden rounded-xl">
              <ProductImage path={x.im[0]} alt={x.n} size={180} className="p-1" />
            </div>
            <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-fog">{x.n}</p>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <p>
          {complete && <span className="mr-2 text-sm text-mist line-through">{price(sub)}</span>}
          <span className="text-xl font-black">{price(total)}</span>
        </p>
        <div className="flex w-full gap-2">
          <button className="btn btn-ghost flex-1 !min-h-11 !px-3 !text-xs" onClick={onTry}>
            Probar en el maniquí
          </button>
          <button
            className="btn btn-volt flex-1 !min-h-11 !px-3 !text-xs"
            onClick={() => {
              addBundle(all.map((x) => ({ card: x, size: null })));
              showToast("Combo agregado: elegí los talles en el carrito");
              onAdded?.();
              setCartOpen(true);
            }}
          >
            <IconBag size={16} /> Llevar combo
          </button>
        </div>
      </div>
    </article>
  );
}
