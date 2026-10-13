"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { IconArrow } from "@/components/ui/icons";

type Promo = { img: string; title: string; text: string; href: string; accent: string };

/** Two tall campaign photos that drift against each other while scrolling. */
export function PromoSplit({ promos }: { promos: [Promo, Promo] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const a = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const b = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  return (
    <div ref={ref} className="grid gap-4 md:grid-cols-2">
      {promos.map((p, k) => (
        <Link key={p.href} href={p.href} className="group relative block aspect-[4/5] overflow-hidden rounded-[28px] md:aspect-[4/5] lg:aspect-[5/6]">
          <motion.img
            src={p.img}
            alt=""
            loading="lazy"
            style={{ y: k ? b : a, scale: 1.16 }}
            className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-500 group-hover:brightness-110"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
          <span className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4">
            <span>
              <span className="display block text-[clamp(3rem,7vw,5.5rem)]" style={{ color: p.accent }}>
                {p.title}
              </span>
              <span className="mt-1 block max-w-xs text-sm text-fog">{p.text}</span>
            </span>
            <span className="grid size-14 shrink-0 place-items-center rounded-full text-ink transition-transform duration-300 group-hover:-rotate-45" style={{ background: p.accent }}>
              <IconArrow size={24} />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
