"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Card } from "@/lib/types";
import { useJson } from "@/lib/useJson";
import { groupKey, interleave } from "@/lib/interleave";
import { SPORTS } from "@/lib/taxonomy";
import { ProductCard, ProductListCard } from "@/components/product/ProductCard";
import { Sheet } from "@/components/ui/Sheet";
import { IconFilter, IconGrid, IconList } from "@/components/ui/icons";
import { COLOR_FILTERS } from "@/components/outfit/labels";

export type ListingBase = { gender?: "hombre" | "mujer"; dept?: string; sub?: string; sport?: string };
export type SubLink = { label: string; href: string; count: number; active?: boolean };

type Props = {
  base: ListingBase;
  dataUrl: string;
  initial: Card[];
  total: number;
  subs?: SubLink[];
  /** extra facet for sport pages: ropa / calzado / accesorios and gender */
  sportPage?: boolean;
};

type Sort = "nuevos" | "menor" | "mayor" | "ofertas";
const SORTS: { id: Sort; label: string }[] = [
  { id: "nuevos", label: "Novedades" },
  { id: "menor", label: "Menor precio" },
  { id: "mayor", label: "Mayor precio" },
  { id: "ofertas", label: "Ofertas primero" },
];

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "2XL", "XXL", "3XL", "4XL"];
function sizeRank(s: string) {
  const k = SIZE_ORDER.indexOf(s.toUpperCase());
  if (k >= 0) return k;
  const n = parseFloat(s.replace(",", "."));
  return Number.isNaN(n) ? 999 : 100 + n;
}

const PAGE = 24;

const noop = () => () => {};
function readUrlSort(): Sort | null {
  const q = new URLSearchParams(window.location.search).get("orden");
  return SORTS.some((s) => s.id === q) ? (q as Sort) : null;
}
const subscribeStorage = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
function readView(): "grid" | "list" | null {
  try {
    return localStorage.getItem("cancha-view") === "list" ? "list" : null;
  } catch {
    return null;
  }
}
const DEPT_LABEL: Record<string, string> = { accesorios: "Equipamiento", calzado: "Calzado", ropa: "Ropa" };

export function Listing({ base, dataUrl, initial, total, subs, sportPage }: Props) {
  const { data } = useJson<Card[]>(dataUrl);
  const [sport, setSport] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [dept, setDept] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [userSort, setSort] = useState<Sort | null>(null);
  const [userView, setUserView] = useState<"grid" | "list" | null>(null);
  // links can ask for an order (?orden=ofertas); the grid/list choice is remembered per visitor
  const urlSort = useSyncExternalStore(noop, readUrlSort, () => null);
  const savedView = useSyncExternalStore(subscribeStorage, readView, () => null);
  const sort: Sort = userSort ?? urlSort ?? "nuevos";
  const view = userView ?? savedView ?? "grid";
  const [shown, setShown] = useState(PAGE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sentinel = useRef<HTMLDivElement>(null);

  const pool = useMemo(() => {
    if (!data) return null;
    return data.filter(
      (c) =>
        (!base.dept || c.d === base.dept) &&
        (!base.sub || c.c === base.sub) &&
        (!base.sport || c.sp.includes(base.sport)) &&
        (!base.gender || c.g === base.gender || c.g === "unisex"),
    );
  }, [data, base.dept, base.sub, base.sport, base.gender]);

  const facets = useMemo(() => {
    const sizes = new Set<string>();
    const sports = new Map<string, number>();
    const colors = new Set<string>();
    for (const c of pool ?? []) {
      c.sz.forEach((s, i) => c.sa[i] === "1" && sizes.add(s));
      for (const s of c.sp) if (s in SPORTS && s !== base.sport) sports.set(s, (sports.get(s) ?? 0) + 1);
      colors.add(c.fm);
    }
    return {
      sizes: [...sizes].sort((a, b) => sizeRank(a) - sizeRank(b)).slice(0, 28),
      sports: [...sports.entries()].sort((a, b) => b[1] - a[1]),
      colors: COLOR_FILTERS.filter((c) => colors.has(c.id)),
    };
  }, [pool, base.sport]);

  const list = useMemo(() => {
    if (!pool) return null;
    const out = pool.filter((c) => {
      if (sport && !c.sp.includes(sport)) return false;
      if (color && c.fm !== color) return false;
      if (dept && c.d !== dept) return false;
      if (gender && c.g !== gender && c.g !== "unisex") return false;
      if (size) {
        const k = c.sz.indexOf(size);
        if (k < 0 || c.sa[k] !== "1") return false;
      }
      return true;
    });
    if (sort === "menor") out.sort((a, b) => a.p - b.p);
    else if (sort === "mayor") out.sort((a, b) => b.p - a.p);
    else if (sort === "ofertas") out.sort((a, b) => b.lp - b.p - (a.lp - a.p));
    // mixed pages open with a bit of every category (same order as the server's first page)
    else if (!base.sub) return interleave(out, groupKey);
    return out;
  }, [pool, sport, color, dept, gender, size, sort, base.sub]);

  const active = [sport, size, color, dept, gender].filter(Boolean).length;
  const items = list ?? initial;
  const count = list ? list.length : total;

  // reset paging when the result set changes
  const [sig, setSig] = useState("");
  const nextSig = `${sport}|${size}|${color}|${dept}|${gender}|${sort}`;
  if (sig !== nextSig) {
    setSig(nextSig);
    setShown(PAGE);
  }

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShown((n) => n + PAGE), { rootMargin: "800px" });
    io.observe(el);
    return () => io.disconnect();
  }, [list]);

  const clear = () => {
    setSport(null);
    setSize(null);
    setColor(null);
    setDept(null);
    setGender(null);
  };

  const filters = (
    <div className="flex flex-col gap-7">
      {subs && subs.length > 0 && (
        <div>
          <p className="eyebrow mb-3 text-mist">Categoría</p>
          <ul className="flex flex-col gap-0.5">
            {subs.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  aria-current={s.active ? "page" : undefined}
                  className="flex items-baseline justify-between rounded-lg px-2 py-1.5 text-[15px] text-fog hover:bg-white/6 hover:text-chalk aria-[current=page]:bg-volt/12 aria-[current=page]:font-bold aria-[current=page]:text-volt"
                >
                  {s.label} <span className="text-xs text-mist">{s.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {sportPage && (
        <>
          <Facet title="Tipo">
            {["accesorios", "calzado", "ropa"].map((d) => (
              <button key={d} className="chip" aria-pressed={dept === d} onClick={() => setDept(dept === d ? null : d)}>
                {DEPT_LABEL[d]}
              </button>
            ))}
          </Facet>
          <Facet title="Para">
            {["hombre", "mujer"].map((g) => (
              <button key={g} className="chip" aria-pressed={gender === g} onClick={() => setGender(gender === g ? null : g)}>
                {g === "hombre" ? "Hombre" : "Mujer"}
              </button>
            ))}
          </Facet>
        </>
      )}
      {!sportPage && facets.sports.length > 0 && (
        <Facet title="Deporte">
          {facets.sports.slice(0, 7).map(([s, n]) => (
            <button key={s} className="chip" aria-pressed={sport === s} onClick={() => setSport(sport === s ? null : s)}>
              {SPORTS[s as keyof typeof SPORTS].label} <span className="opacity-60">{n}</span>
            </button>
          ))}
        </Facet>
      )}
      {facets.sizes.length > 1 && (
        <Facet title="Talle">
          {facets.sizes.map((s) => (
            <button key={s} className="chip !min-w-12 justify-center" aria-pressed={size === s} onClick={() => setSize(size === s ? null : s)}>
              {s}
            </button>
          ))}
        </Facet>
      )}
      {facets.colors.length > 1 && (
        <Facet title="Color">
          {facets.colors.map((c) => (
            <button
              key={c.id}
              onClick={() => setColor(color === c.id ? null : c.id)}
              aria-pressed={color === c.id}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-fog ring-1 ring-white/12 aria-pressed:text-chalk aria-pressed:ring-2 aria-pressed:ring-volt"
            >
              <span className="size-6 rounded-full ring-1 ring-black/30" style={{ background: c.hex }} />
              {c.label}
            </button>
          ))}
        </Facet>
      )}
      {active > 0 && (
        <button onClick={clear} className="text-left text-sm font-bold text-magenta">
          Limpiar filtros ({active})
        </button>
      )}
    </div>
  );

  return (
    <div className="wrap grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside aria-label="Filtros" className="hidden lg:block">
        <div className="no-scrollbar sticky top-[calc(var(--header-h)+20px)] max-h-[calc(100svh-var(--header-h)-40px)] overflow-y-auto pb-8">{filters}</div>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-[var(--header-visible,var(--header-h))] z-20 -mx-[var(--gutter)] mb-5 flex items-center gap-2 bg-ink/85 transition-[top] duration-300 px-[var(--gutter)] py-3 backdrop-blur-lg lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <button onClick={() => setFiltersOpen(true)} className="chip lg:hidden">
            <IconFilter size={16} /> Filtrar{active ? ` (${active})` : ""}
          </button>
          <p className="hidden text-sm text-mist sm:block" aria-live="polite">
            {count} productos
          </p>
          <label className="ml-auto flex items-center gap-2 text-sm text-mist">
            <span className="hidden sm:inline">Ordenar</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-10 rounded-full bg-white/6 px-3 text-sm font-semibold text-chalk ring-1 ring-white/12">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex rounded-full bg-white/6 p-1 ring-1 ring-white/12">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                aria-pressed={view === v}
                aria-label={v === "grid" ? "Ver en grilla" : "Ver en lista"}
                onClick={() => {
                  setUserView(v);
                  try {
                    localStorage.setItem("cancha-view", v);
                  } catch {}
                }}
                className="grid size-8 place-items-center rounded-full text-mist aria-pressed:bg-chalk aria-pressed:text-ink"
              >
                {v === "grid" ? <IconGrid size={16} /> : <IconList size={16} />}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl bg-white/5 p-10 text-center">
            <p className="display text-3xl">Sin resultados</p>
            <p className="mt-2 text-fog">Probá sacando algún filtro.</p>
            <button onClick={clear} className="btn btn-volt mt-5">
              Limpiar filtros
            </button>
          </div>
        ) : view === "grid" ? (
          <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-4">
            {items.slice(0, shown).map((c, k) => (
              <li key={c.id}>
                <ProductCard c={c} eager={k < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {items.slice(0, shown).map((c) => (
              <li key={c.id}>
                <ProductListCard c={c} />
              </li>
            ))}
          </ul>
        )}
        {list && shown < list.length && <div ref={sentinel} className="h-20" aria-hidden />}
        {!list && total > initial.length && <p className="mt-8 text-center text-sm text-mist">Cargando más productos…</p>}
      </div>

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        label="Filtros"
        title={<p className="display text-3xl">Filtrar</p>}
        footer={
          <button onClick={() => setFiltersOpen(false)} className="btn btn-volt w-full">
            Ver {count} productos
          </button>
        }
      >
        <div className="px-5 pb-6">{filters}</div>
      </Sheet>
    </div>
  );
}

function Facet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-3 text-mist">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
