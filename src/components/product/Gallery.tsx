"use client";

import { useRef, useState } from "react";
import { ProductImage } from "./ProductImage";
import { IconChevron } from "@/components/ui/icons";

/** Swipeable photo strip with counter, arrows and thumbnails (like the reference store's detail view). */
export function Gallery({ images, alt, size = 800 }: { images: string[]; alt: string; size?: number }) {
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const go = (n: number) => {
    const k = (n + images.length) % images.length;
    setI(k);
    track.current?.scrollTo({ left: k * track.current.clientWidth, behavior: "smooth" });
  };
  return (
    <div>
      <div className="photo-tile relative overflow-hidden rounded-3xl">
        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            const k = Math.round(el.scrollLeft / el.clientWidth);
            if (k !== i) setI(k);
          }}
        >
          {images.map((src, k) => (
            <div key={src} className="w-full shrink-0 snap-center">
              <ProductImage path={src} alt={k === 0 ? alt : `${alt}, foto ${k + 1}`} size={size} eager={k === 0} />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-bold text-chalk">
              {i + 1} / {images.length}
            </span>
            <button onClick={() => go(i - 1)} className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow" aria-label="Foto anterior">
              <IconChevron dir="left" size={20} />
            </button>
            <button onClick={() => go(i + 1)} className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow" aria-label="Foto siguiente">
              <IconChevron size={20} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, k) => (
            <button
              key={src}
              onClick={() => go(k)}
              aria-label={`Ver foto ${k + 1}`}
              aria-current={k === i}
              className="photo-tile size-16 shrink-0 overflow-hidden rounded-xl ring-2 ring-transparent aria-[current=true]:ring-volt"
            >
              <ProductImage path={src} alt="" size={140} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
