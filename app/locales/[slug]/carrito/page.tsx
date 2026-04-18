import Link from "next/link";
import { notFound } from "next/navigation";

import { CartSummaryPanel } from "@/components/cart/cart-summary-panel";
import { getPublicBusinessCatalog } from "@/lib/supabase/public";

type CartPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CartPage({ params }: CartPageProps) {
  const { slug } = await params;
  const catalog = await getPublicBusinessCatalog(slug);

  if (!catalog) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-6 md:px-10 md:py-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/locales/${catalog.business.slug}`}
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
          >
            Volver al menú
          </Link>
          <span className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-muted)]">
            Paso 1 de 2 · Revisar pedido
          </span>
        </div>

        <CartSummaryPanel
          businessId={catalog.business.id}
          businessSlug={catalog.business.slug}
          businessName={catalog.business.name}
          currencyCode={catalog.business.currencyCode}
          products={catalog.products}
          variant="page"
        />
      </div>
    </main>
  );
}
