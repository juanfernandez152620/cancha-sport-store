"use client";

import { memo, useId, useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Gender } from "@/lib/types";
import type { Outfit } from "@/lib/stores";
import { compose, VIEW, ZONES, zones, type Paint, type Worn, type ZoneId } from "./figure";

type Props = {
  gender: Gender;
  outfit: Outfit;
  activeZone?: ZoneId | null;
  /** zoom the camera to the active zone (used on phones while the picker sheet is open) */
  focus?: boolean;
  onZone?: (z: ZoneId) => void;
  showPins?: boolean;
  className?: string;
};

// viewBoxes the camera moves to when a zone is being dressed on small screens
const FOCUS: Record<ZoneId, string> = {
  cabeza: "40 0 320 330",
  torso: "0 130 400 450",
  piernas: "0 360 400 560",
  pies: "10 650 380 350",
  manos: "-10 360 420 520",
};
const FULL = `0 0 ${VIEW.w} ${VIEW.h}`;

function PaintPath({ p, uid }: { p: Paint; uid: string }) {
  const fill = p.fill?.startsWith("url(#") ? p.fill.replace("url(#", `url(#${uid}`) : (p.fill ?? "none");
  return (
    <path
      d={p.d}
      fill={fill}
      stroke={p.stroke}
      strokeWidth={p.sw}
      opacity={p.op}
      strokeDasharray={p.dash}
      strokeLinecap={p.cap}
      strokeLinejoin={p.cap || p.under ? "round" : undefined}
      paintOrder={p.under ? "stroke" : undefined}
    />
  );
}

function MannequinBase({ gender, outfit, activeZone = null, focus = false, onZone, showPins = true, className }: Props) {
  const uid = useId().replace(/:/g, "");
  const reduce = useReducedMotion();

  const worn = useMemo(() => {
    const w: Worn = {};
    for (const [slot, card] of Object.entries(outfit)) {
      if (card?.gs) w[slot as keyof Worn] = { id: card.id, shape: card.gs[1], main: card.hx, accent: card.hx2 };
    }
    return w;
  }, [outfit]);

  const layers = useMemo(() => compose(gender, worn), [gender, worn]);
  const hit = useMemo(() => zones(gender), [gender]);
  const viewBox = focus && activeZone ? FOCUS[activeZone] : FULL;

  return (
    <motion.svg
      viewBox={FULL}
      animate={{ viewBox }}
      transition={{ type: "spring", stiffness: 140, damping: 24 }}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={`Maniquí ${gender === "hombre" ? "masculino" : "femenino"} con el outfit elegido`}
    >
      <defs>
        <linearGradient id={`${uid}skin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b6bfd0" />
          <stop offset="0.55" stopColor="#9ea8bd" />
          <stop offset="1" stopColor="#8791a8" />
        </linearGradient>
        <radialGradient id={`${uid}spot`} cx="50%" cy="38%" r="60%">
          <stop offset="0" stopColor="#1d3c8f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#071331" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}floor`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#19e3ff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#19e3ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* stage: spotlight, speed stripes, floor ring */}
      <ellipse cx="200" cy="430" rx="230" ry="520" fill={`url(#${uid}spot)`} />
      <g opacity="0.5">
        <path d="M-40 760 L120 520 L150 520 L-10 760 Z" fill="#d4ff1e" opacity=".18" />
        <path d="M330 300 L440 140 L462 140 L352 300 Z" fill="#ff2d87" opacity=".18" />
        <path d="M360 360 L440 240 L452 240 L372 360 Z" fill="#19e3ff" opacity=".2" />
      </g>
      <ellipse cx="200" cy="976" rx="168" ry="22" fill={`url(#${uid}floor)`} />
      <ellipse cx="200" cy="976" rx="140" ry="14" fill="none" stroke="#19e3ff" strokeOpacity=".55" strokeWidth="1.5" />
      <ellipse cx="200" cy="976" rx="100" ry="9" fill="none" stroke="#d4ff1e" strokeOpacity=".35" strokeWidth="1" />

      <AnimatePresence initial={false}>
        {layers.map((g) =>
          g.slot ? (
            <motion.g
              key={g.key}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
            >
              {g.paints.map((p, i) => (
                <PaintPath key={i} p={p} uid={uid} />
              ))}
            </motion.g>
          ) : (
            <g key={g.key}>
              {g.paints.map((p, i) => (
                <PaintPath key={i} p={p} uid={uid} />
              ))}
            </g>
          ),
        )}
      </AnimatePresence>

      {/* tap zones: invisible hit areas plus pulsing pins */}
      {onZone && (
        <g>
          {(Object.keys(hit) as ZoneId[]).map((z) => (
            <path
              key={z}
              d={hit[z].hit}
              fill="transparent"
              className="cursor-pointer outline-none"
              role="button"
              tabIndex={0}
              aria-label={`Elegir ${ZONES[z].label.toLowerCase()}`}
              onClick={() => onZone(z)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onZone(z);
                }
              }}
            />
          ))}
        </g>
      )}
      {onZone && showPins && (
        <g pointerEvents="none">
          {(Object.keys(hit) as ZoneId[]).map((z) => {
            const { x, y } = hit[z].pin;
            const on = activeZone === z;
            return (
              <g key={z} transform={`translate(${x} ${y})`}>
                {!on && (
                  <circle
                    r="13"
                    fill="none"
                    stroke="#d4ff1e"
                    strokeWidth="2"
                    style={{ transformBox: "fill-box", transformOrigin: "center", animation: "pulse-ring 1.8s ease-out infinite" }}
                  />
                )}
                <circle r={on ? 13 : 10} fill={on ? "#d4ff1e" : "#040a1c"} stroke="#d4ff1e" strokeWidth="2.5" />
                <path d="M-4.5 0 H4.5 M0 -4.5 V4.5" stroke={on ? "#040a1c" : "#d4ff1e"} strokeWidth="2.4" strokeLinecap="round" />
              </g>
            );
          })}
        </g>
      )}
    </motion.svg>
  );
}

export const Mannequin = memo(MannequinBase);
