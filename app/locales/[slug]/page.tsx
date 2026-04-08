import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BusinessCatalog } from "@/components/public/business-catalog";
import { getPublicBusinessCatalog } from "@/lib/supabase/public";

type BusinessPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getPublicBusinessCatalog(slug);

  if (!catalog) {
    return {
      title: "Local no encontrado | Restopickup",
    };
  }

  return {
    title: `${catalog.business.name} | Restopickup`,
    description:
      catalog.business.description?.trim() ||
      `Menu online para retirar en ${catalog.business.name}.`,
  };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params;
  const catalog = await getPublicBusinessCatalog(slug);

  if (!catalog) {
    notFound();
  }

  return <BusinessCatalog catalog={catalog} />;
}
