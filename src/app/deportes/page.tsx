import type { Metadata } from "next";
import Link from "next/link";
import { countFor, rail } from "@/lib/catalog";
import { MAIN_SPORTS, SPORTS } from "@/lib/taxonomy";
import { SportTiles } from "@/components/home/SportTiles";
import { ProductRail } from "@/components/product/ProductRail";
import { Crumbs, OutfitCta, PageTitle } from "@/components/page/PageBits";
import { SPORT_ICON } from "@/components/ui/sport-icons";

export const metadata: Metadata = {
  title: "Deportes",
  description: "Equipamiento para fútbol, tenis, vóley y hockey: pelotas, guantes, palos, raquetas, rodilleras y más.",
};

const MORE = ["running", "training", "basquet"] as const;

export default function DeportesPage() {
  return (
    <div className="flex flex-col gap-16 pb-8 pt-6 lg:gap-24 lg:pt-10">
      <div>
        <Crumbs items={[{ label: "Deportes" }]} />
        <PageTitle
          eyebrow="Equipamiento"
          accent="var(--color-flame)"
          title={
            <>
              Todo para <span className="text-flame">tu deporte</span>
            </>
          }
          lead="Pelotas, guantes, canilleras, palos, raquetas y rodilleras. Elegí el deporte y te mostramos el equipo, los combos por posición y la ropa para jugar."
        />
        <div className="wrap">
          <SportTiles tiles={MAIN_SPORTS.map((s) => ({ sport: s, count: countFor({ sport: s }) }))} />
          <ul className="mt-4 grid grid-cols-3 gap-3">
            {MORE.map((s) => {
              const Icon = SPORT_ICON[s];
              return (
                <li key={s}>
                  <Link href={`/deportes/${s}`} className="card-surface flex items-center gap-3 rounded-2xl p-4 hover:ring-2 hover:ring-white/30">
                    <Icon size={34} style={{ color: SPORTS[s].color }} />
                    <span>
                      <span className="display block text-2xl">{SPORTS[s].label}</span>
                      <span className="text-xs text-mist">{countFor({ sport: s })} productos</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {MAIN_SPORTS.map((s) => (
        <ProductRail
          key={s}
          eyebrow={SPORTS[s].label}
          title={`Equipamiento de ${SPORTS[s].label.toLowerCase()}`}
          lead={SPORTS[s].tagline}
          href={`/deportes/${s}`}
          accent={SPORTS[s].color}
          cards={rail(null, { sport: s, dept: "accesorios" }, 14)}
        />
      ))}
      <OutfitCta />
    </div>
  );
}
