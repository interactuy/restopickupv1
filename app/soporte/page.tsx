import type { Metadata } from "next";

import { SupportHeader } from "@/components/public/support-header";
import { SupportHome } from "@/components/public/support-home";
import { supportCategories, supportArticles } from "@/lib/support-content";

export const metadata: Metadata = {
  title: "Soporte | Restopickup",
  description: "Centro de ayuda para locales que usan Restopickup.",
};

type SupportPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SupportPage({ searchParams }: SupportPageProps) {
  const query = (await searchParams).q ?? "";

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <SupportHeader />
      <SupportHome
        categories={supportCategories}
        articles={supportArticles}
        initialQuery={query}
      />
    </main>
  );
}
