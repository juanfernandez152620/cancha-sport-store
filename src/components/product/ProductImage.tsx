import { img, imgSet } from "@/lib/format";

type Props = {
  path: string;
  alt: string;
  size?: number;
  className?: string;
  eager?: boolean;
};

/** Product photo on a light studio tile. Catalogue photos are resized by the CDN; no Next image optimisation needed. */
export function ProductImage({ path, alt, size = 500, className = "", eager = false }: Props) {
  return (
    <img
      src={img(path, size)}
      srcSet={imgSet(path, size)}
      alt={alt}
      width={size}
      height={size}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={`aspect-square h-auto w-full object-contain ${className}`}
    />
  );
}
