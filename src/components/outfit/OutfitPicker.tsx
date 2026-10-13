"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Card, Slot } from "@/lib/types";
import type { Outfit } from "@/lib/stores";
import { price } from "@/lib/format";
import { MAIN_SPORTS, SPORTS } from "@/lib/taxonomy";
import { ProductImage } from "@/components/product/ProductImage";
import { IconCheck, IconClose } from "@/components/ui/icons";
import { ZONES, type ZoneId } from "./figure";
import { COLOR_FILTERS, SLOT_LABEL, SLOT_SHORT } from "./labels";

type Props = {
  items: Card[] | null;
  outfit: Outfit;
  zone: ZoneId;
  slot: Slot;
  onZone: (z: ZoneId) => void;
  onSlot: (s: Slot) => void;
  onWear: (c: Card) => void;
  onTakeOff: (s: Slot) => void;
  onInfo: (c: Card) => void;
  sport: string;
  onSport: (s: string) => void;
  color: string | null;
  onColor: (c: string | null) => void;
  compact?: boolean;
};

const PAGE = 24;

export function OutfitPicker(props: Props) {
  const { items, outfit, zone, slot, onZone, onSlot, onWear, onTakeOff, onInfo, sport, onSport, color, onColor, compact } = props;
  const [shown, setShown] = useState(PAGE);
  // reset paging whenever the list changes
  const [listKey, setListKey] = useState("");
  const key = `${slot}|${sport}|${color}`;
  if (key !== listKey) {
    setListKey(key);
    setShown(PAGE);
  }

  const list = useMemo(() => {
    if (!items) return [];
    return items.filter(
      (c) => c.gs?.[0] === slot && (sport === "todos" || c.sp.includes(sport)) && (!color || c.fm === color),
    );
  }, [items, slot, sport, color]);

  const counts = useMemo(() => {
    const m: Partial<Record<Slot, number>> = {};
    for (const c of items ?? []) if (c.gs) m[c.gs[0]] = (m[c.gs[0]] ?? 0) + 1;
    return m;
  }, [items]);

  // keep the selected zone visible in the horizontally scrolling tab row (without moving the page)
  const tabs = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = tabs.current;
    const tab = row?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (row && tab) row.scrollTo({ left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2, behavior: "smooth" });
  }, [zone]);

  const worn = outfit[slot];
  const zoneSlots = ZONES[zone].slots;

  return (
    <div className="flex min-h-0 flex-col">
      {/* zones */}
      <div ref={tabs} role="tablist" aria-label="Parte del cuerpo" className="no-scrollbar relative -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-3">
        {(Object.keys(ZONES) as ZoneId[]).map((z) => (
          <button
            key={z}
            role="tab"
            aria-selected={z === zone}
            onClick={() => onZone(z)}
            className="relative flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold uppercase tracking-wide text-fog transition-colors hover:text-chalk aria-selected:bg-chalk aria-selected:text-ink"
            style={{ fontStretch: "88%" }}
          >
            {ZONES[z].label}
            {ZONES[z].slots.some((s) => outfit[s]) && <span className="size-1.5 rounded-full bg-volt" aria-label="con prenda" />}
          </button>
        ))}
      </div>

      {/* slots inside the zone */}
      {zoneSlots.length > 1 && (
        <div className="mb-3 grid grid-cols-2 gap-2">
          {zoneSlots.map((s) => (
            <button
              key={s}
              onClick={() => onSlot(s)}
              aria-pressed={s === slot}
              className="flex min-h-12 flex-col items-start justify-center rounded-2xl px-4 py-2 text-left ring-1 ring-white/12 transition-colors aria-pressed:bg-volt/12 aria-pressed:ring-volt"
            >
              <span className="text-sm font-bold text-chalk">{SLOT_LABEL[s]}</span>
              <span className="text-xs text-mist">{outfit[s] ? `Puesto: ${outfit[s]!.n}` : `${counts[s] ?? 0} opciones`}</span>
            </button>
          ))}
        </div>
      )}

      {/* filters */}
      <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-2">
        {["todos", ...MAIN_SPORTS].map((s) => (
          <button key={s} className="chip !min-h-9 !px-3 !text-xs" aria-pressed={sport === s} onClick={() => onSport(s)}>
            {s === "todos" ? "Todo" : SPORTS[s as keyof typeof SPORTS].label}
          </button>
        ))}
        <span className="mx-1 h-6 w-px shrink-0 bg-white/15" />
        {COLOR_FILTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => onColor(color === c.id ? null : c.id)}
            aria-pressed={color === c.id}
            aria-label={`Color ${c.label}`}
            title={c.label}
            className="grid size-9 shrink-0 place-items-center rounded-full ring-1 ring-white/15 transition-transform aria-pressed:scale-110 aria-pressed:ring-2 aria-pressed:ring-volt"
          >
            <span className="size-5 rounded-full ring-1 ring-black/30" style={{ background: c.hex }} />
          </button>
        ))}
      </div>

      {/* what is on right now */}
      <div className="mb-3 flex min-h-10 items-center justify-between gap-3 border-b border-white/10 pb-3 text-sm">
        <p className="min-w-0 truncate text-fog">
          <span className="eyebrow mr-2 text-volt">{SLOT_SHORT[slot]}</span>
          {worn ? worn.n : "Sin elegir"}
        </p>
        {worn && (
          <button onClick={() => onTakeOff(slot)} className="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-magenta ring-1 ring-magenta/40 hover:bg-magenta/10">
            <IconClose size={14} /> Quitar
          </button>
        )}
      </div>

      {!items ? (
        <div className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white/6" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white/5 p-6 text-center text-sm text-fog">
          No encontramos {SLOT_LABEL[slot].toLowerCase()} con esos filtros.
          <button onClick={() => { onSport("todos"); onColor(null); }} className="mt-3 block w-full font-bold text-volt underline-offset-4 hover:underline">
            Ver todo
          </button>
        </div>
      ) : (
        <>
          <ul className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
            {list.slice(0, shown).map((c) => {
              const on = worn?.id === c.id;
              return (
                <li key={c.id} className="relative">
                  <button
                    onClick={() => onWear(c)}
                    aria-pressed={on}
                    className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl text-left transition-[box-shadow,transform] duration-200 active:scale-[.98] ${on ? "glow-volt" : "ring-1 ring-white/10 hover:ring-white/30"}`}
                  >
                    <span className="photo-tile relative block">
                      <ProductImage path={c.im[0]} alt="" size={300} className="p-2 transition-transform duration-300 group-hover:scale-105" />
                      {on && (
                        <span className="absolute left-2 top-2 grid size-7 place-items-center rounded-full bg-volt text-ink">
                          <IconCheck size={16} strokeWidth={3} />
                        </span>
                      )}
                    </span>
                    <span className="flex flex-1 flex-col gap-1 bg-deep/80 p-3">
                      <span className="line-clamp-2 text-[13px] font-semibold leading-tight text-chalk">{c.n}</span>
                      <span className="flex items-center gap-1.5 text-[11px] text-mist">
                        <span className="size-2.5 shrink-0 rounded-full ring-1 ring-white/30" style={{ background: c.hx }} />
                        <span className="truncate">{c.cn}</span>
                      </span>
                      <span className="mt-auto pt-1 text-sm font-extrabold text-chalk">{price(c.p)}</span>
                    </span>
                  </button>
                  <button
                    onClick={() => onInfo(c)}
                    className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-ink/80 text-xs font-black italic text-chalk ring-1 ring-white/20 hover:bg-ink"
                    aria-label={`Ver detalle de ${c.n}`}
                  >
                    i
                  </button>
                </li>
              );
            })}
          </ul>
          {list.length > shown && (
            <button onClick={() => setShown((n) => n + PAGE)} className="btn btn-ghost mt-4 w-full">
              Ver más ({list.length - shown})
            </button>
          )}
        </>
      )}
    </div>
  );
}
