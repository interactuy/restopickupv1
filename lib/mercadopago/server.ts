import "server-only";

import crypto from "node:crypto";

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { NextRequest } from "next/server";

import {
  getBusinessPaymentConnection,
  getMercadoPagoAccessTokenForBusiness,
  listConnectedMercadoPagoBusinessConnections,
} from "@/lib/mercadopago/accounts";
import {
  getMercadoPagoAccessToken,
  getMercadoPagoAppUrl,
  getMercadoPagoStatementDescriptor,
  getMercadoPagoWebhookSecret,
  isMercadoPagoSandboxMode,
} from "@/lib/mercadopago/server-config";
import { recordFunnelEvent } from "@/lib/analytics/funnel-server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicBusiness } from "@/lib/public-catalog";

type MercadoPagoOrderItem = {
  productId: string;
  productName: string;
  productDescription: string | null;
  quantity: number;
  finalUnitPriceAmount: number;
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

type MercadoPagoPaymentSearchResponse = {
  results?: Array<{
    id?: number;
    status?: string | null;
    date_created?: string;
  }>;
};

function getMercadoPagoClient(accessToken: string) {
  return new MercadoPagoConfig({
    accessToken,
  });
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

async function findMercadoPagoPaymentIdByExternalReference(
  externalReference: string,
  accessToken: string
) {
  const searchUrl = new URL("https://api.mercadopago.com/v1/payments/search");
  searchUrl.searchParams.set("sort", "date_created");
  searchUrl.searchParams.set("criteria", "desc");
  searchUrl.searchParams.set("external_reference", externalReference);

  const response = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Mercado Pago no devolvio pagos para external_reference ${externalReference}: ${response.status} ${body}`
    );
  }

  const payload =
    (await response.json()) as MercadoPagoPaymentSearchResponse;
  const results = payload.results ?? [];

  const prioritizedPayment = results.find((payment) =>
    ["approved", "authorized", "in_process", "pending"].includes(
      payment.status ?? ""
    )
  );

  return prioritizedPayment?.id ?? results[0]?.id ?? null;
}

export function getMercadoPagoReturnLabel(
  paymentStatus: string,
  checkoutStatus?: string | null
) {
  if (paymentStatus === "paid" || paymentStatus === "authorized") {
    return {
      eyebrow: "Pago aprobado",
      title: "Pago confirmado",
      description:
        "Tu pago fue aprobado y el local ya recibió el pedido para prepararlo.",
    };
  }

  if (paymentStatus === "failed") {
    return {
      eyebrow: "Pago no aprobado",
      title: "El pago no se completó",
      description:
        "No recibimos la confirmación del cobro. Podés volver a intentarlo más tarde.",
    };
  }

  if (checkoutStatus === "failure") {
    return {
      eyebrow: "Pago interrumpido",
      title: "El pago no se completó",
      description:
        "Mercado Pago no confirmó el cobro. Si el pago se aprueba, esta pantalla se actualiza sola.",
    };
  }

  return {
    eyebrow: "Pago pendiente",
    title: "Estamos confirmando el pago",
    description:
      "Cuando Mercado Pago confirme el cobro, el estado del pedido se va a actualizar automáticamente.",
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
  const accessToken = await getMercadoPagoAccessTokenForBusiness(business.id);
  const paymentConnection = await getBusinessPaymentConnection(business.id);
  const client = getMercadoPagoClient(accessToken);
  const preference = new Preference(client);
  const appUrl = getMercadoPagoAppUrl();

  const response = await preference.create({
    body: {
      external_reference: order.id,
      notification_url: `${appUrl}/api/mercadopago/webhook`,
      statement_descriptor: getMercadoPagoStatementDescriptor(),
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
        unit_price: item.finalUnitPriceAmount,
      })),
      metadata: {
        order_id: order.id,
        order_number: order.orderNumber,
        business_id: business.id,
        business_slug: business.slug,
        connected_account_id: paymentConnection?.mercadopagoUserId ?? null,
      },
    },
  });

  // Checkout Pro redirige al comprador a Mercado Pago.
  // En este flujo el Access Token se usa solo en backend y la Public Key
  // queda reservada para integraciones client-side futuras, como Bricks.
  const checkoutUrl =
    isMercadoPagoSandboxMode() && response.sandbox_init_point
      ? response.sandbox_init_point
      : response.init_point;

  if (!response.id || !checkoutUrl) {
    throw new Error("Mercado Pago no devolvio una preferencia valida.");
  }

  const supabase = createAdminClient();

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
  const secret = getMercadoPagoWebhookSecret();

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
  notificationPayload?: unknown,
  accessToken?: string
): Promise<PaymentSyncResult> {
  let payment:
    | Awaited<ReturnType<Payment["get"]>>
    | null = null;
  let lastError: unknown = null;

  const accessTokensToTry = accessToken
    ? [accessToken]
    : [
        getMercadoPagoAccessToken(),
        ...(await listConnectedMercadoPagoBusinessConnections())
          .map((connection) => connection.accessToken)
          .filter((token): token is string => Boolean(token)),
      ];

  for (const token of Array.from(new Set(accessTokensToTry))) {
    try {
      const client = getMercadoPagoClient(token);
      const paymentClient = new Payment(client);
      payment = await paymentClient.get({ id: paymentId });
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!payment) {
    throw lastError instanceof Error
      ? lastError
      : new Error("No pudimos leer el pago de Mercado Pago.");
  }

  const externalReference = payment.external_reference;

  if (!externalReference) {
    throw new Error("Mercado Pago devolvio un pago sin external_reference.");
  }

  const supabase = createAdminClient();
  const orderPaymentStatus = mapMercadoPagoStatusToOrderPaymentStatus(payment.status);
  const paymentReference = payment.id ? String(payment.id) : null;
  const { data: order, error: orderLookupError } = await supabase
    .from("orders")
    .select("id, business_id, currency_code, total_amount, metadata")
    .eq("id", externalReference)
    .single<{
      id: string;
      business_id: string;
      currency_code: string;
      total_amount: number;
      metadata: Record<string, unknown> | null;
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
        ...(order.metadata ?? {}),
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

  if (orderPaymentStatus === "paid" || orderPaymentStatus === "authorized") {
    await recordFunnelEvent({
      eventType: "payment_success",
      businessId: order.business_id,
      orderId: order.id,
      sessionId:
        typeof order.metadata?.funnel_session_id === "string"
          ? order.metadata.funnel_session_id
          : null,
      metadata: {
        mercadopagoPaymentId: payment.id ?? null,
        mercadopagoStatus: payment.status ?? null,
      },
    });
  }

  return {
    paymentStatus: orderPaymentStatus,
    paymentReference,
  };
}

export async function syncMercadoPagoPaymentByExternalReference(
  externalReference: string,
  notificationPayload?: unknown
) {
  const supabase = createAdminClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("business_id")
    .eq("id", externalReference)
    .maybeSingle<{ business_id: string }>();

  if (orderError || !order) {
    return null;
  }

  const accessToken = await getMercadoPagoAccessTokenForBusiness(order.business_id);
  const paymentId = await findMercadoPagoPaymentIdByExternalReference(
    externalReference,
    accessToken
  );

  if (!paymentId) {
    return null;
  }

  return syncMercadoPagoPayment(paymentId, notificationPayload, accessToken);
}

export async function syncMercadoPagoPaymentFromWebhook(
  paymentId: string | number,
  notificationPayload?: unknown
) {
  return syncMercadoPagoPayment(paymentId, notificationPayload);
}

export async function markMercadoPagoRedirectAsAuthorized(params: {
  orderId: string;
}) {
  const supabase = createAdminClient();

  const { data: order, error: orderLookupError } = await supabase
    .from("orders")
    .select("id, metadata, payment_status")
    .eq("id", params.orderId)
    .maybeSingle<{
      id: string;
      metadata: Record<string, unknown> | null;
      payment_status: string;
    }>();

  if (orderLookupError || !order) {
    throw new Error("No encontramos el pedido para confirmar el pago.");
  }

  if (["paid", "authorized"].includes(order.payment_status)) {
    return;
  }

  const { error } = await supabase
    .from("orders")
    .update({
      payment_provider: "mercado_pago",
      payment_status: "authorized",
      metadata: {
        ...(order.metadata ?? {}),
        mercadopago_redirect_status: "success",
        mercadopago_redirect_assumed_authorized: true,
      },
    })
    .eq("id", params.orderId);

  if (error) {
    throw new Error(`No pudimos confirmar el pago desde el retorno: ${error.message}`);
  }
}

export function getFormattedPaymentStatus(paymentStatus: string) {
  switch (paymentStatus) {
    case "paid":
      return "Pagado";
    case "authorized":
      return "Pagado";
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
