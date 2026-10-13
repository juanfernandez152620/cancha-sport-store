const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

export const price = (n: number) => ars.format(Math.round(n));

export const discountPct = (p: number, lp: number) => (lp > p ? Math.round((1 - p / lp) * 100) : 0);

const CDN = "https://nikearprod.vtexassets.com/arquivos/ids";

/** Product image URL. Catalogue images are served (and resized) by the VTEX CDN; store-line images are local SVGs. */
export function img(path: string, size = 500) {
  if (!path) return "";
  if (path.startsWith("/")) return path;
  const slash = path.indexOf("/");
  return `${CDN}/${path.slice(0, slash)}-${size}-${size}/${path.slice(slash + 1)}`;
}

export function imgSet(path: string, size: number) {
  if (path.startsWith("/")) return undefined;
  return `${img(path, size)} 1x, ${img(path, Math.min(size * 2, 1200))} 2x`;
}

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
