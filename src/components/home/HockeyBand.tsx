"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { IconArrow } from "@/components/ui/icons";

/**
 * Hockey gets its own band: a big stick that swings with the scroll and sends the ball flying.
 * The stick pivots on its grip, so its transform is written directly to the element.
 */
export function HockeyBand({ count }: { count: number }) {
  const ref = useRef<HTMLElement>(null);
  const stick = useRef<SVGGElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 22 });
  const swing = useTransform(p, [0.15, 0.48, 0.62], [-62, 6, 30]);
  const ballX = useTransform(p, [0.46, 0.75], [0, -620]);
  const ballY = useTransform(p, [0.46, 0.75], [0, -170]);
  const trail = useTransform(p, [0.46, 0.55, 0.75], [0, 1, 0.3]);
  const title = useTransform(p, [0.1, 0.5], [80, 0]);

  const place = (deg: number) => stick.current?.setAttribute("transform", `translate(430 40) rotate(${deg.toFixed(2)})`);
  useMotionValueEvent(swing, "change", place);

  return (
    <section ref={ref} className="relative overflow-hidden py-16 lg:py-24" aria-labelledby="hockey-title">
      <div className="absolute inset-0 -skew-y-3 bg-[linear-gradient(120deg,#ff8a1e_0%,#ff2d87_100%)] opacity-95" />
      <div className="absolute inset-0 -skew-y-3 bg-[repeating-linear-gradient(90deg,transparent_0_118px,rgba(4,10,28,.12)_118px_120px)]" />
      <div className="wrap relative grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
        <motion.div style={{ x: title }} className="text-ink">
          <p className="eyebrow mb-3">Hockey sobre césped</p>
          <h2 id="hockey-title" className="display text-[clamp(3.6rem,12vw,9rem)]">
            El palo
            <br />
            es tuyo
          </h2>
          <p className="mt-4 max-w-md text-lg font-semibold">
            Palos de carbono, bochas, canilleras, bucales y paleros. Todo lo que pide la cancha de agua, en un solo lugar.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/deportes/hockey" className="btn bg-ink text-chalk hover:bg-night">
              Ver {count} productos de hockey <IconArrow size={20} />
            </Link>
            <Link href="/hombre/accesorios/palos-de-hockey" className="btn bg-white/25 text-ink hover:bg-white/40">
              Palos
            </Link>
          </div>
        </motion.div>

        <svg viewBox="0 0 600 560" className="mx-auto w-full max-w-[560px] overflow-visible" aria-hidden>
          <ellipse cx="300" cy="520" rx="260" ry="22" fill="#040a1c" opacity=".25" />
          <g ref={(el) => { stick.current = el; place(swing.get()); }} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M0 0 L0 380" stroke="#040a1c" strokeWidth="24" />
            <path d="M0 0 L0 120" stroke="#eef3ff" strokeWidth="26" />
            {Array.from({ length: 7 }, (_, i) => (
              <path key={i} d={`M-12 ${14 + i * 15} L12 ${8 + i * 15}`} stroke="#040a1c" strokeOpacity=".35" strokeWidth="3" />
            ))}
            <path d="M0 200 L0 250" stroke="#d4ff1e" strokeWidth="25" />
            <path d="M0 380 C0 450 -26 492 -82 492 C-126 492 -142 452 -118 428 C-100 410 -74 420 -66 440" stroke="#040a1c" strokeWidth="26" />
            <path d="M-8 400 C-8 450 -34 478 -80 480" stroke="#d4ff1e" strokeWidth="6" />
            <text x="0" y="300" transform="rotate(-90 0 300)" textAnchor="middle" fill="#d4ff1e" stroke="none" fontSize="24" fontWeight="900" fontStyle="italic" letterSpacing="3" fontFamily="var(--font-archivo)">
              CANCHA
            </text>
          </g>
          <motion.g style={{ x: ballX, y: ballY }}>
            <motion.path d="M240 500 H560" stroke="#eef3ff" strokeWidth="16" strokeLinecap="round" style={{ pathLength: trail, opacity: 0.5 }} />
            <circle cx="240" cy="500" r="20" fill="#eef3ff" />
            <circle cx="240" cy="500" r="20" fill="none" stroke="#040a1c" strokeOpacity=".3" strokeWidth="2" />
          </motion.g>
        </svg>
      </div>
    </section>
  );
}
