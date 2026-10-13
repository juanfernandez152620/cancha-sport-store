import type { Metadata } from "next";
import { OutfitBuilder } from "@/components/outfit/OutfitBuilder";
import { Crumbs } from "@/components/page/PageBits";
import { IconBag, IconShirt, IconSpark } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Armá tu outfit",
  description: "Probador virtual: vestí al maniquí con ropa real del local y llevate 10% OFF comprando el outfit completo.",
};

const STEPS = [
  { icon: IconShirt, title: "Vestí al maniquí", text: "Tocá la cabeza, el torso, las piernas, los pies o las manos y elegí prendas reales del local." },
  { icon: IconSpark, title: "O dejá que te armemos uno", text: "Elegí tu deporte, tu posición y tus colores: te proponemos tres combos listos." },
  { icon: IconBag, title: "Llevate el outfit con 10% OFF", text: "Con arriba, abajo y calzado el descuento se aplica solo en el carrito." },
];

export default function OutfitPage() {
  return (
    <div className="flex flex-col gap-16 pb-8 pt-6 lg:pt-10">
      <div>
        <Crumbs items={[{ label: "Armá tu outfit" }]} />
        <OutfitBuilder headingLevel={1} />
      </div>
      <section className="wrap" aria-labelledby="como">
        <h2 id="como" className="display mb-6 text-[clamp(2.4rem,6vw,4rem)]">
          Cómo funciona
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="card-surface relative overflow-hidden rounded-3xl p-6">
              <span className="display absolute -right-2 -top-4 text-[7rem] leading-none text-white/[0.05]">0{i + 1}</span>
              <Icon size={32} className="text-volt" />
              <p className="mt-4 text-xl font-bold">{title}</p>
              <p className="mt-1 text-fog">{text}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
