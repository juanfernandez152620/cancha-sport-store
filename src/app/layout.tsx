import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { buildNav } from "@/lib/nav";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/layout/Providers";
import { SportsBackdrop } from "@/components/layout/SportsBackdrop";
import { FloatingActions } from "@/components/layout/FloatingActions";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
  display: "swap",
});

// Vercel exposes the production domain at build time; locally we fall back to the dev server
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${SITE.name} · ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { title: `${SITE.name} · ${SITE.tagline}`, description: SITE.description, type: "website", locale: "es_AR", images: ["/banners/hero-futbol-1520.webp"] },
};

export const viewport: Viewport = {
  themeColor: "#040a1c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const nav = buildNav();

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={archivo.variable}>
      <body className="min-h-svh">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-volt focus:px-4 focus:py-2 focus:text-ink">
          Saltar al contenido
        </a>
        <SportsBackdrop />
        <Providers nav={nav}>
          <Header nav={nav} />
          <main id="contenido">{children}</main>
          <Footer nav={nav} />
          <FloatingActions />
        </Providers>
      </body>
    </html>
  );
}
