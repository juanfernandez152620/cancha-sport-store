import { SITE } from "@/lib/site";

/** Three speed bars (the hero motif) + condensed italic wordmark. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 40 30" className="h-7 w-auto shrink-0" aria-hidden>
        <path d="M12 2h26l-5 7H7Z" fill="#d4ff1e" />
        <path d="M8 12h26l-5 7H3Z" fill="#19e3ff" />
        <path d="M4 22h26l-5 7H-1Z" fill="#ff2d87" />
      </svg>
      <span className="display text-[1.9rem] leading-none tracking-tight text-chalk">{SITE.name}</span>
    </span>
  );
}
