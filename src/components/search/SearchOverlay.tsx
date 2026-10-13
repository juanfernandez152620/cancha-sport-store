"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import type { SearchItem } from "@/lib/types";
import { useUI } from "@/lib/stores";
import { useJson } from "@/lib/useJson";
import { price } from "@/lib/format";
import { Sheet } from "@/components/ui/Sheet";
import { ProductImage } from "@/components/product/ProductImage";
import { IconArrow, IconSearch } from "@/components/ui/icons";
import { searchItems } from "./search";

const SUGGESTIONS = ["Palo de hockey", "Botines", "Raqueta", "Rodilleras", "Calzas", "Camiseta Racing", "Guantes de arquero", "Pelota", "Buzo con capucha", "Zapatillas running"];

export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const [q, setQ] = useState("");
  const dq = useDeferredValue(q);
  const { data } = useJson<SearchItem[]>(open ? "/data/search.json" : null);
  const results = useMemo(() => (data && dq.trim().length > 1 ? searchItems(data, dq) : []), [data, dq]);
  const router = useRouter();

  const close = () => setOpen(false);
  const submit = () => {
    if (!q.trim()) return;
    close();
    router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <Sheet open={open} onClose={close} side="bottom" desktopSide="center" label="Buscar productos" className="h-[92svh] lg:h-[80svh]" hideClose>
      <div className="sticky top-0 z-10 bg-night px-5 pb-4 pt-2 lg:pt-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex items-center gap-3 rounded-full bg-white/8 pl-5 pr-2 ring-1 ring-white/15 focus-within:ring-volt"
          role="search"
        >
          <IconSearch size={22} className="shrink-0 text-volt" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="¿Qué estás buscando? Ej: palo de hockey, botines…"
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-chalk outline-none placeholder:text-mist"
            enterKeyHint="search"
            aria-label="Buscar"
          />
          <button type="button" onClick={close} className="h-10 shrink-0 rounded-full px-4 text-sm font-bold text-fog hover:text-chalk">
            Cerrar
          </button>
        </form>
      </div>
      <div className="px-5 pb-8">
        {dq.trim().length < 2 ? (
          <div>
            <p className="eyebrow mb-3 text-mist">Lo más buscado</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" onClick={() => setQ(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : !data ? (
          <p className="text-fog">Buscando…</p>
        ) : results.length === 0 ? (
          <p className="text-fog">No encontramos “{dq}”. Probá con otra palabra o mirá las categorías.</p>
        ) : (
          <>
            <p className="mb-3 text-sm text-mist">{results.length} resultados</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {results.slice(0, 24).map((r) => (
                <li key={r.s}>
                  <Link href={`/producto/${r.s}`} onClick={close} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-white/6">
                    <span className="photo-tile size-16 shrink-0 overflow-hidden rounded-xl">
                      <ProductImage path={r.im} alt="" size={140} className="p-1" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{r.n}</span>
                      <span className="block truncate text-xs text-mist">{r.t}</span>
                      <span className="text-sm font-extrabold">{price(r.p)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {results.length > 24 && (
              <button onClick={submit} className="btn btn-ghost mt-4 w-full">
                Ver los {results.length} resultados <IconArrow size={18} />
              </button>
            )}
          </>
        )}
      </div>
    </Sheet>
  );
}
