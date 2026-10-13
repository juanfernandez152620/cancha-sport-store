import type { Metadata } from "next";
import { Suspense } from "react";
import { Crumbs, LoadingBlock } from "@/components/page/PageBits";
import { SearchResults } from "@/components/search/SearchResults";

export const metadata: Metadata = { title: "Buscar" };

export default function SearchPage() {
  return (
    <div className="pb-8 pt-6 lg:pt-10">
      <Crumbs items={[{ label: "Buscar" }]} />
      <Suspense fallback={<LoadingBlock />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
