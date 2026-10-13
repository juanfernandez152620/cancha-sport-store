import "server-only";
import { countFor, subsFor } from "./catalog";
import { DEPTS, MAIN_SPORTS, SPORTS } from "./taxonomy";
import type { Dept, Gender } from "./types";

export type NavLink = { label: string; href: string; count?: number; image?: string };
export type NavGroup = { title: string; href: string; links: NavLink[] };
export type Nav = {
  hombre: NavGroup[];
  mujer: NavGroup[];
  deportes: NavGroup[];
  covers: Record<"hombre" | "mujer" | "deportes", string>;
};

function genderGroups(g: Gender): NavGroup[] {
  return (["ropa", "calzado", "accesorios"] as Dept[]).map((d) => ({
    title: DEPTS[d],
    href: `/${g}/${d}`,
    links: subsFor(g, d).map((s) => ({ label: s.label, href: `/${g}/${d}/${s.slug}`, count: s.count, image: s.cover })),
  }));
}

export function buildNav(): Nav {
  const sports = [...MAIN_SPORTS, "running", "training", "basquet"] as const;
  return {
    hombre: genderGroups("hombre"),
    mujer: genderGroups("mujer"),
    deportes: [
      {
        title: "Por deporte",
        href: "/deportes",
        links: sports.map((s) => ({ label: SPORTS[s].label, href: `/deportes/${s}`, count: countFor({ sport: s }) })),
      },
    ],
    covers: {
      hombre: "/banners/hombre-retrato-2-480.webp",
      mujer: "/banners/mujer-retrato-1-480.webp",
      deportes: "/banners/futbol-pelota-760.webp",
    },
  };
}
