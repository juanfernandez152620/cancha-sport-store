import Link from "next/link";
import type { ReactNode } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { IconArrow, IconChevron, IconShirt } from "@/components/ui/icons";

export function Crumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Estás en" className="wrap mb-4 text-sm text-mist">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-chalk">
            Inicio
          </Link>
        </li>
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-1.5">
            <IconChevron size={14} />
            {it.href ? (
              <Link href={it.href} className="hover:text-chalk">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fog">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageTitle({ eyebrow, title, lead, accent = "var(--color-volt)", children }: { eyebrow?: string; title: ReactNode; lead?: string; accent?: string; children?: ReactNode }) {
  return (
    <header className="wrap mb-8">
      {eyebrow && (
        <p className="eyebrow mb-3 flex items-center gap-2" style={{ color: accent }}>
          <span className="inline-block h-[3px] w-8 -skew-x-[20deg]" style={{ background: accent }} /> {eyebrow}
        </p>
      )}
      <h1 className="display text-[clamp(3rem,10vw,7rem)]">{title}</h1>
      {lead && <p className="mt-3 max-w-2xl text-fog sm:text-lg">{lead}</p>}
      {children}
    </header>
  );
}

export type SubTile = { label: string; href: string; count: number; image: string };

/** Horizontal strip of subcategory tiles with product photos. */
export function SubStrip({ title, href, tiles, accent = "var(--color-volt)" }: { title: string; href: string; tiles: SubTile[]; accent?: string }) {
  if (!tiles.length) return null;
  return (
    <section className="wrap">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="display flex items-center gap-3 text-[clamp(2rem,5vw,3.2rem)]">
          <span className="inline-block h-7 w-2.5 -skew-x-[20deg]" style={{ background: accent }} />
          {title}
        </h2>
        <Link href={href} className="flex items-center gap-2 text-sm font-bold hover:text-volt">
          Ver todo <IconArrow size={18} />
        </Link>
      </div>
      <ul className="no-scrollbar -mx-[var(--gutter)] flex snap-x gap-3 overflow-x-auto px-[var(--gutter)] pb-2">
        {tiles.map((t) => (
          <li key={t.href} className="w-[38vw] max-w-[180px] shrink-0 snap-start sm:w-[160px]">
            <Link href={t.href} className="group block">
              <span className="photo-tile block overflow-hidden rounded-2xl">
                <ProductImage path={t.image} alt="" size={300} className="p-2 transition-transform duration-500 group-hover:scale-110" />
              </span>
              <span className="mt-2 block text-sm font-semibold leading-tight group-hover:text-volt">{t.label}</span>
              <span className="text-xs text-mist">{t.count} productos</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OutfitCta({ gender }: { gender?: "hombre" | "mujer" }) {
  return (
    <section className="wrap">
      <Link
        href={gender ? `/armar-outfit?g=${gender}` : "/armar-outfit"}
        className="group relative flex flex-col gap-4 overflow-hidden rounded-[28px] bg-volt p-6 text-ink sm:flex-row sm:items-center sm:p-10"
      >
        <span className="absolute -right-10 top-1/2 h-[140%] w-1/3 -translate-y-1/2 -skew-x-[20deg] bg-ink/10 transition-transform duration-700 group-hover:translate-x-[-40%]" />
        <IconShirt size={56} className="shrink-0" />
        <span className="relative flex-1">
          <span className="display block text-[clamp(2.4rem,6vw,4.4rem)]">Armá tu outfit completo</span>
          <span className="mt-1 block max-w-xl font-semibold">Elegí arriba, abajo y calzado en el probador virtual y te llevás 10% OFF en todo el conjunto.</span>
        </span>
        <span className="relative grid size-16 shrink-0 place-items-center rounded-full bg-ink text-volt transition-transform duration-300 group-hover:-rotate-45">
          <IconArrow size={28} />
        </span>
      </Link>
    </section>
  );
}

export function LoadingBlock() {
  return (
    <div className="wrap" aria-busy>
      <div className="mb-8 h-24 w-2/3 animate-pulse rounded-2xl bg-white/6" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white/6" />
        ))}
      </div>
    </div>
  );
}
