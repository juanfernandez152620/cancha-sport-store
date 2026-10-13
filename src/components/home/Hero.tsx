"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconArrow, IconChevron } from "@/components/ui/icons";

export type Slide = {
  img: string;
  sizes: number[];
  eyebrow: string;
  title: [string, string];
  text: string;
  cta: string;
  href: string;
  /** object-position for wide and tall crops */
  pos: string;
  posMobile?: string;
  accent: string;
};

const BARS = [
  { label: "Hombre", sub: "Ropa · Calzado", href: "/hombre", color: "var(--color-volt)" },
  { label: "Mujer", sub: "Tops · Calzas", href: "/mujer", color: "var(--color-cyan)" },
  { label: "Deportes", sub: "Fútbol · Hockey", href: "/deportes", color: "var(--color-magenta)" },
];

const DURATION = 6500;

export function Hero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const touch = useRef<number | null>(null);
  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || reduce) return;
    const t = setTimeout(() => go(i + 1), DURATION);
    return () => clearTimeout(t);
  }, [i, paused, reduce, go]);

  const s = slides[i];

  return (
    <section aria-roledescription="carrusel" aria-label="Destacados" className="relative">
      <div className="wrap relative grid lg:grid-cols-[minmax(0,1fr)] lg:pl-[calc(var(--gutter)+120px)]">
        {/* banner */}
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-deep sm:aspect-[16/11] lg:aspect-auto lg:h-[min(76svh,700px)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
            touch.current = null;
          }}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.2, 0.9, 0.1, 1] }}
            >
              <picture>
                <source media="(min-width: 768px)" srcSet={`/banners/${s.img}-${s.sizes[0]}.webp`} />
                <img
                  src={`/banners/${s.img}-${s.sizes[1] ?? s.sizes[0]}.webp`}
                  alt=""
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className="absolute inset-0 h-full w-full object-cover [animation:kenburns_8s_ease-out_forwards] max-md:[object-position:var(--pm)] md:[object-position:var(--pd)]"
                  style={{ ["--pd" as string]: s.pos, ["--pm" as string]: s.posMobile ?? s.pos }}
                />
              </picture>
              <span className="absolute inset-0 bg-[linear-gradient(100deg,rgba(4,10,28,.15)_20%,rgba(4,10,28,.55)_55%,rgba(4,10,28,.92)_100%)] max-md:bg-[linear-gradient(180deg,rgba(4,10,28,0)_30%,rgba(4,10,28,.9)_100%)]" />
            </motion.div>
          </AnimatePresence>

          {/* copy */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-5 pb-24 sm:p-8 sm:pb-28 md:inset-y-0 md:left-auto md:right-0 md:flex md:w-[52%] md:flex-col md:justify-center md:pb-8 lg:pr-14">
            <AnimatePresence mode="wait">
              <motion.div key={i} initial="hidden" animate="show" exit="hidden" variants={{ show: { transition: { staggerChildren: 0.08 } } }}>
                <motion.p variants={line} className="eyebrow mb-3 flex items-center gap-2" style={{ color: s.accent }}>
                  <span className="inline-block h-[3px] w-8 -skew-x-[20deg]" style={{ background: s.accent }} /> {s.eyebrow}
                </motion.p>
                <h1 className="display text-[clamp(3.4rem,10vw,7.6rem)]">
                  <motion.span variants={line} className="block">{s.title[0]}</motion.span>
                  <motion.span variants={line} className="block" style={{ color: s.accent }}>
                    {s.title[1]}
                  </motion.span>
                </h1>
                <motion.p variants={line} className="mt-4 max-w-md text-base text-fog sm:text-lg">
                  {s.text}
                </motion.p>
                <motion.div variants={line} className="mt-6">
                  <Link href={s.href} className="btn btn-volt" style={{ background: s.accent }}>
                    {s.cta} <IconArrow size={20} />
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* progress + arrows */}
          <div className="absolute right-5 top-5 z-10 flex items-center gap-3 lg:bottom-7 lg:right-7 lg:top-auto">
            <div className="flex gap-1.5" role="tablist" aria-label="Elegir banner">
              {slides.map((sl, k) => (
                <button key={sl.img} role="tab" aria-selected={k === i} aria-label={`Banner ${k + 1}`} onClick={() => go(k)} className="relative h-1.5 w-8 overflow-hidden rounded-full bg-white/25 sm:w-12">
                  {k === i && (
                    <motion.span
                      key={paused ? "hold" : "run"}
                      className="absolute inset-y-0 left-0 bg-chalk"
                      initial={{ width: paused || reduce ? "100%" : "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: paused || reduce ? 0 : DURATION / 1000, ease: "linear" }}
                    />
                  )}
                  {k < i && <span className="absolute inset-0 bg-chalk/70" />}
                </button>
              ))}
            </div>
            <button onClick={() => go(i - 1)} className="hidden size-11 place-items-center rounded-full bg-ink/60 ring-1 ring-white/20 backdrop-blur hover:bg-ink sm:grid" aria-label="Anterior">
              <IconChevron dir="left" size={20} />
            </button>
            <button onClick={() => go(i + 1)} className="hidden size-11 place-items-center rounded-full bg-ink/60 ring-1 ring-white/20 backdrop-blur hover:bg-ink sm:grid" aria-label="Siguiente">
              <IconChevron size={20} />
            </button>
          </div>
        </div>

        {/* the three speed bars: overlap the banner on desktop, step down under it on phones */}
        <nav aria-label="Secciones" className="relative z-20 -mt-14 flex flex-col gap-2.5 sm:-mt-16 lg:absolute lg:left-[var(--gutter)] lg:top-1/2 lg:mt-0 lg:w-[min(46%,560px)] lg:-translate-y-1/2 lg:gap-4">
          {BARS.map((b, k) => (
            <motion.div
              key={b.href}
              initial={{ x: "-115%", skewX: -18 }}
              animate={{ x: 0, skewX: 0 }}
              transition={{ delay: 0.25 + k * 0.14, type: "spring", stiffness: 120, damping: 18 }}
              style={{ width: `calc(100% - ${k * 9}%)`, marginLeft: `${k * 4.5}%` }}
              className="lg:!ml-0"
            >
              <Link
                href={b.href}
                className="group relative flex h-[60px] items-center gap-4 overflow-hidden pl-6 pr-10 text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,.9)] transition-[transform,padding] duration-300 hover:pl-9 sm:h-[68px] lg:h-[86px]"
                style={{ background: b.color, clipPath: "polygon(0 0, 100% 0, calc(100% - 34px) 100%, 0 100%)" }}
              >
                <span className="display text-[2.15rem] sm:text-[2.6rem] lg:text-[3.4rem]">{b.label}</span>
                <span className="hidden text-xs font-extrabold uppercase tracking-[0.16em] opacity-70 sm:block">{b.sub}</span>
                <IconArrow size={26} className="ml-auto transition-transform duration-300 group-hover:translate-x-1.5" strokeWidth={2.6} />
                <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-[20deg] bg-white/35 [animation:shine_4.5s_ease-in-out_infinite]" style={{ animationDelay: `${1.2 + k * 0.4}s` }} />
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>
    </section>
  );
}

const line = {
  hidden: { opacity: 0, y: 26, skewY: 3 },
  show: { opacity: 1, y: 0, skewY: 0, transition: { type: "spring" as const, stiffness: 140, damping: 18 } },
};
