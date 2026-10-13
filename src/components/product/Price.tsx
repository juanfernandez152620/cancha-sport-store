import { discountPct, price } from "@/lib/format";

export function Price({ p, lp, size = "md" }: { p: number; lp: number; size?: "sm" | "md" | "lg" }) {
  const off = discountPct(p, lp);
  const main = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`${main} font-extrabold tracking-tight text-chalk`}>{price(p)}</span>
      {off > 0 && (
        <>
          <span className="text-xs text-mist line-through">{price(lp)}</span>
          <span className="rounded-sm bg-magenta px-1.5 py-0.5 text-[11px] font-extrabold text-white">-{off}%</span>
        </>
      )}
    </div>
  );
}
