"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart, useUI } from "@/lib/stores";
import { SITE } from "@/lib/site";
import { price } from "@/lib/format";
import type { Nav } from "@/lib/nav";
import { IconArrow, IconBag, IconMenu, IconSearch, IconShirt } from "@/components/ui/icons";
import { Logo } from "./Logo";

type MenuKey = "hombre" | "mujer" | "deportes";
const TOP: { key: MenuKey; label: string; href: string; color: string }[] = [
  { key: "hombre", label: "Hombre", href: "/hombre", color: "var(--color-cyan)" },
  { key: "mujer", label: "Mujer", href: "/mujer", color: "var(--color-magenta)" },
  { key: "deportes", label: "Deportes", href: "/deportes", color: "var(--color-flame)" },
];

const MESSAGES = [
  `${SITE.installments} cuotas sin interés`,
  `Envío gratis desde ${price(SITE.freeShippingFrom)}`,
  "Armá tu outfit completo y llevate 10% OFF",
  "Cambios sin cargo durante 30 días",
  "Fútbol · Tenis · Vóley · Hockey",
];

function Announcement() {
  const row = [...MESSAGES, ...MESSAGES];
  return (
    <div className="relative z-[61] overflow-hidden bg-volt text-ink">
      <div className="flex w-max animate-[marquee_38s_linear_infinite] gap-10 py-2 pl-10 text-[11px] font-extrabold uppercase tracking-[0.18em]">
        {row.map((m, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            {m}
            <span className="inline-block h-2.5 w-5 -skew-x-[25deg] bg-ink/80" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Header({ nav }: { nav: Nav }) {
  const count = useCart((s) => s.lines.reduce((n, l) => n + l.qty, 0));
  const { setCartOpen, setSearchOpen, setMenuOpen } = useUI();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState<MenuKey | null>(null);
  const pathname = usePathname();
  const last = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // close the mega menu on navigation (state adjusted during render, no effect needed)
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setMenu(null);
  }

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 24);
      // phones: the header steps aside while scrolling down and comes back on the way up
      if (window.innerWidth < 1024) setHidden(y > 160 && y > last.current + 4 ? true : y < last.current - 4 ? false : (h) => h);
      else setHidden(false);
      last.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // sticky bars below the header (listing filters) follow it when it steps aside
  useEffect(() => {
    document.documentElement.style.setProperty("--header-visible", hidden ? "0px" : "var(--header-h)");
  }, [hidden]);

  const openMenu = (k: MenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(k);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 140);
  };

  return (
    <>
      <Announcement />
      <header
        className={`sticky top-0 z-[60] transition-[transform,background-color,box-shadow] duration-300 ${hidden ? "-translate-y-full" : ""} ${solid || menu ? "bg-ink/92 shadow-[0_10px_40px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl" : "bg-ink/40 backdrop-blur-md"}`}
        onMouseLeave={scheduleClose}
      >
        <div className="wrap flex h-[var(--header-h)] items-center gap-3 lg:gap-8">
          <button onClick={() => setMenuOpen(true)} className="grid size-11 place-items-center rounded-full hover:bg-white/10 lg:hidden" aria-label="Abrir menú">
            <IconMenu />
          </button>
          <Link href="/" className="mr-auto lg:mr-0" aria-label={`${SITE.name}, inicio`}>
            <Logo />
          </Link>

          <nav aria-label="Principal" className="hidden flex-1 items-center gap-1 lg:flex">
            {TOP.map((t) => (
              <Link
                key={t.key}
                href={t.href}
                onMouseEnter={() => openMenu(t.key)}
                onFocus={() => openMenu(t.key)}
                aria-expanded={menu === t.key}
                aria-current={pathname.startsWith(t.href) ? "page" : undefined}
                className="group relative px-4 py-2 text-[15px] font-extrabold uppercase tracking-wide text-chalk"
                style={{ fontStretch: "85%" }}
              >
                {t.label}
                <span
                  className="absolute inset-x-3 -bottom-0.5 h-[3px] origin-left -skew-x-[20deg] scale-x-0 transition-transform duration-300 group-hover:scale-x-100 group-aria-[current=page]:scale-x-100 group-aria-expanded:scale-x-100"
                  style={{ background: t.color }}
                />
              </Link>
            ))}
            <Link
              href="/armar-outfit"
              onMouseEnter={scheduleClose}
              className="ml-2 flex items-center gap-2 rounded-full bg-volt/10 px-4 py-2 text-[13px] font-extrabold uppercase tracking-wide text-volt ring-1 ring-volt/40 transition hover:bg-volt hover:text-ink"
            >
              <IconShirt size={18} /> Armá tu outfit
            </Link>
          </nav>

          <button
            onClick={() => setSearchOpen(true)}
            className="hidden h-11 w-64 items-center gap-3 rounded-full bg-white/6 px-4 text-left text-sm text-mist ring-1 ring-white/12 transition hover:ring-white/30 xl:flex"
          >
            <IconSearch size={18} className="text-volt" /> ¿Qué estás buscando?
          </button>
          <button onClick={() => setSearchOpen(true)} className="grid size-11 place-items-center rounded-full hover:bg-white/10 xl:hidden" aria-label="Buscar">
            <IconSearch />
          </button>
          <button onClick={() => setCartOpen(true)} className="relative grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label={`Carrito, ${count} productos`}>
            <IconBag />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4 }}
                animate={{ scale: 1 }}
                className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-volt px-1 text-[11px] font-black text-ink"
              >
                {count}
              </motion.span>
            )}
          </button>
        </div>

        {/* desktop mega menu */}
        <AnimatePresence>
          {menu && (
            <motion.div
              key={menu}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              onMouseEnter={() => openMenu(menu)}
              className="absolute inset-x-0 top-full hidden border-t border-white/10 bg-ink/97 backdrop-blur-xl lg:block"
            >
              <div className="wrap grid grid-cols-[1fr_300px] gap-10 py-8">
                <div className={`grid gap-8 ${nav[menu].length > 1 ? "grid-cols-3" : "grid-cols-1"}`}>
                  {nav[menu].map((g) => (
                    <div key={g.title}>
                      <Link href={g.href} className="display mb-3 block text-2xl hover:text-volt">
                        {g.title}
                      </Link>
                      <ul className={`grid gap-1 ${nav[menu].length === 1 ? "grid-cols-4" : ""}`}>
                        {g.links.map((l) => (
                          <li key={l.href}>
                            <Link href={l.href} className="flex items-baseline justify-between gap-3 rounded-lg px-2 py-1.5 text-[15px] text-fog hover:bg-white/6 hover:text-chalk">
                              {l.label}
                              {l.count !== undefined && <span className="text-xs text-mist">{l.count}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <Link href={TOP.find((t) => t.key === menu)!.href} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl">
                  <img src={nav.covers[menu]} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                  <span className="absolute inset-x-5 bottom-5 flex items-center justify-between">
                    <span className="display text-4xl">{TOP.find((t) => t.key === menu)!.label}</span>
                    <span className="grid size-11 place-items-center rounded-full bg-volt text-ink">
                      <IconArrow size={20} />
                    </span>
                  </span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
