"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useUI } from "@/lib/stores";
import { IconCheck } from "@/components/ui/icons";

export function Toast() {
  const toast = useUI((s) => s.toast);
  const setCartOpen = useUI((s) => s.setCartOpen);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => useUI.setState({ toast: null }), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-[90] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-chalk py-2 pl-3 pr-2 text-sm font-semibold text-ink shadow-2xl"
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-volt">
              <IconCheck size={16} strokeWidth={3} />
            </span>
            <span className="line-clamp-2">{toast.text}</span>
            {toast.cart && (
              <button
                onClick={() => {
                  useUI.setState({ toast: null });
                  setCartOpen(true);
                }}
                className="shrink-0 rounded-full bg-ink px-4 py-2 text-xs font-extrabold uppercase text-chalk"
              >
                Ver carrito
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
