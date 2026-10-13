"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import type { Card } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { IconArrow, IconChevron } from "@/components/ui/icons";

type Props = {
  title: ReactNode;
  eyebrow?: string;
  lead?: string;
  href?: string;
  cards: Card[];
  accent?: string;
};

export function ProductRail({ title, eyebrow, lead, href, cards, accent = "var(--color-volt)" }: Props) {
  const track = useRef<HTMLUListElement>(null);
  const move = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  if (!cards.length) return null;
  return (
    <section className="wrap">
      <header className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="eyebrow mb-2 flex items-center gap-2" style={{ color: accent }}>
              <span className="inline-block h-[3px] w-6 -skew-x-[20deg]" style={{ background: accent }} /> {eyebrow}
            </p>
          )}
          <h2 className="display text-[clamp(2.2rem,5.5vw,3.6rem)]">{title}</h2>
          {lead && <p className="mt-2 max-w-xl text-sm text-fog sm:text-base">{lead}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {href && (
            <Link href={href} className="hidden items-center gap-2 text-sm font-bold text-chalk hover:text-volt sm:flex">
              Ver todo <IconArrow size={18} />
            </Link>
          )}
          <button onClick={() => move(-1)} className="hidden size-11 place-items-center rounded-full ring-1 ring-white/20 hover:bg-white/10 md:grid" aria-label="Anteriores">
            <IconChevron dir="left" size={20} />
          </button>
          <button onClick={() => move(1)} className="hidden size-11 place-items-center rounded-full ring-1 ring-white/20 hover:bg-white/10 md:grid" aria-label="Siguientes">
            <IconChevron size={20} />
          </button>
        </div>
      </header>
      <ul ref={track} className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] pb-2">
        {cards.map((c) => (
          <li key={c.id} className="w-[64vw] max-w-[290px] shrink-0 snap-start sm:w-[42vw] lg:w-[23%]">
            <ProductCard c={c} />
          </li>
        ))}
      </ul>
      {href && (
        <Link href={href} className="btn btn-ghost mt-4 w-full sm:hidden">
          Ver todo <IconArrow size={18} />
        </Link>
      )}
    </section>
  );
}
