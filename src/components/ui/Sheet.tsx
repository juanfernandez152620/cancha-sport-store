"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { animate, AnimatePresence, motion, useMotionValue, type PanInfo, type TargetAndTransition } from "motion/react";
import { IconClose } from "./icons";

type Side = "bottom" | "right" | "left" | "center";

type Props = {
  open: boolean;
  onClose: () => void;
  side?: Side;
  /** on wide screens a bottom sheet can turn into a side panel or a centred dialog */
  desktopSide?: Side;
  title?: ReactNode;
  label: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** keep the page behind usable (no scrim, no scroll lock) */
  light?: boolean;
  hideClose?: boolean;
};

let locks = 0;
function lockScroll() {
  locks++;
  document.documentElement.style.overflow = "hidden";
  return () => {
    locks--;
    if (!locks) document.documentElement.style.overflow = "";
  };
}

const subscribe = () => () => {};
const useMounted = () => useSyncExternalStore(subscribe, () => true, () => false);

const subscribeWide = (cb: () => void) => {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const useWide = () => useSyncExternalStore(subscribeWide, () => window.matchMedia("(min-width: 1024px)").matches, () => false);

const variants: Record<Side, { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }> = {
  bottom: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } },
  right: { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } },
  left: { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } },
  center: { initial: { opacity: 0, scale: 0.96, y: 20 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.97, y: 10 } },
};

const placement: Record<Side, string> = {
  bottom: "inset-x-0 bottom-0 max-h-[92svh] rounded-t-[28px]",
  right: "inset-y-0 right-0 w-full max-w-[480px]",
  left: "inset-y-0 left-0 w-[88vw] max-w-[400px]",
  center: "inset-x-0 top-[5svh] mx-auto max-h-[90svh] w-[min(760px,94vw)] rounded-[28px]",
};

export function Sheet({ open, onClose, side = "bottom", desktopSide, title, label, children, footer, className = "", light = false, hideClose = false }: Props) {
  const mounted = useMounted();
  const wide = useWide();
  const panel = useRef<HTMLDivElement>(null);
  // finger drag on the grab bar; the outer layer keeps the enter/exit animation
  const dragY = useMotionValue(0);
  const s: Side = wide && desktopSide ? desktopSide : side;

  useEffect(() => {
    if (!open) return;
    dragY.set(0);
    const release = light ? () => {} : lockScroll();
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    requestAnimationFrame(() => panel.current?.focus());
    return () => {
      release();
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onClose, light, dragY]);

  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
    else animate(dragY, 0, { type: "spring", stiffness: 500, damping: 40 });
  };

  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" style={{ pointerEvents: light ? "none" : "auto" }}>
          {!light && (
            <motion.div
              className="absolute inset-0 bg-ink/70 backdrop-blur-[3px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
          )}
          <motion.div
            className={`absolute flex flex-col ${placement[s]} ${className}`}
            style={{ pointerEvents: "auto" }}
            {...variants[s]}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <motion.div
              ref={panel}
              role="dialog"
              aria-modal={!light}
              aria-label={label}
              tabIndex={-1}
              style={{ y: dragY }}
              className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[inherit] bg-night shadow-[0_-20px_60px_-10px_rgba(0,0,0,.6)] outline-none ring-1 ring-white/10"
            >
              {s === "bottom" && (
                <motion.div
                  className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing"
                  onPan={(_, info) => dragY.set(Math.max(0, info.offset.y))}
                  onPanEnd={onPanEnd}
                  aria-hidden
                >
                  <span className="h-1.5 w-12 rounded-full bg-white/25" />
                </motion.div>
              )}
              {(title || !hideClose) && (
                <div className="flex shrink-0 items-center gap-3 px-5 pb-3 pt-3 lg:pt-5">
                  <div className="min-w-0 flex-1">{title}</div>
                  {!hideClose && (
                    <button onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-full bg-white/8 text-chalk hover:bg-white/15" aria-label="Cerrar">
                      <IconClose size={20} />
                    </button>
                  )}
                </div>
              )}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
              {footer && <div className="shrink-0 border-t border-white/10 bg-night/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</div>}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
