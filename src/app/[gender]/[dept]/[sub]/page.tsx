import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/listing/CategoryPage";
import { LoadingBlock } from "@/components/page/PageBits";
import { subsFor } from "@/lib/catalog";
import { GENDERS, isDept, isGender, subLabel } from "@/lib/taxonomy";
import type { Dept, Gender } from "@/lib/types";

export function generateStaticParams() {
  return (["hombre", "mujer"] as Gender[]).flatMap((gender) =>
    (["ropa", "calzado", "accesorios"] as Dept[]).flatMap((dept) => subsFor(gender, dept).map((s) => ({ gender, dept, sub: s.slug }))),
  );
}

export async function generateMetadata({ params }: PageProps<"/[gender]/[dept]/[sub]">): Promise<Metadata> {
  const { gender, dept, sub } = await params;
  if (!isGender(gender) || !isDept(dept)) return {};
  return { title: `${subLabel(dept, sub)} de ${GENDERS[gender].label.toLowerCase()}` };
}

async function Body({ params }: { params: PageProps<"/[gender]/[dept]/[sub]">["params"] }) {
  const { gender, dept, sub } = await params;
  return <CategoryPage gender={gender} dept={dept} sub={sub} />;
}

export default function SubPage(props: PageProps<"/[gender]/[dept]/[sub]">) {
  return (
    <div className="pt-6 lg:pt-10">
      <Suspense fallback={<LoadingBlock />}>
        <Body params={props.params} />
      </Suspense>
    </div>
  );
}
