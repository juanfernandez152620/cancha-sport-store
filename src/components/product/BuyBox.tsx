"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Card } from "@/lib/types";
import { useCart, useOutfit, useUI } from "@/lib/stores";
import { price } from "@/lib/format";
import { SITE } from "@/lib/site";
import { IconBag, IconCard, IconShirt, IconSwap, IconTruck } from "@/components/ui/icons";
import { Price } from "./Price";

export function BuyBox({ c, onDone }: { c: Card; onDone?: () => void }) {
  const single = c.sz.length <= 1;
  const [size, setSize] = useState<string | null>(single ? (c.sz[0] ?? null) : null);
  const [nudge, setNudge] = useState(false);
  const add = useCart((s) => s.add);
  const showToast = useUI((s) => s.showToast);
  const router = useRouter();

  const buy = () => {
    if (!size && !single) {
      setNudge(true);
      return;
    }
    add(c, size);
    showToast(`${c.n} · ${size ?? "talle único"} agregado`, true);
    onDone?.();
  };

  const tryOn = () => {
    if (c.g === "hombre" || c.g === "mujer") useOutfit.getState().setGender(c.g);
    const st = useOutfit.getState();
    // wear() toggles, so only call it when the item is not on already
    if (c.gs && st.outfits[st.gender][c.gs[0]]?.id !== c.id) st.wear(c);
    const target = document.getElementById("armar-outfit");
    if (target) {
      onDone?.();
      setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    } else {
      useUI.getState().closeSheet();
      router.push("/armar-outfit");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Price p={c.p} lp={c.lp} size="lg" />
        <p className="mt-1 text-sm text-fog">
          {SITE.installments} cuotas sin interés de <strong className="text-chalk">{price(c.p / SITE.installments)}</strong>
        </p>
      </div>

      <p className="flex items-center gap-2 text-sm text-fog">
        <span className="size-4 rounded-full ring-1 ring-white/30" style={{ background: c.hx }} />
        {c.cn}
      </p>

      {!single && (
        <fieldset>
          <legend className="mb-2 flex w-full items-center justify-between text-sm font-bold">
            Elegí tu talle
            {nudge && !size && <span className="text-xs font-semibold text-magenta">Falta el talle</span>}
          </legend>
          <div className={`grid grid-cols-4 gap-2 sm:grid-cols-5 ${nudge && !size ? "animate-[pulse_0.6s_ease-in-out_2]" : ""}`}>
            {c.sz.map((s, i) => {
              const ok = c.sa[i] === "1";
              return (
                <button
                  key={s}
                  disabled={!ok}
                  aria-pressed={size === s}
                  onClick={() => setSize(s)}
                  className="h-12 rounded-xl text-sm font-bold ring-1 ring-white/15 transition-colors hover:ring-white/50 aria-pressed:bg-chalk aria-pressed:text-ink aria-pressed:ring-chalk disabled:text-mist/50 disabled:line-through"
                >
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-2.5">
        <button onClick={buy} className="btn btn-volt w-full">
          <IconBag size={20} /> Agregar al carrito
        </button>
        {c.gs && (
          <button onClick={tryOn} className="btn btn-ghost w-full">
            <IconShirt size={20} /> Probalo en el maniquí
          </button>
        )}
      </div>

      <ul className="grid gap-2 text-sm text-fog">
        <li className="flex items-center gap-2.5">
          <IconTruck size={18} className="text-cyan" /> Envío gratis desde {price(SITE.freeShippingFrom)}
        </li>
        <li className="flex items-center gap-2.5">
          <IconSwap size={18} className="text-cyan" /> Cambios sin cargo durante 30 días
        </li>
        <li className="flex items-center gap-2.5">
          <IconCard size={18} className="text-cyan" /> Outfit completo con 10% OFF
        </li>
      </ul>
    </div>
  );
}
