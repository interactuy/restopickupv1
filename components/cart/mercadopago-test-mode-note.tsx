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
      <p className="font-medium">Entorno de prueba activo.</p>
      <p className="mt-1 leading-6">
        Usá una cuenta compradora de prueba para simular el pago.{" "}
        {hasPublicKey
          ? "No uses tarjetas reales en este entorno."
          : "Falta completar la configuración pública de Mercado Pago para probar."}
      </p>
    </div>
  );
}
