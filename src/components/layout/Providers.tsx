"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import { useCart, useOutfit } from "@/lib/stores";
import type { Nav } from "@/lib/nav";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ProductSheet } from "@/components/product/ProductSheet";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { MobileMenu } from "./MobileMenu";
import { Toast } from "./Toast";

/** Client-only overlays plus store rehydration (stores skip it so the first render matches the server HTML). */
export function Providers({ nav, children }: { nav: Nav; children: React.ReactNode }) {
  useEffect(() => {
    useCart.persist.rehydrate();
    useOutfit.persist.rehydrate();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {children}
      <ProductSheet />
      <CartDrawer />
      <SearchOverlay />
      <MobileMenu nav={nav} />
      <Toast />
    </MotionConfig>
  );
}
