import Link from "next/link";
import { IconHockey } from "@/components/ui/sport-icons";

export default function NotFound() {
  return (
    <div className="wrap flex min-h-[70svh] flex-col items-center justify-center gap-6 py-16 text-center">
      <IconHockey size={120} className="text-flame" />
      <p className="eyebrow text-flame">Error 404</p>
      <h1 className="display text-[clamp(4rem,14vw,9rem)]">Offside</h1>
      <p className="max-w-md text-fog">La página que buscás no está en la cancha. Volvé al inicio o buscá lo que necesitás.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-volt">
          Ir al inicio
        </Link>
        <Link href="/deportes" className="btn btn-ghost">
          Ver deportes
        </Link>
      </div>
    </div>
  );
}
