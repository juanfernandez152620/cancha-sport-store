import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { listing, spread, toCard } from "@/lib/catalog";
import { isSport, MAIN_SPORTS, SPORTS } from "@/lib/taxonomy";
import type { SportSlug } from "@/lib/types";
import { Crumbs, LoadingBlock, OutfitCta } from "@/components/page/PageBits";
import { ProductCard } from "@/components/product/ProductCard";
import { Listing } from "@/components/listing/Listing";
import { SportCombos } from "@/components/outfit/SportCombos";
import { SportHero } from "@/components/page/SportHero";

export function generateStaticParams() {
  return Object.keys(SPORTS).map((sport) => ({ sport }));
}

export async function generateMetadata({ params }: PageProps<"/deportes/[sport]">): Promise<Metadata> {
  const { sport } = await params;
  if (!isSport(sport)) return {};
  return { title: SPORTS[sport].label, description: SPORTS[sport].tagline };
}

async function Body({ params }: { params: PageProps<"/deportes/[sport]">["params"] }) {
  const { sport } = await params;
  if (!isSport(sport)) notFound();
  const s = SPORTS[sport];
  const all = listing({ sport });
  const gear = all.filter((p) => p.d === "accesorios");
  const main = (MAIN_SPORTS as readonly string[]).includes(sport);

  return (
    <div className="flex flex-col gap-16 pb-8 lg:gap-24">
      <div>
        <Crumbs items={[{ label: "Deportes", href: "/deportes" }, { label: s.label }]} />
        <SportHero sport={sport as SportSlug} count={all.length} gearCount={gear.length} />
      </div>

      {gear.length > 0 && (
        <section className="wrap" aria-labelledby="equipo">
          <h2 id="equipo" className="display mb-2 text-[clamp(2.4rem,6vw,4rem)]">
            Equipamiento
          </h2>
          <p className="mb-6 max-w-xl text-fog">{s.tagline}.</p>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 md:grid-cols-3 xl:grid-cols-5">
            {spread(gear, 20).map((p) => (
              <li key={p.id}>
                <ProductCard c={toCard(p)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {main && (
        <section className="wrap" aria-labelledby="combos">
          <p className="eyebrow mb-2" style={{ color: s.color }}>
            Combos por posición
          </p>
          <h2 id="combos" className="display mb-6 text-[clamp(2.4rem,6vw,4rem)]">
            Listos para jugar
          </h2>
          <SportCombos sport={sport as (typeof MAIN_SPORTS)[number]} />
        </section>
      )}

      <section aria-labelledby="todo">
        <h2 id="todo" className="wrap display mb-6 text-[clamp(2.4rem,6vw,4rem)]">
          Todo {s.label.toLowerCase()}
        </h2>
        <Listing base={{ sport }} dataUrl={`/data/s/${sport}.json`} initial={spread(all, 24).map(toCard)} total={all.length} sportPage />
      </section>

      <OutfitCta />
    </div>
  );
}

export default function SportPage(props: PageProps<"/deportes/[sport]">) {
  return (
    <div className="pt-6 lg:pt-10">
      <Suspense fallback={<LoadingBlock />}>
        <Body params={props.params} />
      </Suspense>
    </div>
  );
}
