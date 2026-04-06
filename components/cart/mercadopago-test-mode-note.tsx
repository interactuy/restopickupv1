"use client";

import { isMercadoPagoPublicKeyConfigured } from "@/lib/mercadopago/client";

type MercadoPagoTestModeNoteProps = {
  enabled: boolean;
};

export function MercadoPagoTestModeNote({
  enabled,
}: MercadoPagoTestModeNoteProps) {
  if (!enabled) {
    return null;
  }

  const hasPublicKey = isMercadoPagoPublicKeyConfigured();

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">Mercado Pago esta en modo test.</p>
      <p className="mt-1 leading-6">
        Usa una cuenta compradora de prueba para pagar.{" "}
        {hasPublicKey
          ? "La Public Key de prueba ya esta cargada en cliente."
          : "Todavia falta cargar NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY."}
      </p>
    </div>
  );
}
