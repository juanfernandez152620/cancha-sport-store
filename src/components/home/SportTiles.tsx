"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { SPORTS } from "@/lib/taxonomy";
import { SPORT_ICON } from "@/components/ui/sport-icons";
import { IconArrow } from "@/components/ui/icons";

type Tile = { sport: "futbol" | "tenis" | "voley" | "hockey"; count: number };

// each sport icon gets its own little move when the tile enters the screen
const MOVES = {
  futbol: { rotate: [0, 360], y: [0, -14, 0] },
  tenis: { rotate: [-30, 18, -6], x: [0, 6, 0] },
  voley: { y: [0, -26, 0], rotate: [0, 180] },
  hockey: { rotate: [-40, 26, 0], x: [-6, 8, 0] },
};

export function SportTiles({ tiles }: { tiles: Tile[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {tiles.map((t, k) => {
        const s = SPORTS[t.sport];
        const Icon = SPORT_ICON[t.sport];
        return (
          <motion.li
            key={t.sport}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: k * 0.08, type: "spring", stiffness: 120, damping: 18 }}
          >
            <Link
              href={`/deportes/${t.sport}`}
              className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-[26px] p-4 ring-1 ring-white/10 transition-shadow hover:ring-2 sm:p-6 lg:aspect-[3/4]"
              style={{ background: `linear-gradient(160deg, color-mix(in oklab, ${s.color} 26%, #0a1a42) 0%, #071331 70%)` }}
            >
              <span className="absolute -right-10 -top-10 size-48 rounded-full opacity-30 blur-3xl transition-opacity duration-500 group-hover:opacity-60" style={{ background: s.color }} />
              <span className="display pointer-events-none absolute -bottom-3 -right-2 text-[7rem] leading-none opacity-[0.07] lg:text-[9rem]">{s.label}</span>
              <motion.span
                className="relative block w-fit"
                style={{ color: s.color }}
                initial={false}
                whileInView={MOVES[t.sport]}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: "easeInOut", delay: 0.3 + k * 0.1 }}
              >
                <Icon size={t.sport === "hockey" ? 92 : 76} className="transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110" />
              </motion.span>
              <span className="relative">
                <span className="display block text-[2.6rem] sm:text-5xl">{s.label}</span>
                <span className="mt-1 hidden text-sm text-fog sm:block">{s.tagline}</span>
                <span className="mt-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-chalk">
                  {t.count} productos
                  <span className="grid size-9 place-items-center rounded-full text-ink transition-transform duration-300 group-hover:translate-x-1" style={{ background: s.color }}>
                    <IconArrow size={18} />
                  </span>
                </span>
              </span>
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
