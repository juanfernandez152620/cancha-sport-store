"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Card, Gender, Slot } from "@/lib/types";
import { useOutfit, useUI } from "@/lib/stores";
import { useJson } from "@/lib/useJson";
import { useIsDesktop } from "@/lib/useMedia";
import { price } from "@/lib/format";
import { Sheet } from "@/components/ui/Sheet";
import { ProductImage } from "@/components/product/ProductImage";
import { IconBag, IconSpark, IconUndo } from "@/components/ui/icons";
import { Mannequin } from "./Mannequin";
import { OutfitPicker } from "./OutfitPicker";
import { Completeness, OutfitSummary, outfitTotals } from "./OutfitSummary";
import { SportQuiz } from "./SportQuiz";
import { starterOutfit, type QuizSport } from "./quiz";
import { ZONES, zoneFor, type ZoneId } from "./figure";
import { SLOT_LABEL } from "./labels";

export function OutfitBuilder({ headingLevel = 2, sport }: { headingLevel?: 2 | 1; sport?: QuizSport }) {
  const gender = useOutfit((s) => s.gender);
  const outfit = useOutfit((s) => s.outfits[s.gender]);
  const setGender = useOutfit((s) => s.setGender);
  const wear = useOutfit((s) => s.wear);
  const takeOff = useOutfit((s) => s.takeOff);
  const apply = useOutfit((s) => s.apply);
  const clear = useOutfit((s) => s.clear);
  const openSheet = useUI((s) => s.openSheet);
  const desktop = useIsDesktop();

  const { data: items } = useJson<Card[]>(`/data/outfit/${gender}.json`);

  const [zone, setZone] = useState<ZoneId>("torso");
  const [slot, setSlot] = useState<Slot>("top");
  const [sportFilter, setSportFilter] = useState<string>(sport ?? "todos");
  const [color, setColor] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [hydrated, setHydrated] = useState(() => useOutfit.persist?.hasHydrated?.() ?? false);

  useEffect(() => {
    if (hydrated) return;
    return useOutfit.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  // links like /armar-outfit?g=mujer pick the mannequin
  useEffect(() => {
    if (!hydrated) return;
    const g = new URLSearchParams(window.location.search).get("g");
    if (g === "hombre" || g === "mujer") setGender(g);
  }, [hydrated, setGender]);

  // never open the section on a bare mannequin: dress it once per session and gender
  const starterDone = useRef<Record<string, boolean>>({});
  useEffect(() => {
    if (!hydrated || !items || starterDone.current[gender]) return;
    starterDone.current[gender] = true;
    let seen = false;
    try {
      seen = sessionStorage.getItem(`cancha-starter-${gender}`) === "1";
      sessionStorage.setItem(`cancha-starter-${gender}`, "1");
    } catch {}
    if (!seen && Object.keys(useOutfit.getState().outfits[gender]).length === 0) apply(gender, starterOutfit(items, gender));
  }, [hydrated, items, gender, apply]);

  const pickZone = useCallback(
    (z: ZoneId) => {
      setZone(z);
      // land on the slot that is still empty, so tapping the feet with shoes on offers socks next
      const slots = ZONES[z].slots;
      const current = useOutfit.getState().outfits[useOutfit.getState().gender];
      setSlot(slots.find((s) => !current[s]) ?? slots[0]);
      if (!desktop) setPickerOpen(true);
    },
    [desktop],
  );

  const onWear = useCallback(
    (c: Card) => {
      wear(c);
      if (c.gs) {
        setSlot(c.gs[0]);
        setZone(zoneFor(c.gs[0]));
      }
    },
    [wear],
  );

  const totals = outfitTotals(outfit);
  const H = headingLevel === 1 ? "h1" : "h2";

  const picker = (compact: boolean) => (
    <OutfitPicker
      items={items}
      outfit={outfit}
      zone={zone}
      slot={slot}
      onZone={(z) => {
        setZone(z);
        setSlot(ZONES[z].slots[0]);
      }}
      onSlot={setSlot}
      onWear={onWear}
      onTakeOff={takeOff}
      onInfo={openSheet}
      sport={sportFilter}
      onSport={setSportFilter}
      color={color}
      onColor={setColor}
      compact={compact}
    />
  );

  return (
    <section id="armar-outfit" aria-labelledby="outfit-title" className="wrap relative scroll-mt-24">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between lg:mb-8">
        <div>
          <p className="eyebrow mb-3 flex items-center gap-2 text-volt">
            <span className="inline-block h-[3px] w-8 -skew-x-[20deg] bg-volt" /> Probador virtual
          </p>
          <H id="outfit-title" className="display text-[clamp(3rem,9vw,6.5rem)]">
            Armá tu <span className="text-volt">outfit</span>
          </H>
          <p className="mt-3 max-w-xl text-fog">
            Vestí al maniquí de pies a cabeza con prendas reales del local. Si te llevás el outfit completo (arriba, abajo y calzado) tenés{" "}
            <strong className="text-chalk">10% OFF</strong>.
          </p>
        </div>
        <button onClick={() => setQuizOpen(true)} className="btn btn-ghost shrink-0 self-start md:self-auto">
          <IconSpark size={20} className="text-volt" /> Outfit por deporte
        </button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* ---------------- stage ---------------- */}
        <div className="card-surface relative h-[min(80svh,720px)] min-h-[520px] overflow-hidden rounded-[28px] lg:sticky lg:top-[calc(var(--header-h)+16px)] lg:h-[min(calc(100svh-var(--header-h)-40px),780px)]">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 p-3 sm:p-4">
            <GenderToggle value={gender} onChange={setGender} />
            <div className="flex gap-2">
              {totals.items.length > 0 && (
                <button onClick={clear} className="grid size-10 place-items-center rounded-full bg-ink/60 text-fog ring-1 ring-white/15 backdrop-blur hover:text-chalk" aria-label="Sacar toda la ropa" title="Vaciar">
                  <IconUndo size={18} />
                </button>
              )}
              <button onClick={() => setQuizOpen(true)} className="flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink/60 px-3 text-[11px] font-extrabold uppercase tracking-wide text-chalk ring-1 ring-white/15 backdrop-blur hover:ring-volt lg:hidden">
                <IconSpark size={15} className="text-volt" /> Deporte
              </button>
            </div>
          </div>

          <div className="absolute inset-0 px-2 pb-[78px] pt-14 lg:pb-[84px]">
            <Mannequin gender={gender} outfit={outfit} activeZone={desktop ? zone : null} onZone={pickZone} className="h-full w-full" />
          </div>

          <AnimatePresence>
            {totals.items.length === 0 && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 rounded-full bg-volt px-4 py-2 text-xs font-extrabold uppercase text-ink"
              >
                Tocá el cuerpo para vestirlo
              </motion.p>
            )}
          </AnimatePresence>

          {/* compact outfit bar */}
          <div className="absolute inset-x-3 bottom-3 z-10 flex items-center gap-3 rounded-2xl bg-ink/80 p-2.5 pl-3 ring-1 ring-white/12 backdrop-blur-md">
            <div className="flex -space-x-3">
              {totals.items.slice(0, desktop ? 4 : 3).map((c) => (
                <span key={c.id} className="photo-tile size-10 overflow-hidden rounded-full ring-2 ring-ink">
                  <ProductImage path={c.im[0]} alt="" size={100} />
                </span>
              ))}
              {totals.items.length === 0 && <span className="grid size-10 place-items-center rounded-full bg-white/8 text-mist"><IconBag size={18} /></span>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-extrabold">
                <span className="truncate">{totals.items.length ? price(totals.total) : "Tu outfit"}</span>
                {totals.complete && <span className="shrink-0 rounded bg-volt px-1.5 py-0.5 text-[10px] font-black text-ink">-10%</span>}
              </p>
              <p className={`truncate text-[11px] font-bold ${totals.complete ? "text-volt" : "text-mist"}`}>{missingLabel(outfit)}</p>
            </div>
            <button
              onClick={() => (desktop ? document.getElementById("outfit-summary")?.scrollIntoView({ behavior: "smooth", block: "center" }) : setSummaryOpen(true))}
              className="btn btn-volt !min-h-11 shrink-0 !px-4 !text-xs"
              disabled={!totals.items.length}
            >
              Ver
            </button>
          </div>
        </div>

        {/* ---------------- desktop panel ---------------- */}
        <aside aria-label="Prendas para el maniquí" className="card-surface hidden flex-col gap-6 rounded-[28px] p-6 lg:flex">
          <div>
            <h3 className="display text-4xl">¿Qué ropa querés?</h3>
            <p className="mt-1 text-sm text-mist">Hacé click en el maniquí o elegí una parte del cuerpo. Click de nuevo en una prenda para sacarla.</p>
          </div>
          {picker(false)}
          <div id="outfit-summary" className="border-t border-white/10 pt-6">
            <OutfitSummary />
          </div>
        </aside>
      </div>

      {/* ---------------- phone: dressing room sheet ---------------- */}
      {!desktop && (
        <Sheet
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          label="Elegir prendas"
          className="h-[92svh]"
          title={
            <div>
              <p className="eyebrow text-volt">{ZONES[zone].label}</p>
              <p className="display text-3xl">{SLOT_LABEL[slot]}</p>
            </div>
          }
          footer={
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">{totals.items.length ? price(totals.total) : "Sin prendas"}</p>
                <Completeness outfit={outfit} dense />
              </div>
              <button className="btn btn-volt !min-h-11 !px-5" onClick={() => setPickerOpen(false)}>
                Listo
              </button>
            </div>
          }
        >
          <div className="sticky top-0 z-10 bg-gradient-to-b from-night via-night to-night/0 px-4 pb-2">
            <div className="card-surface relative h-[27svh] overflow-hidden rounded-3xl">
              <Mannequin gender={gender} outfit={outfit} activeZone={zone} focus onZone={(z) => { setZone(z); setSlot(ZONES[z].slots[0]); }} className="h-full w-full" />
            </div>
          </div>
          <div className="px-4 pb-6 pt-2">{picker(true)}</div>
        </Sheet>
      )}

      {!desktop && (
        <Sheet open={summaryOpen} onClose={() => setSummaryOpen(false)} label="Tu outfit" title={<p className="display text-3xl">Tu outfit</p>}>
          <div className="px-5 pb-8">
            <OutfitSummary onDone={() => setSummaryOpen(false)} />
          </div>
        </Sheet>
      )}

      <SportQuiz
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        gender={gender}
        onGender={setGender}
        items={items}
        initialSport={sport}
        onTry={(g, cards) => {
          apply(g, cards);
          setZone("torso");
          setSlot("top");
        }}
      />
    </section>
  );
}

/** One line for the compact bar: what is still missing for the 10% OFF. */
function missingLabel(outfit: Record<string, unknown>) {
  const miss = [
    !outfit.top && !outfit.outer && "arriba",
    !outfit.bottom && "abajo",
    !outfit.shoes && "calzado",
  ].filter(Boolean);
  return miss.length ? `Para el 10% OFF falta: ${miss.join(", ")}` : "Outfit completo · 10% OFF";
}

function GenderToggle({ value, onChange }: { value: Gender; onChange: (g: Gender) => void }) {
  return (
    <div role="radiogroup" aria-label="Maniquí" className="relative inline-flex rounded-full bg-ink/60 p-1 ring-1 ring-white/15 backdrop-blur">
      {(["hombre", "mujer"] as Gender[]).map((g) => (
        <button
          key={g}
          role="radio"
          aria-checked={value === g}
          onClick={() => onChange(g)}
          className="relative z-10 h-8 rounded-full px-3 text-[11px] font-extrabold uppercase tracking-wide text-fog transition-colors aria-checked:text-ink sm:h-9 sm:px-4 sm:text-xs"
        >
          {value === g && <motion.span layoutId="gender-pill" className="absolute inset-0 -z-10 rounded-full bg-chalk" transition={{ type: "spring", stiffness: 500, damping: 36 }} />}
          {g === "hombre" ? "Hombre" : "Mujer"}
        </button>
      ))}
    </div>
  );
}
