import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPage } from "@/components/listing/CategoryPage";
import { LoadingBlock } from "@/components/page/PageBits";
import { DEPTS, GENDERS, isDept, isGender } from "@/lib/taxonomy";

export function generateStaticParams() {
  return ["hombre", "mujer"].flatMap((gender) => ["ropa", "calzado", "accesorios"].map((dept) => ({ gender, dept })));
}

export async function generateMetadata({ params }: PageProps<"/[gender]/[dept]">): Promise<Metadata> {
  const { gender, dept } = await params;
  if (!isGender(gender) || !isDept(dept)) return {};
  return { title: `${DEPTS[dept]} de ${GENDERS[gender].label.toLowerCase()}` };
}

async function Body({ params }: { params: PageProps<"/[gender]/[dept]">["params"] }) {
  const { gender, dept } = await params;
  return <CategoryPage gender={gender} dept={dept} />;
}

export default function DeptPage(props: PageProps<"/[gender]/[dept]">) {
  return (
    <div className="pt-6 lg:pt-10">
      <Suspense fallback={<LoadingBlock />}>
        <Body params={props.params} />
      </Suspense>
    </div>
  );
}
