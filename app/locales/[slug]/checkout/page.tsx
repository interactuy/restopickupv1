import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutForm } from "@/components/cart/checkout-form";
import { getPublicBusinessCatalog } from "@/lib/supabase/public";

type CheckoutPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { slug } = await params;
  const catalog = await getPublicBusinessCatalog(slug);

  if (!catalog) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-10 md:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/locales/${catalog.business.slug}`}
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
          >
            Volver al menu
          </Link>
          <span className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-muted)]">
            Checkout invitado
          </span>
        </div>

        <CheckoutForm business={catalog.business} />
      </div>
    </main>
  );
}
