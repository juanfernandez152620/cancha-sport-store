"use client";

import Link from "next/link";
import { useState } from "react";
import { useUI } from "@/lib/stores";
import { SITE, whatsappLink } from "@/lib/site";
import type { Nav } from "@/lib/nav";
import { Sheet } from "@/components/ui/Sheet";
import { ProductImage } from "@/components/product/ProductImage";
import { IconChevron, IconShirt, IconWhatsapp } from "@/components/ui/icons";
import { Logo } from "./Logo";

const TABS = [
  { key: "hombre", label: "Hombre", color: "var(--color-cyan)" },
  { key: "mujer", label: "Mujer", color: "var(--color-magenta)" },
  { key: "deportes", label: "Deportes", color: "var(--color-flame)" },
] as const;

/** Phone drawer: categories with photos, like the reference store's side menu. */
export function MobileMenu({ nav }: { nav: Nav }) {
  const open = useUI((s) => s.menuOpen);
  const setOpen = useUI((s) => s.setMenuOpen);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("hombre");
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onClose={close} side="left" label="Menú" title={<Logo />}>
      <div className="flex flex-col gap-5 px-5 pb-8">
        <Link href="/armar-outfit" onClick={close} className="flex items-center gap-3 rounded-2xl bg-volt p-4 text-ink">
          <IconShirt size={26} />
          <span className="flex-1">
            <span className="display block text-2xl">Armá tu outfit</span>
            <span className="text-xs font-bold">Outfit completo = 10% OFF</span>
          </span>
          <IconChevron />
        </Link>

        <div role="tablist" className="grid grid-cols-3 gap-1 rounded-full bg-white/6 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className="h-10 rounded-full text-xs font-extrabold uppercase tracking-wide text-fog aria-selected:text-ink"
              style={tab === t.key ? { background: t.color } : undefined}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Link href={tab === "deportes" ? "/deportes" : `/${tab}`} onClick={close} className="flex items-center justify-between text-sm font-bold text-volt">
          Ver todo {TABS.find((t) => t.key === tab)!.label} <IconChevron size={18} />
        </Link>

        {nav[tab].map((g) => (
          <div key={g.title}>
            <Link href={g.href} onClick={close} className="eyebrow mb-2 block text-mist">
              {g.title}
            </Link>
            <ul className="flex flex-col">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={close} className="flex items-center gap-3 rounded-xl py-2 pr-1 hover:bg-white/5">
                    {l.image ? (
                      <span className="photo-tile size-11 shrink-0 overflow-hidden rounded-lg">
                        <ProductImage path={l.image} alt="" size={100} />
                      </span>
                    ) : (
                      <span className="size-11 shrink-0 rounded-lg bg-white/6" />
                    )}
                    <span className="flex-1">
                      <span className="block text-[15px] font-semibold">{l.label}</span>
                      {l.count !== undefined && <span className="text-xs text-mist">{l.count} productos</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <a href={whatsappLink(`Hola ${SITE.name}, tengo una consulta`)} target="_blank" rel="noopener" className="btn btn-ghost">
          <IconWhatsapp size={20} /> Consultanos por WhatsApp
        </a>
      </div>
    </Sheet>
  );
}
