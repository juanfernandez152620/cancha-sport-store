"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import type { Card } from "@/lib/types";
import { useUI } from "@/lib/stores";
import { discountPct, plural } from "@/lib/format";
import { SPORTS } from "@/lib/taxonomy";
import { ProductImage } from "./ProductImage";
import { Price } from "./Price";
import { IconPlus } from "@/components/ui/icons";

/** Plain clicks open the quick-view sheet; modified clicks (new tab) still follow the real link. */
function useQuickView(card: Card) {
  const openSheet = useUI((s) => s.openSheet);
  return (e: MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    openSheet(card);
  };
}

function Badges({ c }: { c: Card }) {
  const off = discountPct(c.p, c.lp);
  return (
    <span className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
      <span className="rounded-full bg-ink/85 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide text-chalk">{c.ty}</span>
      {c.f.includes("x") && <span className="rounded-full bg-flame px-2.5 py-1 text-[10.5px] font-black uppercase text-ink">Línea Cancha</span>}
      {c.f.includes("n") && !c.f.includes("x") && <span className="rounded-full bg-volt px-2.5 py-1 text-[10.5px] font-black uppercase text-ink">Nuevo</span>}
      {off > 0 && <span className="rounded-full bg-magenta px-2.5 py-1 text-[10.5px] font-black text-white">-{off}%</span>}
    </span>
  );
}

export function ProductCard({ c, eager = false }: { c: Card; eager?: boolean }) {
  const onClick = useQuickView(c);
  return (
    <article className="group relative">
      <Link href={`/producto/${c.s}`} prefetch={false} onClick={onClick} className="block rounded-2xl">
        <div className="photo-tile relative overflow-hidden rounded-2xl">
          <ProductImage path={c.im[0]} alt={c.n} size={480} eager={eager} className="transition duration-500 ease-out group-hover:scale-[1.04]" />
          {c.im[1] && (
            <span className="absolute inset-0 hidden opacity-0 transition-opacity duration-300 group-hover:opacity-100 [@media(hover:hover)]:block">
              <ProductImage path={c.im[1]} alt="" size={480} className="photo-tile" />
            </span>
          )}
          <Badges c={c} />
          {c.im.length > 1 && (
            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-ink/70 px-2 py-0.5 text-[10.5px] font-bold text-chalk">{plural(c.im.length, "foto", "fotos")}</span>
          )}
          <span className="absolute bottom-2.5 right-2.5 grid size-10 place-items-center rounded-full bg-volt text-ink shadow-lg transition-transform duration-300 group-hover:rotate-90" aria-hidden>
            <IconPlus size={20} strokeWidth={2.6} />
          </span>
        </div>
        <div className="flex flex-col gap-1 px-0.5 pt-3">
          <p className="truncate text-[11.5px] font-semibold uppercase tracking-wide text-mist">
            {c.sp.filter((s) => s in SPORTS).slice(0, 1).map((s) => SPORTS[s as keyof typeof SPORTS].label)[0] ?? c.ty}
            {" · "}
            {c.g === "unisex" ? "Unisex" : c.g === "hombre" ? "Hombre" : "Mujer"}
          </p>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-chalk">{c.n}</h3>
          <p className="truncate text-xs text-mist">{c.cn}</p>
          <div className="mt-1">
            <Price p={c.p} lp={c.lp} />
          </div>
        </div>
      </Link>
    </article>
  );
}

/** Horizontal card, like the reference store's mobile results: photo left, facts and a clear action right. */
export function ProductListCard({ c }: { c: Card }) {
  const onClick = useQuickView(c);
  const sizes = c.sz.filter((_, i) => c.sa[i] === "1");
  return (
    <article className="card-surface group overflow-hidden rounded-3xl">
      <Link href={`/producto/${c.s}`} prefetch={false} onClick={onClick} className="grid grid-cols-[42%_1fr] gap-4 p-3">
        <div className="photo-tile relative overflow-hidden rounded-2xl">
          <ProductImage path={c.im[0]} alt={c.n} size={360} className="h-full object-contain" />
          <Badges c={c} />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5 py-1 pr-1">
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-chalk">{c.n}</h3>
          <p className="line-clamp-2 text-sm text-mist">{c.t}</p>
          <p className="flex items-center gap-1.5 text-xs text-fog">
            <span className="size-3 shrink-0 rounded-full ring-1 ring-white/30" style={{ background: c.hx }} />
            <span className="truncate">{c.cn}</span>
          </p>
          {sizes.length > 0 && (
            <p className="flex flex-wrap gap-1">
              {sizes.slice(0, 5).map((s) => (
                <span key={s} className="rounded-md bg-white/8 px-1.5 py-0.5 text-[11px] font-semibold text-fog">{s}</span>
              ))}
              {sizes.length > 5 && <span className="px-1 text-[11px] text-mist">+{sizes.length - 5}</span>}
            </p>
          )}
          <div className="mt-auto pt-1">
            <Price p={c.p} lp={c.lp} />
          </div>
          <span className="btn btn-volt mt-1 !min-h-11 w-full !text-xs">Elegir talle</span>
        </div>
      </Link>
    </article>
  );
}
