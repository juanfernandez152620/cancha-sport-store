"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

type Bar = { big: string; small: string; color: string };

/** The sketch's second set of bars: anchored right, slanted the other way, sliding in with the scroll. */
export function StatBars({ bars }: { bars: Bar[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 55%"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const x0 = useTransform(p, [0, 0.7], ["105%", "0%"]);
  const x1 = useTransform(p, [0.12, 0.85], ["105%", "0%"]);
  const x2 = useTransform(p, [0.24, 1], ["105%", "0%"]);
  const xs = [x0, x1, x2];

  return (
    <div ref={ref} className="flex flex-col items-end gap-2.5 overflow-hidden py-2 lg:gap-4" aria-label="El local en números">
      {bars.map((b, k) => (
        <motion.div
          key={b.big}
          style={{ x: xs[k], width: `min(${92 - k * 12}%, ${880 - k * 120}px)`, background: b.color, clipPath: "polygon(38px 0, 100% 0, 100% 100%, 0 100%)" }}
          className="flex h-[64px] items-center gap-4 pl-14 pr-[var(--gutter)] text-ink sm:h-[78px] lg:h-[96px]"
        >
          <span className="display text-[2.3rem] sm:text-[3rem] lg:text-[4rem]">{b.big}</span>
          <span className="text-[11px] font-extrabold uppercase leading-tight tracking-[0.14em] opacity-75 sm:text-xs">{b.small}</span>
        </motion.div>
      ))}
    </div>
  );
}
