"use client";

import Link from "next/link";
import { motion, type TargetAndTransition } from "motion/react";
import { SPORTS } from "@/lib/taxonomy";
import type { SportSlug } from "@/lib/types";
import { SPORT_ICON } from "@/components/ui/sport-icons";
import { IconShirt } from "@/components/ui/icons";

const LOOPS: Record<SportSlug, TargetAndTransition> = {
  futbol: { rotate: [0, 360] },
  tenis: { rotate: [-24, 16, -24] },
  voley: { y: [0, -18, 0], rotate: [0, 120, 0] },
  hockey: { rotate: [-34, 22, -34] },
  running: { x: [-6, 6, -6] },
  training: { y: [0, -8, 0] },
  basquet: { y: [0, -24, 0] },
};

export function SportHero({ sport, count, gearCount }: { sport: SportSlug; count: number; gearCount: number }) {
  const s = SPORTS[sport];
  const Icon = SPORT_ICON[sport];
  return (
    <section className="wrap">
      <div
        className="relative grid items-center gap-6 overflow-hidden rounded-[32px] p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr]"
        style={{ background: `linear-gradient(130deg, color-mix(in oklab, ${s.color} 30%, #0a1a42) 0%, #071331 65%)` }}
      >
        <span className="display pointer-events-none absolute -bottom-6 right-0 text-[28vw] leading-none opacity-[0.06] lg:text-[16rem]">{s.label}</span>
        <div className="relative">
          <p className="eyebrow mb-3" style={{ color: s.color }}>
            Deportes
          </p>
          <h1 className="display text-[clamp(4rem,14vw,9rem)]">{s.label}</h1>
          <p className="mt-3 max-w-md text-lg text-fog">{s.tagline}.</p>
          <dl className="mt-6 flex gap-8">
            <div>
              <dt className="text-xs uppercase tracking-widest text-mist">Productos</dt>
              <dd className="display text-4xl">{count}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-mist">Equipamiento</dt>
              <dd className="display text-4xl">{gearCount}</dd>
            </div>
          </dl>
          <Link href="/armar-outfit" className="btn btn-volt mt-6" style={{ background: s.color }}>
            <IconShirt size={20} /> Armá tu outfit de {s.label.toLowerCase()}
          </Link>
        </div>
        <motion.div
          className="relative mx-auto"
          style={{ color: s.color }}
          animate={LOOPS[sport]}
          transition={{ duration: sport === "futbol" ? 9 : 3.2, repeat: Infinity, ease: sport === "futbol" ? "linear" : "easeInOut" }}
        >
          <Icon size={sport === "hockey" ? 280 : 230} strokeWidth={2.4} />
        </motion.div>
      </div>
    </section>
  );
}
