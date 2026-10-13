import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getProduct, PRODUCTS, related, spread, toCard } from "@/lib/catalog";
import { DEPTS, GENDERS, SPORTS, subLabel } from "@/lib/taxonomy";
import { img } from "@/lib/format";
import type { Product, Slot } from "@/lib/types";
import { Crumbs, LoadingBlock, OutfitCta } from "@/components/page/PageBits";
import { Gallery } from "@/components/product/Gallery";
import { BuyBox } from "@/components/product/BuyBox";
import { ProductRail } from "@/components/product/ProductRail";

// launches and the store line are built ahead of time; everything else renders on first visit and is cached
export function generateStaticParams() {
  return PRODUCTS.filter((p) => p.f.includes("x") || p.f.includes("n"))
    .slice(0, 160)
    .map((p) => ({ slug: p.s }));
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return { title: "Producto no encontrado" };
  return { title: p.n, description: `${p.t}. ${p.cn}.`, openGraph: { images: [img(p.im[0], 800)] } };
}

const COMPLEMENT: Partial<Record<Slot, Slot[]>> = {
  top: ["bottom", "shoes", "socks"],
  outer: ["top", "bottom", "shoes"],
  bottom: ["top", "shoes", "socks"],
  shoes: ["socks", "top", "bottom"],
  socks: ["shoes", "bottom", "protect"],
  gear: ["protect", "hands", "shoes"],
  protect: ["gear", "socks", "shoes"],
  head: ["top", "bottom", "shoes"],
  hands: ["gear", "top", "outer"],
};

/** Pieces from other slots that share sport and gender: the start of an outfit. */
function complements(p: Product) {
  const slots = p.gs ? COMPLEMENT[p.gs[0]] ?? [] : [];
  const sport = p.sp.find((s) => s in SPORTS);
  const pool = PRODUCTS.filter(
    (x) => x.gs && slots.includes(x.gs[0]) && (x.g === p.g || x.g === "unisex" || p.g === "unisex") && (!sport || x.sp.includes(sport)),
  );
  return spread(
    pool.sort((a, b) => slots.indexOf(a.gs![0]) - slots.indexOf(b.gs![0])),
    12,
  ).map(toCard);
}

function Description({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const bullets = lines.filter((l) => l.startsWith("•")).map((l) => l.replace(/^•\s*/, ""));
  const paras = lines.filter((l) => !l.startsWith("•"));
  return (
    <div className="flex flex-col gap-3 text-fog">
      {paras.map((l, i) => (
        <p key={i} className={i === 0 ? "text-lg font-semibold text-chalk" : ""}>
          {l}
        </p>
      ))}
      {bullets.length > 0 && (
        <ul className="grid gap-1.5">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span className="mt-2 h-1.5 w-3 shrink-0 -skew-x-[20deg] bg-volt" />
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function Body({ params }: { params: PageProps<"/producto/[slug]">["params"] }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const g = p.g === "unisex" ? "hombre" : p.g;
  const sport = p.sp.find((s) => s in SPORTS) as keyof typeof SPORTS | undefined;
  const card = { ...toCard(p), im: p.im };
  const outfit = complements(p);

  return (
    <div className="flex flex-col gap-16 pb-8">
      <div>
        <Crumbs
          items={[
            { label: GENDERS[g].label, href: `/${g}` },
            { label: DEPTS[p.d], href: `/${g}/${p.d}` },
            { label: subLabel(p.d, p.c), href: `/${g}/${p.d}/${p.c}` },
            { label: p.n },
          ]}
        />
        <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+20px)] lg:self-start">
            <Gallery images={p.im} alt={p.n} size={900} />
          </div>
          <div className="flex flex-col gap-8">
            <div>
              <p className="eyebrow text-volt">
                {p.g === "unisex" ? "Unisex" : GENDERS[p.g].label} · {p.ty}
                {sport ? ` · ${SPORTS[sport].label}` : ""}
              </p>
              <h1 className="mt-2 text-[clamp(2.2rem,5vw,3.4rem)] font-black leading-[1.02] tracking-tight" style={{ fontStretch: "85%" }}>
                {p.n}
              </h1>
              <p className="mt-2 text-lg text-fog">{p.t}</p>
            </div>
            <BuyBox c={card} />
            {p.desc && (
              <section className="border-t border-white/10 pt-6">
                <h2 className="display mb-4 text-3xl">Detalles</h2>
                <Description text={p.desc} />
              </section>
            )}
            <dl className="grid grid-cols-2 gap-3 border-t border-white/10 pt-6 text-sm">
              {[
                ["Código", p.ref],
                ["Color", p.cn],
                ["Para", p.g === "unisex" ? "Unisex" : GENDERS[p.g].label],
                ["Deporte", sport ? SPORTS[sport].label : "Uso diario"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-white/5 p-3">
                  <dt className="text-xs uppercase tracking-widest text-mist">{k}</dt>
                  <dd className="mt-0.5 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      {outfit.length > 0 && <ProductRail eyebrow="Completá el outfit" title="Combinalo con" lead="Sumá arriba, abajo y calzado y te llevás 10% OFF en el conjunto." cards={outfit} />}
      <ProductRail eyebrow="Parecidos" title="También te puede gustar" cards={related(p)} accent="var(--color-cyan)" />
      <OutfitCta />
    </div>
  );
}

export default function ProductPage(props: PageProps<"/producto/[slug]">) {
  return (
    <div className="pt-6 lg:pt-10">
      <Suspense fallback={<LoadingBlock />}>
        <Body params={props.params} />
      </Suspense>
    </div>
  );
}
