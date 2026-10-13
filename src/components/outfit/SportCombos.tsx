"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Card, Gender } from "@/lib/types";
import { useOutfit } from "@/lib/stores";
import { useJson } from "@/lib/useJson";
import { ComboCard } from "./ComboCard";
import { buildCombos, PALETTES, POSITIONS, type QuizSport } from "./quiz";

/** Ready-made combos per position on each sport page; "Probar" sends them to the mannequin. */
export function SportCombos({ sport }: { sport: QuizSport }) {
  const [gender, setGender] = useState<Gender>("hombre");
  const [position, setPosition] = useState(POSITIONS[sport][0].id);
  const [palette, setPalette] = useState("negro");
  const { data } = useJson<Card[]>(`/data/outfit/${gender}.json`);
  const apply = useOutfit((s) => s.apply);
  const router = useRouter();

  const combos = useMemo(() => (data ? buildCombos(data, gender, { sport, position, palette, use: "partido" }) : []), [data, gender, sport, position, palette]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full bg-white/6 p-1 text-sm font-bold">
          {(["hombre", "mujer"] as Gender[]).map((g) => (
            <button key={g} onClick={() => setGender(g)} aria-pressed={gender === g} className="rounded-full px-4 py-1.5 text-fog aria-pressed:bg-chalk aria-pressed:text-ink">
              {g === "hombre" ? "Hombre" : "Mujer"}
            </button>
          ))}
        </div>
        <span className="mx-1 hidden h-6 w-px bg-white/15 sm:block" />
        <div className="no-scrollbar -mx-[var(--gutter)] flex w-full gap-2 overflow-x-auto px-[var(--gutter)] sm:mx-0 sm:w-auto sm:px-0">
          {POSITIONS[sport].map((p) => (
            <button key={p.id} className="chip" aria-pressed={position === p.id} onClick={() => setPosition(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-1 text-mist">Colores</span>
        {PALETTES.map((p) => (
          <button
            key={p.id}
            onClick={() => setPalette(p.id)}
            aria-pressed={palette === p.id}
            aria-label={p.label}
            title={p.label}
            className="flex -space-x-1.5 rounded-full p-1 ring-1 ring-white/12 aria-pressed:ring-2 aria-pressed:ring-volt"
          >
            {p.colors.map((c) => (
              <span key={c} className="size-6 rounded-full ring-2 ring-night" style={{ background: c }} />
            ))}
          </button>
        ))}
      </div>
      <p className="text-sm text-fog">{POSITIONS[sport].find((p) => p.id === position)?.hint}</p>
      {!data ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/6" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {combos.map((c) => (
            <ComboCard
              key={c.id}
              combo={c}
              onTry={() => {
                apply(gender, c.items);
                router.push("/armar-outfit");
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
