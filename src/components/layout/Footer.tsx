import Link from "next/link";
import { SITE, whatsappLink } from "@/lib/site";
import { price } from "@/lib/format";
import type { Nav } from "@/lib/nav";
import { IconCard, IconInstagram, IconStore, IconSwap, IconTruck, IconWhatsapp } from "@/components/ui/icons";
import { IconFutbol, IconHockey, IconTenis, IconVoley } from "@/components/ui/sport-icons";
import { Logo } from "./Logo";

const PERKS = [
  { icon: IconTruck, title: "Envíos a todo el país", text: `Gratis desde ${price(SITE.freeShippingFrom)}` },
  { icon: IconCard, title: `${SITE.installments} cuotas sin interés`, text: "Con todas las tarjetas" },
  { icon: IconSwap, title: "Cambios sin vueltas", text: "30 días para cambiar talle" },
  { icon: IconStore, title: "Retirá en el local", text: SITE.city },
];

export function Perks() {
  return (
    <ul className="wrap grid grid-cols-2 gap-3 lg:grid-cols-4">
      {PERKS.map(({ icon: Icon, title, text }) => (
        <li key={title} className="card-surface flex items-start gap-3 rounded-2xl p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-volt/12 text-volt">
            <Icon size={20} />
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight">{title}</span>
            <span className="text-xs text-mist">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Footer({ nav }: { nav: Nav }) {
  const col = (title: string, links: { label: string; href: string }[]) => (
    <div>
      <p className="eyebrow mb-4 text-mist">{title}</p>
      <ul className="grid gap-2 text-sm">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-fog hover:text-volt">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-ink/80 pt-14 backdrop-blur">
      <div className="wrap grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm text-fog">{SITE.description}</p>
          <div className="flex gap-3 text-volt" aria-hidden>
            <IconFutbol size={30} />
            <IconTenis size={30} />
            <IconVoley size={30} />
            <IconHockey size={30} />
          </div>
          <div className="flex gap-2">
            <a href={whatsappLink(`Hola ${SITE.name}!`)} target="_blank" rel="noopener" className="grid size-11 place-items-center rounded-full bg-white/8 hover:bg-white/15" aria-label="WhatsApp">
              <IconWhatsapp size={20} />
            </a>
            <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noopener" className="grid size-11 place-items-center rounded-full bg-white/8 hover:bg-white/15" aria-label="Instagram">
              <IconInstagram size={20} />
            </a>
          </div>
        </div>
        {col("Hombre", nav.hombre.map((g) => ({ label: g.title, href: g.href })).concat({ label: "Ver todo", href: "/hombre" }))}
        {col("Mujer", nav.mujer.map((g) => ({ label: g.title, href: g.href })).concat({ label: "Ver todo", href: "/mujer" }))}
        {col("Deportes", nav.deportes[0].links.slice(0, 6))}
      </div>
      <p aria-hidden className="display pointer-events-none mt-12 select-none whitespace-nowrap text-center text-[23vw] leading-[0.75] text-white/[0.04]">
        {SITE.name}
      </p>
      <div className="border-t border-white/10 py-5">
        <p className="wrap text-center text-xs text-mist">
          © {SITE.name} {SITE.tagline} · Sitio de demostración: los productos, fotos y precios de referencia provienen de nike.com.ar.
        </p>
      </div>
    </footer>
  );
}
