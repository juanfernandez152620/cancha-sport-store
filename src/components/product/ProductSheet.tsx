"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useUI } from "@/lib/stores";
import { SPORTS } from "@/lib/taxonomy";
import { Sheet } from "@/components/ui/Sheet";
import { IconArrow } from "@/components/ui/icons";
import { BuyBox } from "./BuyBox";
import { Gallery } from "./Gallery";

/** Quick view opened from any product card. The phone back button closes it. */
export function ProductSheet() {
  const c = useUI((s) => s.sheet);
  const close = useUI((s) => s.closeSheet);
  const pushed = useRef(false);

  useEffect(() => {
    if (!c) {
      pushed.current = false;
      return;
    }
    if (!pushed.current) {
      window.history.pushState(window.history.state, "", window.location.href);
      pushed.current = true;
    }
    const onPop = () => {
      pushed.current = false;
      close();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [c, close]);

  const dismiss = () => {
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    }
    close();
  };

  const sport = c?.sp.find((s) => s in SPORTS) as keyof typeof SPORTS | undefined;

  return (
    <Sheet open={!!c} onClose={dismiss} side="bottom" desktopSide="right" label={c ? c.n : "Producto"} className="lg:max-w-[560px]">
      {c && (
        <div className="grid gap-6 px-5 pb-8">
          <Gallery images={c.im} alt={c.n} size={720} />
          <div>
            <p className="eyebrow text-volt">
              {c.g === "unisex" ? "Unisex" : c.g === "hombre" ? "Hombre" : "Mujer"} · {c.ty}
              {sport ? ` · ${SPORTS[sport].label}` : ""}
            </p>
            <h2 className="mt-2 text-3xl font-black leading-[1.05] tracking-tight" style={{ fontStretch: "88%" }}>
              {c.n}
            </h2>
            <p className="mt-1 text-fog">{c.t}</p>
          </div>
          <BuyBox key={c.id} c={c} onDone={dismiss} />
          <Link href={`/producto/${c.s}`} onClick={() => close()} className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3.5 text-sm font-bold hover:bg-white/10">
            Ver ficha completa <IconArrow size={18} />
          </Link>
        </div>
      )}
    </Sheet>
  );
}
