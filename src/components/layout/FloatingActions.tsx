"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useUI } from "@/lib/stores";
import { SITE, whatsappLink } from "@/lib/site";
import { IconSearch, IconWhatsapp } from "@/components/ui/icons";

/** Phones: search pill + WhatsApp, the two things people reach for. Hidden while the outfit stage is on screen. */
export function FloatingActions() {
  const setSearchOpen = useUI((s) => s.setSearchOpen);
  const [show, setShow] = useState(false);
  const [overStage, setOverStage] = useState(false);
  const pathname = usePathname();
  // a new page may not have the outfit stage at all
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setOverStage(false);
  }

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const stage = document.getElementById("armar-outfit");
    let io: IntersectionObserver | undefined;
    if (stage) {
      io = new IntersectionObserver(([e]) => setOverStage(e.isIntersecting), { threshold: 0.15 });
      io.observe(stage);
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, [pathname]);

  const visible = show && !overStage;
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex items-end justify-between gap-3 px-4"
        >
          <button
            onClick={() => setSearchOpen(true)}
            className="pointer-events-auto flex h-14 items-center gap-3 rounded-full bg-chalk pl-2 pr-5 text-sm font-semibold text-ink shadow-[0_12px_40px_-10px_rgba(0,0,0,.7)] lg:hidden"
          >
            <span className="grid size-10 place-items-center rounded-full bg-ink text-volt">
              <IconSearch size={20} />
            </span>
            Decime qué buscás
          </button>
          <a
            href={whatsappLink(`Hola ${SITE.name}, tengo una consulta`)}
            target="_blank"
            rel="noopener"
            aria-label="Escribinos por WhatsApp"
            className="pointer-events-auto ml-auto grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_12px_40px_-10px_rgba(0,0,0,.7)]"
          >
            <IconWhatsapp size={28} />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
