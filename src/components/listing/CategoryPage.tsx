import Link from "next/link";
import { notFound } from "next/navigation";
import { listing, spread, subsFor, toCard } from "@/lib/catalog";
import { DEPTS, GENDERS, isDept, isGender, SUBS } from "@/lib/taxonomy";
import { Crumbs, OutfitCta, PageTitle } from "@/components/page/PageBits";
import { Listing } from "./Listing";

/** Shared body of /[gender]/[dept] and /[gender]/[dept]/[sub]. */
export function CategoryPage({ gender, dept, sub }: { gender: string; dept: string; sub?: string }) {
  if (!isGender(gender) || !isDept(dept)) notFound();
  if (sub && !SUBS[dept].some((s) => s.slug === sub)) notFound();
  const products = listing({ gender, dept, sub });
  const subs = subsFor(gender, dept);
  const subLabel = sub ? subs.find((s) => s.slug === sub)?.label ?? sub : null;
  const g = GENDERS[gender];

  return (
    <div className="flex flex-col gap-14 pb-8">
      <div>
        <Crumbs
          items={[
            { label: g.label, href: `/${gender}` },
            { label: DEPTS[dept], href: sub ? `/${gender}/${dept}` : undefined },
            ...(subLabel ? [{ label: subLabel }] : []),
          ]}
        />
        <PageTitle eyebrow={`${g.label} · ${DEPTS[dept]}`} accent={g.accent} title={subLabel ?? DEPTS[dept]}>
          {/* sibling categories as chips, phones only (desktop has the side list) */}
          <ul className="no-scrollbar -mx-[var(--gutter)] mt-6 flex gap-2 overflow-x-auto px-[var(--gutter)] lg:hidden">
            <li>
              <Link href={`/${gender}/${dept}`} className="chip" aria-current={!sub ? "page" : undefined}>
                Todo
              </Link>
            </li>
            {subs.map((s) => (
              <li key={s.slug}>
                <Link href={`/${gender}/${dept}/${s.slug}`} className="chip" aria-current={s.slug === sub ? "page" : undefined}>
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </PageTitle>
        <Listing
          base={{ gender, dept, sub }}
          dataUrl={`/data/l/${gender}-${dept}.json`}
          initial={(sub ? products.slice(0, 24) : spread(products, 24)).map(toCard)}
          total={products.length}
          subs={[
            { label: `Todo ${DEPTS[dept].toLowerCase()}`, href: `/${gender}/${dept}`, count: listing({ gender, dept }).length, active: !sub },
            ...subs.map((s) => ({ label: s.label, href: `/${gender}/${dept}/${s.slug}`, count: s.count, active: s.slug === sub })),
          ]}
        />
      </div>
      <OutfitCta gender={gender} />
    </div>
  );
}
