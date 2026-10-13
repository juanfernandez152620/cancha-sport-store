"use client";

import { useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

/**
 * Fixed line-art stage behind every page. As the page scrolls, each sport takes its turn:
 * football pitch → hockey stick swing (the big one) → tennis rally → volleyball over the net.
 */
export function SportsBackdrop() {
  const { scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 26, mass: 0.35 });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_15%_0%,#0d2a7a_0%,transparent_60%),radial-gradient(60%_45%_at_100%_35%,#3a0d52_0%,transparent_60%),radial-gradient(70%_50%_at_0%_100%,#06305e_0%,transparent_60%)] opacity-70" />
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 hidden h-full w-full lg:block">
        <Scene p={p} wide />
      </svg>
      <svg viewBox="0 0 500 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full lg:hidden">
        <Scene p={p} wide={false} />
      </svg>
      {/* film grain keeps the gradients from banding */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22160%22 height=%22160%22><filter id=%22n%22><feTurbulence baseFrequency=%22.9%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')]" />
    </div>
  );
}

const useWindow = (p: MotionValue<number>, a: number, b: number, max = 1) =>
  // fade in over a → a+0.06, hold, fade out over b-0.06 → b
  useTransform(p, [a, a + 0.06, b - 0.06, b], [0, max, max, 0]);

function Scene({ p, wide }: { p: MotionValue<number>; wide: boolean }) {
  const W = wide ? 1000 : 500;

  // ---- speed slashes drifting at different depths
  const s1 = useTransform(p, [0, 1], [0, -520]);
  const s2 = useTransform(p, [0, 1], [0, -260]);
  const s3 = useTransform(p, [0, 1], [120, -800]);

  // ---- football (0 → 0.3)
  const fOp = useWindow(p, -0.06, 0.3, 0.38);
  const pitch = useTransform(p, [0, 0.16], [0.15, 1]);
  const ballX = useTransform(p, [0, 0.3], wide ? [80, 940] : [40, 470]);
  const ballR = useTransform(p, [0, 0.3], [0, 720]);

  // ---- hockey (0.18 → 0.58): the stick swings through, the ball flies off with a trail
  const hOp = useWindow(p, 0.18, 0.58, 0.6);
  const swing = useTransform(p, [0.2, 0.36, 0.44], [-48, 4, 34]);
  const hitX = useTransform(p, [0.36, 0.5], wide ? [700, -140] : [330, -120]);
  const hitY = useTransform(p, [0.36, 0.5], wide ? [770, 640] : [800, 700]);
  const trail = useTransform(p, [0.36, 0.42, 0.5], [0, 1, 0.2]);

  // ---- tennis (0.48 → 0.8): court lines draw, a ball arcs over
  const tOp = useWindow(p, 0.48, 0.8, 0.55);
  const court = useTransform(p, [0.5, 0.64], [0, 1]);
  const tX = useTransform(p, [0.52, 0.78], wide ? [120, 860] : [60, 440]);
  const tY = useTransform(p, [0.52, 0.6, 0.66, 0.72, 0.78], [760, 380, 610, 300, 520]);

  // ---- volleyball (0.74 → 1.05)
  const vOp = useWindow(p, 0.74, 1.08, 0.6);
  const vY = useTransform(p, [0.76, 1], [900, 260]);
  const vSpin = useTransform(p, [0.76, 1], [0, 540]);
  const net = useTransform(p, [0.76, 0.9], [0, 1]);

  const right = wide ? 800 : 380;
  const top = wide ? 120 : 160;
  // the stick pivots around its grip, so its transform is written straight onto the element
  const stick = useRef<SVGGElement>(null);
  const place = (deg: number) => stick.current?.setAttribute("transform", `translate(${right} ${top}) rotate(${deg.toFixed(2)})`);
  useMotionValueEvent(swing, "change", place);

  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* speed slashes */}
      <motion.g style={{ y: s1 }} opacity={0.5}>
        <path d={`M${W * 0.06} 340 l90 0 -60 90 -90 0 Z`} fill="#d4ff1e" opacity=".12" />
        <path d={`M${W * 0.82} 620 l120 0 -80 120 -120 0 Z`} fill="#19e3ff" opacity=".1" />
      </motion.g>
      <motion.g style={{ y: s2 }} opacity={0.5}>
        <path d={`M${W * 0.9} 180 l60 0 -40 60 -60 0 Z`} fill="#ff2d87" opacity=".14" />
        <path d={`M${W * 0.12} 980 l70 0 -46 70 -70 0 Z`} fill="#19e3ff" opacity=".12" />
      </motion.g>
      <motion.g style={{ y: s3 }} opacity={0.4}>
        <path d={`M${W * 0.7} 900 l40 0 -26 40 -40 0 Z`} fill="#d4ff1e" opacity=".18" />
        <path d={`M${W * 0.25} 1300 l50 0 -32 50 -50 0 Z`} fill="#ff2d87" opacity=".16" />
      </motion.g>

      {/* football: halfway line, centre circle, ball rolling across */}
      <motion.g style={{ opacity: fOp }} stroke="#d4ff1e" strokeWidth={2.2}>
        <motion.path d={`M-20 520 H${W + 20}`} style={{ pathLength: pitch }} />
        <motion.circle cx={W / 2} cy={520} r={wide ? 190 : 130} style={{ pathLength: pitch }} />
        <circle cx={W / 2} cy={520} r={6} fill="#d4ff1e" />
        <motion.path d={wide ? "M-20 180 H160 V860 H-20" : "M-20 230 H90 V810 H-20"} style={{ pathLength: pitch }} opacity={0.6} />
        <motion.path d={wide ? `M${W + 20} 180 H${W - 160} V860 H${W + 20}` : `M${W + 20} 230 H${W - 90} V810 H${W + 20}`} style={{ pathLength: pitch }} opacity={0.6} />
        <motion.g style={{ x: ballX, rotate: ballR, y: 880 }}>
          <circle r={34} strokeWidth={2.5} />
          <path d="M0 -12 l11 8 -4 13 h-14 l-4 -13 Z M0 -12 V-34 M11 -4 l20 -8 M7 9 l12 18 M-7 9 l-12 18 M-11 -4 l-20 -8" strokeWidth={2} />
        </motion.g>
      </motion.g>

      {/* hockey: the hero motif */}
      <motion.g style={{ opacity: hOp }}>
        <g ref={(el) => { stick.current = el; place(swing.get()); }}>
          {/* grip + shaft + J-shaped head */}
          <path d="M0 0 L0 560" stroke="#ff8a1e" strokeWidth={wide ? 16 : 13} />
          <path d="M0 0 L0 170" stroke="#0b1430" strokeWidth={wide ? 18 : 15} />
          <path d="M0 10 L0 160" stroke="#ff8a1e" strokeWidth={2} strokeDasharray="6 10" opacity={0.8} />
          <path d="M0 300 L0 360" stroke="#d4ff1e" strokeWidth={wide ? 17 : 14} />
          <path d="M0 560 C0 640 -30 690 -84 690 C-128 690 -146 650 -122 624 C-104 606 -78 616 -70 636" stroke="#ff8a1e" strokeWidth={wide ? 18 : 15} />
          <path d="M-6 580 C-6 640 -34 674 -82 676" stroke="#d4ff1e" strokeWidth={4} />
        </g>
        {/* ball streak */}
        <motion.g style={{ x: hitX, y: hitY }}>
          <motion.path d="M0 0 H260" stroke="url(#streak)" strokeWidth={14} style={{ pathLength: trail }} />
          <circle r={15} fill="#f3f3f1" />
          <circle r={15} stroke="#ff8a1e" strokeWidth={2} />
        </motion.g>
      </motion.g>

      {/* tennis: court in perspective + ball arc */}
      <motion.g style={{ opacity: tOp }} stroke="#19e3ff" strokeWidth={2}>
        <motion.path
          d={wide ? "M80 940 L330 520 L670 520 L920 940 Z M140 940 L360 560 M860 940 L640 560 M500 520 V940 M230 790 H770" : "M20 960 L150 560 L350 560 L480 960 Z M250 560 V960 M90 800 H410"}
          style={{ pathLength: court }}
        />
        <motion.path d={wide ? "M300 600 H700" : "M140 610 H360"} stroke="#eef3ff" strokeWidth={3} strokeDasharray="4 6" style={{ pathLength: court }} />
        <motion.g style={{ x: tX, y: tY }}>
          <circle r={16} fill="#d4ff1e" stroke="none" />
          <path d="M-14 -6 C-4 -4 -4 8 -8 14 M14 6 C4 4 4 -8 8 -14" stroke="#fff" strokeWidth={2} />
        </motion.g>
      </motion.g>

      {/* volleyball: net + spinning ball rising */}
      <motion.g style={{ opacity: vOp }} stroke="#ff2d87" strokeWidth={1.6}>
        <motion.path
          d={wide ? "M120 300 H880 M120 380 H880 M120 300 V560 M880 300 V560 " + Array.from({ length: 19 }, (_, i) => `M${160 + i * 40} 300 V380`).join(" ") : "M40 300 H460 M40 370 H460 M40 300 V540 M460 300 V540 " + Array.from({ length: 10 }, (_, i) => `M${70 + i * 40} 300 V370`).join(" ")}
          style={{ pathLength: net }}
        />
        <motion.g style={{ x: wide ? 640 : 300, y: vY, rotate: vSpin }}>
          <circle r={wide ? 56 : 44} strokeWidth={2.6} />
          <path d="M0 0 C-18 -14 -22 -34 -14 -52 M0 0 C22 -2 38 8 46 28 M0 0 C0 22 -12 38 -30 44" strokeWidth={2.2} />
        </motion.g>
      </motion.g>

      <defs>
        <linearGradient id="streak" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ff8a1e" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff8a1e" stopOpacity="0" />
        </linearGradient>
      </defs>
    </g>
  );
}
