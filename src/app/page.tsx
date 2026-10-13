import { Hero, type Slide } from "@/components/home/Hero";
import { StatBars } from "@/components/home/StatBars";
import { SportTiles } from "@/components/home/SportTiles";
import { Quads, type Quad } from "@/components/home/Quads";
import { PromoSplit } from "@/components/home/PromoSplit";
import { HockeyBand } from "@/components/home/HockeyBand";
import { ProductRail } from "@/components/product/ProductRail";
import { OutfitBuilder } from "@/components/outfit/OutfitBuilder";
import { Perks } from "@/components/layout/Footer";
import { countFor, PRODUCTS, rail, subsFor } from "@/lib/catalog";
import { MAIN_SPORTS } from "@/lib/taxonomy";
import type { Dept, Gender } from "@/lib/types";

const SLIDES: Slide[] = [
  {
    img: "hero-futbol", sizes: [1520, 900], eyebrow: "Fútbol · Temporada 26/27", title: ["Jugá", "de noche"],
    text: "Camisetas, botines y pelotas para dejar todo en la cancha.", cta: "Ver fútbol", href: "/deportes/futbol",
    pos: "35% 45%", posMobile: "50% 40%", accent: "#d4ff1e",
  },
  {
    img: "hero-mujer", sizes: [1920, 900], eyebrow: "Mujer · Nueva colección", title: ["Moverse", "con estilo"],
    text: "Tops, calzas y zapatillas pensadas para entrenar y para la calle.", cta: "Ver mujer", href: "/mujer",
    pos: "20% 30%", posMobile: "50% 25%", accent: "#19e3ff",
  },
  {
    img: "hero-hombre", sizes: [1520, 900], eyebrow: "Hombre · Camisetas", title: ["Nacidos", "para competir"],
    text: "Las camisetas de los clubes que más se juegan, en todos los talles.", cta: "Ver hombre", href: "/hombre",
    pos: "30% 35%", posMobile: "40% 30%", accent: "#ff2d87",
  },
  {
    img: "hero-running", sizes: [1920, 900], eyebrow: "Running", title: ["Cada km", "cuenta"],
    text: "Zapatillas con amortiguación para tus fondos y tus pasadas.", cta: "Ver running", href: "/deportes/running",
    pos: "40% 60%", posMobile: "38% 60%", accent: "#d4ff1e",
  },
  {
    img: "hero-training", sizes: [1520, 900], eyebrow: "Training", title: ["Entrená", "sin excusas"],
    text: "Ropa que respira y accesorios para el gimnasio o el patio de tu casa.", cta: "Ver training", href: "/deportes/training",
    pos: "30% 40%", posMobile: "45% 40%", accent: "#ff8a1e",
  },
];

function tilesFor(g: Gender, d: Dept, slugs: string[]) {
  const subs = subsFor(g, d);
  return slugs
    .map((slug) => subs.find((s) => s.slug === slug))
    .filter(Boolean)
    .map((s) => ({ label: s!.label, href: `/${g}/${d}/${s!.slug}`, count: s!.count, image: s!.cover }));
}

export default function Home() {
  const quads: Quad[] = [
    { title: "Para él", href: "/hombre", cta: "Ver todo hombre", accent: "var(--color-cyan)", tiles: tilesFor("hombre", "ropa", ["remeras", "camisetas", "shorts", "buzos"]) },
    { title: "Para ella", href: "/mujer", cta: "Ver todo mujer", accent: "var(--color-magenta)", tiles: tilesFor("mujer", "ropa", ["tops-deportivos", "calzas", "remeras", "camperas"]) },
    { title: "Calzado", href: "/hombre/calzado", cta: "Ver calzado", accent: "var(--color-volt)", tiles: tilesFor("hombre", "calzado", ["botines", "running", "urbanas", "deportivas"]) },
    { title: "Equipamiento", href: "/deportes", cta: "Ver deportes", accent: "var(--color-flame)", tiles: tilesFor("hombre", "accesorios", ["palos-de-hockey", "pelotas", "raquetas", "guantes"]) },
  ];

  return (
    <div className="flex flex-col gap-20 pb-10 pt-4 lg:gap-28 lg:pt-8">
      <Hero slides={SLIDES} />

      <OutfitBuilder />

      <section aria-labelledby="deportes-title" className="flex flex-col gap-10">
        <StatBars
          bars={[
            { big: `+${Math.floor(PRODUCTS.length / 100) * 100}`, small: "productos para entrenar y jugar", color: "var(--color-volt)" },
            { big: "4 deportes", small: "fútbol · tenis · vóley · hockey", color: "var(--color-cyan)" },
            { big: "10% OFF", small: "llevando el outfit completo", color: "var(--color-magenta)" },
          ]}
        />
        <div className="wrap">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 id="deportes-title" className="display text-[clamp(2.6rem,7vw,5rem)]">
              Elegí tu <span className="text-flame">deporte</span>
            </h2>
          </div>
          <SportTiles tiles={MAIN_SPORTS.map((s) => ({ sport: s, count: countFor({ sport: s }) }))} />
        </div>
      </section>

      <section aria-labelledby="quads-title" className="wrap">
        <h2 id="quads-title" className="display mb-6 text-[clamp(2.6rem,7vw,5rem)]">
          ¿Qué estás <span className="text-cyan">buscando?</span>
        </h2>
        <Quads quads={quads} />
      </section>

      <ProductRail eyebrow="Recién llegados" title="Lanzamientos" lead="Lo último que entró al local, para hombre y mujer." href="/hombre" cards={rail("new", {}, 16)} />

      <section className="wrap">
        <PromoSplit
          promos={[
            { img: "/banners/hombre-retrato-1-818.webp", title: "Hombre", text: "Remeras, shorts y zapatillas para todos los días.", href: "/hombre", accent: "#19e3ff" },
            { img: "/banners/mujer-retrato-3-818.webp", title: "Mujer", text: "Tops, calzas y camperas que acompañan cada movimiento.", href: "/mujer", accent: "#ff2d87" },
          ]}
        />
      </section>

      <ProductRail eyebrow="Fútbol" title="Botines y camisetas" lead="Para el picado del jueves o el torneo del sábado." href="/deportes/futbol" cards={rail(null, { sport: "futbol" }, 16)} />

      <HockeyBand count={countFor({ sport: "hockey" })} />

      <ProductRail eyebrow="Hockey" title="Equipate para la cancha" href="/deportes/hockey" cards={rail(null, { sport: "hockey" }, 16)} accent="var(--color-flame)" />

      <ProductRail eyebrow="Oportunidades" title="Ofertas" lead="Precios rebajados mientras dure el stock." href="/hombre" cards={rail("sale", {}, 16)} accent="var(--color-magenta)" />

      <Perks />
    </div>
  );
}
