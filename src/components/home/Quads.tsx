import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import { IconArrow } from "@/components/ui/icons";

export type Quad = {
  title: string;
  href: string;
  cta: string;
  accent: string;
  tiles: { label: string; href: string; count: number; image: string }[];
};

/** "¿Qué querés amoblar?" from the reference store, turned sporty: four groups, four photo tiles each. */
export function Quads({ quads }: { quads: Quad[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {quads.map((q) => (
        <li key={q.title} className="card-surface flex flex-col rounded-[26px] p-5">
          <h3 className="display mb-4 flex items-center gap-2 text-3xl">
            <span className="inline-block h-6 w-2 -skew-x-[20deg]" style={{ background: q.accent }} />
            {q.title}
          </h3>
          <ul className="grid flex-1 grid-cols-2 gap-3">
            {q.tiles.map((t) => (
              <li key={t.href}>
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
          <Link href={q.href} className="mt-4 flex items-center gap-2 text-sm font-bold" style={{ color: q.accent }}>
            {q.cta} <IconArrow size={18} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
