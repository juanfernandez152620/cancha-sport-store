"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { SearchItem } from "@/lib/types";
import { useJson } from "@/lib/useJson";
import { price } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";
import { IconSearch } from "@/components/ui/icons";
import { searchItems } from "./search";

export function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const [draft, setDraft] = useState(q);
  const [shown, setShown] = useState(48);
  const router = useRouter();
  const { data } = useJson<SearchItem[]>("/data/search.json");
  const results = useMemo(() => (data && q ? searchItems(data, q) : []), [data, q]);

  return (
    <div className="wrap">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/buscar?q=${encodeURIComponent(draft.trim())}`);
        }}
        className="mb-8 flex max-w-2xl items-center gap-3 rounded-full bg-white/8 pl-5 pr-2 ring-1 ring-white/15 focus-within:ring-volt"
      >
        <IconSearch size={22} className="text-volt" />
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Buscá un producto" aria-label="Buscar" className="h-14 flex-1 bg-transparent outline-none placeholder:text-mist" />
        <button className="btn btn-volt !min-h-10">Buscar</button>
      </form>
      <h1 className="display mb-6 text-[clamp(2.6rem,7vw,5rem)]">{q ? <>“{q}”</> : "Buscar"}</h1>
      {q && !data && <p className="text-fog">Buscando…</p>}
      {q && data && <p className="mb-6 text-mist">{results.length} resultados</p>}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-5">
        {results.slice(0, shown).map((r) => (
          <li key={r.s}>
            <Link href={`/producto/${r.s}`} className="group block">
              <span className="photo-tile block overflow-hidden rounded-2xl">
                <ProductImage path={r.im} alt={r.n} size={400} className="transition-transform duration-500 group-hover:scale-105" />
              </span>
              <span className="mt-3 block text-[11.5px] font-semibold uppercase tracking-wide text-mist">{r.ty}</span>
              <span className="line-clamp-2 font-semibold leading-snug">{r.n}</span>
              <span className="mt-1 block font-extrabold">{price(r.p)}</span>
            </Link>
          </li>
        ))}
      </ul>
      {results.length > shown && (
        <button onClick={() => setShown((n) => n + 48)} className="btn btn-ghost mt-8 w-full">
          Ver más
        </button>
      )}
    </div>
  );
}
