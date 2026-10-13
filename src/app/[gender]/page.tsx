import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { countFor, rail, subsFor } from "@/lib/catalog";
import { DEPTS, GENDERS, isGender } from "@/lib/taxonomy";
import type { Dept, Gender } from "@/lib/types";
import { ProductRail } from "@/components/product/ProductRail";
import { Crumbs, LoadingBlock, OutfitCta, SubStrip } from "@/components/page/PageBits";
import { IconArrow } from "@/components/ui/icons";

export function generateStaticParams() {
  return [{ gender: "hombre" }, { gender: "mujer" }];
}

export async function generateMetadata({ params }: PageProps<"/[gender]">): Promise<Metadata> {
  const { gender } = await params;
  if (!isGender(gender)) return {};
  return { title: GENDERS[gender].label, description: `Ropa, calzado y accesorios deportivos para ${gender}.` };
}

const PORTRAITS: Record<Gender, string[]> = {
  hombre: ["hombre-retrato-2", "hombre-retrato-3", "hombre-retrato-4"],
  mujer: ["mujer-retrato-1", "mujer-retrato-2", "mujer-retrato-4"],
};

async function Landing({ params }: { params: PageProps<"/[gender]">["params"] }) {
  const { gender } = await params;
  if (!isGender(gender)) notFound();
  const g = GENDERS[gender];
  const depts: Dept[] = ["ropa", "calzado", "accesorios"];

  return (
    <div className="flex flex-col gap-16 pb-8 lg:gap-24">
      <div>
        <Crumbs items={[{ label: g.label }]} />
        <section className="wrap grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="eyebrow mb-3" style={{ color: g.accent }}>
              {g.plural}
            </p>
            <h1 className="display text-[clamp(4.5rem,17vw,11rem)]" style={{ color: g.accent }}>
              {g.label}
            </h1>
            <p className="mt-4 max-w-md text-lg text-fog">
              {gender === "hombre"
                ? "Camisetas de clubes, botines, shorts y zapatillas para jugar y para la calle."
                : "Tops, calzas, polleras y zapatillas pensadas para entrenar, competir y salir."}
            </p>
            <ul className="mt-8 grid gap-2.5 sm:max-w-md">
              {depts.map((d, k) => (
                <li key={d} style={{ marginLeft: `${k * 6}%` }}>
                  <Link
                    href={`/${gender}/${d}`}
                    className="group flex h-16 items-center gap-4 pl-6 pr-10 text-ink transition-[padding] duration-300 hover:pl-9"
                    style={{ background: ["var(--color-volt)", "var(--color-cyan)", "var(--color-magenta)"][k], clipPath: "polygon(0 0, 100% 0, calc(100% - 26px) 100%, 0 100%)" }}
                  >
                    <span className="display text-4xl">{DEPTS[d]}</span>
                    <span className="text-xs font-extrabold uppercase tracking-widest opacity-70">{countFor({ gender, dept: d })}</span>
                    <IconArrow size={24} className="ml-auto" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {PORTRAITS[gender].map((p, k) => (
              <div key={p} className="overflow-hidden rounded-[22px]" style={{ transform: `${k === 1 ? "translateY(2rem) " : ""}skewY(-4deg)` }}>
                <img src={`/banners/${p}-480.webp`} alt="" className="aspect-[3/5] h-full w-full scale-110 object-cover" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {depts.map((d, k) => (
        <SubStrip
          key={d}
          title={DEPTS[d]}
          href={`/${gender}/${d}`}
          accent={["var(--color-volt)", "var(--color-cyan)", "var(--color-magenta)"][k]}
          tiles={subsFor(gender, d).map((s) => ({ label: s.label, href: `/${gender}/${d}/${s.slug}`, count: s.count, image: s.cover }))}
        />
      ))}

      <ProductRail eyebrow="Recién llegados" title="Lanzamientos" href={`/${gender}/ropa`} cards={rail("new", { gender }, 16)} accent={g.accent} />
      <OutfitCta gender={gender} />
      <ProductRail eyebrow="Los que más salen" title="Más vendidos" href={`/${gender}/calzado`} cards={rail("best", { gender }, 16)} />
      <ProductRail eyebrow="Oportunidades" title="Ofertas" href={`/${gender}/ropa?orden=ofertas`} cards={rail("sale", { gender }, 16)} accent="var(--color-magenta)" />
    </div>
  );
}

export default function GenderPage(props: PageProps<"/[gender]">) {
  return (
    <div className="pt-6 lg:pt-10">
      <Suspense fallback={<LoadingBlock />}>
        <Landing params={props.params} />
      </Suspense>
    </div>
  );
}
