import Link from "next/link";
import { notFound } from "next/navigation";

import { CheckoutForm } from "@/components/cart/checkout-form";
import { isMercadoPagoSandboxMode } from "@/lib/mercadopago/server-config";
import { getPublicBusinessCatalog } from "@/lib/supabase/public";

type CheckoutPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ payment?: string }>;
};

export default async function CheckoutPage({
  params,
  searchParams,
}: CheckoutPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const catalog = await getPublicBusinessCatalog(slug);

  if (!catalog) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-6 py-6 md:px-10 md:py-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/locales/${catalog.business.slug}/carrito`}
            className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-foreground)]"
          >
            Volver al carrito
          </Link>
          <span className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm text-[var(--color-muted)]">
            Paso 2 de 2 · Checkout invitado
          </span>
        </div>

        <CheckoutForm
          business={catalog.business}
          products={catalog.products}
          isMercadoPagoTestMode={isMercadoPagoSandboxMode()}
          paymentFeedback={query.payment === "failed" ? "failed" : query.payment === "pending" ? "pending" : null}
        />
      </div>
    </main>
  );
}
