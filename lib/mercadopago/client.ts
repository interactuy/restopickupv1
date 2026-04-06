import "client-only";

export function getMercadoPagoPublicKey() {
  return process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY ?? null;
}

export function isMercadoPagoPublicKeyConfigured() {
  return Boolean(getMercadoPagoPublicKey());
}
