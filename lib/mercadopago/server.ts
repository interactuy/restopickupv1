import "server-only";

import crypto from "node:crypto";

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { PublicBusiness } from "@/lib/public-catalog";

type MercadoPagoOrderItem = {
  productId: string;
  productName: string;
  productDescription: string | null;
  quantity: number;
  unitPriceAmount: number;
  lineTotalAmount: number;
};

type CreatePreferenceInput = {
  business: PublicBusiness;
  order: {
    id: string;
    orderNumber: number;
    totalAmount: number;
    currencyCode: string;
    customerName: string;
    customerPhone: string | null;
  };
  items: MercadoPagoOrderItem[];
};

type PaymentSyncResult = {
  paymentStatus: string;
  paymentReference: string | null;
};

function getMercadoPagoClient() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error(
      "Falta configurar MERCADOPAGO_ACCESS_TOKEN para crear pagos con Mercado Pago."
    );
  }

  return new MercadoPagoConfig({
    accessToken,
  });
}

function getAppUrl() {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("Falta configurar APP_URL para Mercado Pago.");
  }

  return appUrl.replace(/\/$/, "");
}

function shouldUseSandbox() {
  return process.env.MERCADOPAGO_USE_SANDBOX === "true";
}

function mapMercadoPagoStatusToOrderPaymentStatus(status?: string | null) {
  switch (status) {
    case "approved":
      return "paid";
    case "authorized":
      return "authorized";
    case "refunded":
      return "refunded";
    case "cancelled":
      return "canceled";
    case "rejected":
      return "failed";
    case "charged_back":
      return "failed";
    case "in_process":
    case "pending":
    default:
      return "pending";
  }
}

export function getMercadoPagoReturnLabel(
  paymentStatus: string,
  checkoutStatus?: string | null
) {
  if (paymentStatus === "paid") {
    return {
      eyebrow: "Pago aprobado",
      title: "Pago confirmado",
      description:
        "Tu pago fue aprobado y el pedido ya quedo registrado para preparacion.",
    };
  }

  if (paymentStatus === "authorized") {
    return {
      eyebrow: "Pago autorizado",
      title: "Pago autorizado",
      description:
        "Mercado Pago autorizo el pago. El pedido ya existe y el local puede continuar con la preparacion.",
    };
  }

  if (paymentStatus === "failed") {
    return {
      eyebrow: "Pago no aprobado",
      title: "El pedido existe, pero el pago no se completo",
      description:
        "El pedido se guardo igualmente. Revisá el estado del pago o volvé a intentar mas tarde.",
    };
  }

  if (checkoutStatus === "failure") {
    return {
      eyebrow: "Pago interrumpido",
      title: "El pago no se completo",
      description:
        "El pedido sigue registrado, pero Mercado Pago no confirmo el cobro.",
    };
  }

  return {
    eyebrow: "Pago pendiente",
    title: "Estamos esperando confirmacion de Mercado Pago",
    description:
      "Tu pedido ya existe. Cuando Mercado Pago confirme el cobro, este estado se va a actualizar automaticamente.",
  };
}

function buildPhone(phone: string | null) {
  if (!phone) {
    return undefined;
  }

  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return undefined;
  }

  if (digits.length > 8) {
    return {
      area_code: digits.slice(0, digits.length - 8),
      number: digits.slice(-8),
    };
  }

  return {
    number: digits,
  };
}

export async function createMercadoPagoPreference({
  business,
  order,
  items,
}: CreatePreferenceInput) {
  const client = getMercadoPagoClient();
  const preference = new Preference(client);
  const appUrl = getAppUrl();

  const response = await preference.create({
    body: {
      external_reference: order.id,
      notification_url: `${appUrl}/api/mercadopago/webhook`,
      statement_descriptor: process.env.MERCADOPAGO_STATEMENT_DESCRIPTOR,
      auto_return: "approved",
      back_urls: {
        success: `${appUrl}/locales/${business.slug}/pedido/${order.orderNumber}?checkout_status=success`,
        pending: `${appUrl}/locales/${business.slug}/pedido/${order.orderNumber}?checkout_status=pending`,
        failure: `${appUrl}/locales/${business.slug}/pedido/${order.orderNumber}?checkout_status=failure`,
      },
      payer: {
        name: order.customerName,
        phone: buildPhone(order.customerPhone),
      },
      items: items.map((item) => ({
        id: item.productId,
        title: item.productName,
        description: item.productDescription ?? undefined,
        quantity: item.quantity,
        currency_id: business.currencyCode,
        unit_price: item.unitPriceAmount,
      })),
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
        business_id: business.id,
        business_slug: business.slug,
      },
    },
  });

  const checkoutUrl =
    shouldUseSandbox() && response.sandbox_init_point
      ? response.sandbox_init_point
      : response.init_point;

  if (!response.id || !checkoutUrl) {
    throw new Error("Mercado Pago no devolvio una preferencia valida.");
  }

  const supabase = await createClient();

  const { error: paymentInsertError } = await supabase.from("payments").upsert(
    {
      order_id: order.id,
      business_id: business.id,
      provider: "mercado_pago",
      external_reference: order.id,
      preference_id: response.id,
      status: "pending",
      checkout_url: checkoutUrl,
      currency_code: business.currencyCode,
      amount: order.totalAmount,
      raw_preference: response,
    },
    {
      onConflict: "external_reference",
    }
  );

  if (paymentInsertError) {
    throw new Error(
      `No se pudo guardar la preferencia de Mercado Pago: ${paymentInsertError.message}`
    );
  }

  const { error: orderUpdateError } = await supabase
    .from("orders")
    .update({
      payment_provider: "mercado_pago",
      payment_reference: response.id,
      payment_status: "pending",
    })
    .eq("id", order.id);

  if (orderUpdateError) {
    throw new Error(
      `No se pudo asociar Mercado Pago al pedido: ${orderUpdateError.message}`
    );
  }

  return {
    preferenceId: response.id,
    checkoutUrl,
    rawPreference: response,
  };
}

function parseSignatureHeader(signatureHeader: string) {
  return signatureHeader.split(",").reduce<Record<string, string>>((parts, item) => {
    const [rawKey, rawValue] = item.split("=");

    if (rawKey && rawValue) {
      parts[rawKey.trim()] = rawValue.trim();
    }

    return parts;
  }, {});
}

export function verifyMercadoPagoWebhookSignature(request: NextRequest) {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    return false;
  }

  const signatureHeader = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  const dataId =
    request.nextUrl.searchParams.get("data.id") ??
    request.nextUrl.searchParams.get("id");

  if (!signatureHeader || !requestId || !dataId) {
    return false;
  }

  const parsedSignature = parseSignatureHeader(signatureHeader);
  const ts = parsedSignature.ts;
  const receivedHash = parsedSignature.v1;

  if (!ts || !receivedHash) {
    return false;
  }

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expectedHash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedHash),
      Buffer.from(receivedHash)
    );
  } catch {
    return false;
  }
}

export async function syncMercadoPagoPayment(
  paymentId: string | number,
  notificationPayload?: unknown
): Promise<PaymentSyncResult> {
  const client = getMercadoPagoClient();
  const paymentClient = new Payment(client);
  const payment = await paymentClient.get({ id: paymentId });

  const externalReference = payment.external_reference;

  if (!externalReference) {
    throw new Error("Mercado Pago devolvio un pago sin external_reference.");
  }

  const supabase = await createClient();
  const orderPaymentStatus = mapMercadoPagoStatusToOrderPaymentStatus(payment.status);
  const paymentReference = payment.id ? String(payment.id) : null;
  const { data: order, error: orderLookupError } = await supabase
    .from("orders")
    .select("id, business_id, currency_code, total_amount")
    .eq("id", externalReference)
    .single<{
      id: string;
      business_id: string;
      currency_code: string;
      total_amount: number;
    }>();

  if (orderLookupError || !order) {
    throw new Error("No se encontro el pedido asociado al pago de Mercado Pago.");
  }

  const { error: paymentsError } = await supabase.from("payments").upsert(
    {
      order_id: order.id,
      business_id: order.business_id,
      external_reference: externalReference,
      provider: "mercado_pago",
      payment_id: payment.id,
      merchant_order_id: payment.order?.id,
      preference_id: payment.metadata?.preference_id ?? null,
      status: payment.status ?? "pending",
      status_detail: payment.status_detail ?? null,
      currency_code: order.currency_code,
      amount: order.total_amount,
      raw_payment: payment,
      notification_payload: notificationPayload ?? null,
    },
    {
      onConflict: "external_reference",
    }
  );

  if (paymentsError) {
    throw new Error(
      `No se pudo sincronizar el pago en la base: ${paymentsError.message}`
    );
  }

  const { error: ordersError } = await supabase
    .from("orders")
    .update({
      payment_provider: "mercado_pago",
      payment_reference: paymentReference,
      payment_status: orderPaymentStatus,
      metadata: {
        mercadopago_status: payment.status ?? null,
        mercadopago_status_detail: payment.status_detail ?? null,
      },
    })
    .eq("id", externalReference);

  if (ordersError) {
    throw new Error(
      `No se pudo actualizar el pedido con el estado del pago: ${ordersError.message}`
    );
  }

  return {
    paymentStatus: orderPaymentStatus,
    paymentReference,
  };
}

export function getFormattedPaymentStatus(paymentStatus: string) {
  switch (paymentStatus) {
    case "paid":
      return "Pagado";
    case "authorized":
      return "Autorizado";
    case "failed":
      return "Fallido";
    case "refunded":
      return "Reintegrado";
    case "canceled":
      return "Cancelado";
    default:
      return "Pendiente";
  }
}
