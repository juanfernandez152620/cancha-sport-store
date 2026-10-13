"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Card, Gender } from "@/lib/types";
import { SPORTS } from "@/lib/taxonomy";
import { Sheet } from "@/components/ui/Sheet";
import { IconArrow, IconChevron } from "@/components/ui/icons";
import { SPORT_ICON } from "@/components/ui/sport-icons";
import { ComboCard } from "./ComboCard";
import { buildCombos, PALETTES, POSITIONS, USES, type Answers, type QuizSport, type Use } from "./quiz";

type Props = {
  open: boolean;
  onClose: () => void;
  gender: Gender;
  onGender: (g: Gender) => void;
  items: Card[] | null;
  onTry: (gender: Gender, items: Card[]) => void;
  initialSport?: QuizSport;
};

const STEPS = ["Deporte", "Posición", "Colores", "Uso"] as const;

export function SportQuiz({ open, onClose, gender, onGender, items, onTry, initialSport }: Props) {
  const [step, setStep] = useState(initialSport ? 1 : 0);
  const [a, setA] = useState<Partial<Answers>>(initialSport ? { sport: initialSport } : {});

  const done = step >= STEPS.length;
  const combos = useMemo(
    () => (done && items && a.sport && a.position && a.palette && a.use ? buildCombos(items, gender, a as Answers) : []),
    [done, items, gender, a],
  );

  const choose = (patch: Partial<Answers>) => {
    setA((x) => ({ ...x, ...patch }));
    setStep((s) => s + 1);
  };
  const restart = () => {
    setStep(0);
    setA({});
  };

  const title = (
    <div>
      <p className="eyebrow text-volt">Outfit por deporte</p>
      <p className="display text-3xl">{done ? "Tus combos" : `${step + 1}. ${STEPS[step]}`}</p>
    </div>
  );

  return (
    <Sheet open={open} onClose={onClose} side="bottom" desktopSide="center" label="Armar outfit por deporte" title={title}>
      <div className="px-5 pb-6">
        {/* progress */}
        <div className="mb-5 flex gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step || done ? "bg-volt" : i === step ? "bg-volt/50" : "bg-white/10"}`} />
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex rounded-full bg-white/6 p-1 text-sm font-bold">
            {(["hombre", "mujer"] as Gender[]).map((g) => (
              <button key={g} onClick={() => onGender(g)} aria-pressed={gender === g} className="rounded-full px-4 py-1.5 text-fog aria-pressed:bg-chalk aria-pressed:text-ink">
                {g === "hombre" ? "Hombre" : "Mujer"}
              </button>
            ))}
          </div>
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="flex items-center gap-1 text-sm font-semibold text-fog hover:text-chalk">
              <IconChevron dir="left" size={16} /> Volver
            </button>
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}>
            {step === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {(["futbol", "tenis", "voley", "hockey"] as QuizSport[]).map((s) => {
                  const Icon = SPORT_ICON[s];
                  return (
                    <button
                      key={s}
                      onClick={() => choose({ sport: s })}
                      className="group relative flex aspect-[5/4] flex-col justify-between overflow-hidden rounded-3xl bg-deep p-4 text-left ring-1 ring-white/10 transition hover:ring-2 sm:aspect-[2/1]"
                      style={{ ["--c" as string]: SPORTS[s].color }}
                    >
                      <span className="absolute -right-6 -top-6 size-28 rounded-full opacity-20 blur-2xl" style={{ background: SPORTS[s].color }} />
                      <Icon size={52} style={{ color: SPORTS[s].color }} className="transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
                      <span className="display text-3xl">{SPORTS[s].label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {step === 1 && a.sport && (
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {POSITIONS[a.sport].map((p) => (
                  <li key={p.id}>
                    <button onClick={() => choose({ position: p.id })} className="flex w-full items-center gap-3 rounded-2xl bg-deep p-4 text-left ring-1 ring-white/10 hover:ring-volt">
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-bold text-chalk">{p.label}</span>
                        <span className="block text-sm text-mist">{p.hint}</span>
                      </span>
                      <IconArrow size={18} className="shrink-0 text-volt" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {step === 2 && (
              <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {PALETTES.map((p) => (
                  <li key={p.id}>
                    <button onClick={() => choose({ palette: p.id })} className="flex w-full flex-col gap-3 rounded-2xl bg-deep p-4 text-left ring-1 ring-white/10 hover:ring-volt">
                      <span className="flex -space-x-2">
                        {p.colors.map((c) => (
                          <span key={c} className="size-9 rounded-full ring-2 ring-deep" style={{ background: c }} />
                        ))}
                      </span>
                      <span className="text-sm font-bold text-chalk">{p.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {step === 3 && (
              <ul className="grid gap-2.5 sm:grid-cols-3">
                {USES.map((u) => (
                  <li key={u.id}>
                    <button onClick={() => choose({ use: u.id as Use })} className="flex w-full flex-col gap-1 rounded-2xl bg-deep p-4 text-left ring-1 ring-white/10 hover:ring-volt">
                      <span className="text-base font-bold text-chalk">{u.label}</span>
                      <span className="text-sm text-mist">{u.hint}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {done && (
              <div className="flex flex-col gap-4">
                {!items && <p className="text-fog">Cargando prendas…</p>}
                {items && combos.length === 0 && <p className="text-fog">No encontramos prendas para esa combinación. Probá otros colores.</p>}
                <div className="grid gap-4 lg:grid-cols-2">
                  {combos.map((c) => (
                    <ComboCard
                      key={c.id}
                      combo={c}
                      onAdded={onClose}
                      onTry={() => {
                        onTry(gender, c.items);
                        onClose();
                      }}
                    />
                  ))}
                </div>
                <button onClick={restart} className="text-sm font-semibold text-fog underline-offset-4 hover:text-chalk hover:underline">
                  Empezar de nuevo
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Sheet>
  );
}
