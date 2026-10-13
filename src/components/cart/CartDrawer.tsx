"use client";

import Link from "next/link";
import { useState } from "react";
import { cartTotals, isCompleteOutfit, useCart, useUI, type CartLine } from "@/lib/stores";
import { price } from "@/lib/format";
import { SITE, whatsappLink } from "@/lib/site";
import { Sheet } from "@/components/ui/Sheet";
import { ProductImage } from "@/components/product/ProductImage";
import { IconBag, IconMinus, IconPlus, IconTrash, IconWhatsapp } from "@/components/ui/icons";

function orderMessage(lines: CartLine[], t: ReturnType<typeof cartTotals>) {
  const rows = lines.map((l) => `• ${l.qty} x ${l.n} (${l.cn}) talle ${l.size ?? "-"} — ${price(l.p * l.qty)}${l.bundle ? " [outfit]" : ""}`);
  return [
    `¡Hola ${SITE.name}! Quiero hacer este pedido:`,
    ...rows,
    "",
    `Subtotal: ${price(t.subtotal)}`,
    t.discount ? `Descuento outfit completo: -${price(t.discount)}` : "",
    `Total: ${price(t.total)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function Line({ l }: { l: CartLine }) {
  const { setQty, setSize, remove } = useCart();
  const missing = !l.size && l.sz.length > 1;
  return (
    <li className="flex gap-3 py-4">
      <Link href={`/producto/${l.s}`} className="photo-tile size-24 shrink-0 overflow-hidden rounded-2xl">
        <ProductImage path={l.im} alt={l.n} size={200} className="p-1" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold leading-tight">{l.n}</p>
          <button onClick={() => remove(l.key)} className="grid size-8 shrink-0 place-items-center rounded-full text-mist hover:bg-white/10 hover:text-magenta" aria-label={`Quitar ${l.n}`}>
            <IconTrash size={16} />
          </button>
        </div>
        <p className="truncate text-xs text-mist">{l.cn}</p>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          {l.sz.length > 1 ? (
            <select
              value={l.size ?? ""}
              onChange={(e) => setSize(l.key, e.target.value)}
              aria-label={`Talle de ${l.n}`}
              className={`h-9 rounded-lg bg-deep px-2 text-xs font-bold ring-1 ${missing ? "text-magenta ring-magenta" : "text-chalk ring-white/15"}`}
            >
              <option value="" disabled>
                Elegí talle
              </option>
              {l.sz.map((s, i) => (
                <option key={s} value={s} disabled={l.sa[i] === "0"}>
                  {s}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-mist">Talle único</span>
          )}
          <div className="flex items-center rounded-full ring-1 ring-white/15">
            <button onClick={() => setQty(l.key, l.qty - 1)} className="grid size-9 place-items-center" aria-label="Uno menos">
              <IconMinus size={14} />
            </button>
            <span className="w-6 text-center text-sm font-bold" aria-live="polite">{l.qty}</span>
            <button onClick={() => setQty(l.key, l.qty + 1)} className="grid size-9 place-items-center" aria-label="Uno más">
              <IconPlus size={14} />
            </button>
          </div>
          <span className="ml-auto text-sm font-extrabold">{price(l.p * l.qty)}</span>
        </div>
      </div>
    </li>
  );
}

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const lines = useCart((s) => s.lines);
  const [tried, setTried] = useState(false);
  const t = cartTotals(lines);
  const singles = lines.filter((l) => !l.bundle);
  const bundles = [...new Set(lines.filter((l) => l.bundle).map((l) => l.bundle!))];
  const missingSizes = lines.filter((l) => !l.size && l.sz.length > 1);
  const toFree = Math.max(0, SITE.freeShippingFrom - t.total);

  const checkout = () => {
    if (missingSizes.length) {
      setTried(true);
      return;
    }
    window.open(whatsappLink(orderMessage(lines, t)), "_blank", "noopener");
  };

  return (
    <Sheet
      open={open}
      onClose={() => setOpen(false)}
      side="right"
      label="Carrito"
      title={
        <p className="display text-3xl">
          Carrito <span className="text-mist">({t.count})</span>
        </p>
      }
      footer={
        lines.length > 0 && (
          <div className="flex flex-col gap-3">
            <dl className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between text-fog">
                <dt>Subtotal</dt>
                <dd>{price(t.subtotal)}</dd>
              </div>
              {t.discount > 0 && (
                <div className="flex justify-between text-volt">
                  <dt>Outfit completo -10%</dt>
                  <dd>-{price(t.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-fog">
                <dt>Envío</dt>
                <dd>{toFree === 0 ? <span className="font-bold text-volt">Gratis</span> : "A calcular"}</dd>
              </div>
              <div className="mt-1 flex items-baseline justify-between">
                <dt className="font-bold">Total</dt>
                <dd className="text-2xl font-black">{price(t.total)}</dd>
              </div>
            </dl>
            {tried && missingSizes.length > 0 && (
              <p role="alert" className="text-sm font-semibold text-magenta">
                Elegí el talle de {missingSizes.length === 1 ? missingSizes[0].n : `${missingSizes.length} productos`}.
              </p>
            )}
            <button onClick={checkout} className="btn btn-volt w-full">
              <IconWhatsapp size={20} /> Finalizar por WhatsApp
            </button>
            <p className="text-center text-xs text-mist">
              Te confirmamos stock y te pasamos los medios de pago. Hasta {SITE.installments} cuotas sin interés.
            </p>
          </div>
        )
      }
    >
      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-white/6 text-volt">
            <IconBag size={36} />
          </span>
          <p className="display text-3xl">Tu carrito está vacío</p>
          <p className="text-sm text-fog">Arrancá por el probador: armá un outfit completo y te llevás 10% OFF.</p>
          <div className="flex w-full flex-col gap-2">
            <Link href="/armar-outfit" onClick={() => setOpen(false)} className="btn btn-volt">
              Armar mi outfit
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/hombre" onClick={() => setOpen(false)} className="btn btn-ghost">Hombre</Link>
              <Link href="/mujer" onClick={() => setOpen(false)} className="btn btn-ghost">Mujer</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5">
          <div className="mb-2 rounded-2xl bg-white/5 p-3 text-xs text-fog">
            {toFree > 0 ? (
              <>
                Te faltan <strong className="text-chalk">{price(toFree)}</strong> para el envío gratis.
              </>
            ) : (
              <strong className="text-volt">¡Tenés envío gratis!</strong>
            )}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-volt transition-[width] duration-500" style={{ width: `${Math.min(100, (t.total / SITE.freeShippingFrom) * 100)}%` }} />
            </div>
          </div>
          {bundles.map((b, i) => {
            const group = lines.filter((l) => l.bundle === b);
            const complete = isCompleteOutfit(group.map((l) => l.slot));
            return (
              <div key={b} className="mt-3 rounded-3xl bg-deep/70 px-3 ring-1 ring-volt/30">
                <p className="flex items-center justify-between pt-3 text-xs font-extrabold uppercase tracking-wide">
                  <span>Outfit {bundles.length > 1 ? i + 1 : ""}</span>
                  <span className={complete ? "text-volt" : "text-mist"}>{complete ? "10% OFF aplicado" : "Incompleto: sin descuento"}</span>
                </p>
                <ul className="divide-y divide-white/8">
                  {group.map((l) => (
                    <Line key={l.key} l={l} />
                  ))}
                </ul>
              </div>
            );
          })}
          <ul className="divide-y divide-white/8">
            {singles.map((l) => (
              <Line key={l.key} l={l} />
            ))}
          </ul>
        </div>
      )}
    </Sheet>
  );
}
