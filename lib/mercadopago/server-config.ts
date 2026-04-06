import "server-only";

export function getMercadoPagoAccessToken() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      "Falta configurar MERCADOPAGO_ACCESS_TOKEN para crear pagos con Mercado Pago."
    );
  }

  return accessToken;
}

export function getMercadoPagoAppUrl() {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("Falta configurar APP_URL para Mercado Pago.");
  }

  return appUrl.replace(/\/$/, "");
}

export function getMercadoPagoWebhookSecret() {
  return process.env.MERCADOPAGO_WEBHOOK_SECRET ?? null;
}

export function getMercadoPagoStatementDescriptor() {
  return process.env.MERCADOPAGO_STATEMENT_DESCRIPTOR;
}

export function isMercadoPagoSandboxMode() {
  return process.env.MERCADOPAGO_USE_SANDBOX === "true";
}
