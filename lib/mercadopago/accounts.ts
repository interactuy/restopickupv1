import "server-only";

import crypto from "node:crypto";

import { MercadoPagoConfig, OAuth } from "mercadopago";
import { cookies } from "next/headers";

import { createAdminClient } from "@/lib/supabase/admin";
import { getMercadoPagoAccessToken, getMercadoPagoAppUrl } from "@/lib/mercadopago/server-config";

const OAUTH_COOKIE_NAME = "mercadopago_oauth_state";
const OAUTH_COOKIE_TTL_SECONDS = 60 * 10;

export type BusinessPaymentConnection = {
  businessId: string;
  provider: "mercado_pago";
  status: "disconnected" | "connected" | "error";
  mercadopagoUserId: number | null;
  mercadopagoPublicKey: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  liveMode: boolean;
  connectedAt: string | null;
  refreshedAt: string | null;
  revokedAt: string | null;
};

type PaymentConnectionRow = {
  business_id: string;
  provider: "mercado_pago";
  status: "disconnected" | "connected" | "error";
  mercadopago_user_id: number | null;
  mercadopago_public_key: string | null;
  access_token: string | null;
  refresh_token: string | null;
  live_mode: boolean;
  connected_at: string | null;
  refreshed_at: string | null;
  revoked_at: string | null;
};

function getMercadoPagoOAuthClientId() {
  const clientId = process.env.MERCADOPAGO_CLIENT_ID;

  if (!clientId) {
    throw new Error("Falta MERCADOPAGO_CLIENT_ID para conectar cuentas de Mercado Pago.");
  }

  return clientId;
}

function getMercadoPagoOAuthClientSecret() {
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;

  if (!clientSecret) {
    throw new Error("Falta MERCADOPAGO_CLIENT_SECRET para conectar cuentas de Mercado Pago.");
  }

  return clientSecret;
}

export function getMercadoPagoOAuthRedirectUrl() {
  return `${getMercadoPagoAppUrl()}/api/mercadopago/oauth/callback`;
}

function getOAuthClient() {
  return new OAuth(
    new MercadoPagoConfig({
      accessToken: getMercadoPagoAccessToken(),
    })
  );
}

function mapConnection(row: PaymentConnectionRow | null): BusinessPaymentConnection | null {
  if (!row) {
    return null;
  }

  return {
    businessId: row.business_id,
    provider: row.provider,
    status: row.status,
    mercadopagoUserId: row.mercadopago_user_id,
    mercadopagoPublicKey: row.mercadopago_public_key,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    liveMode: row.live_mode,
    connectedAt: row.connected_at,
    refreshedAt: row.refreshed_at,
    revokedAt: row.revoked_at,
  };
}

export async function getBusinessPaymentConnection(businessId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_payment_connections")
    .select(
      "business_id, provider, status, mercadopago_user_id, mercadopago_public_key, access_token, refresh_token, live_mode, connected_at, refreshed_at, revoked_at"
    )
    .eq("business_id", businessId)
    .maybeSingle<PaymentConnectionRow>();

  if (error) {
    throw new Error(`No se pudo cargar la conexión de pagos: ${error.message}`);
  }

  return mapConnection(data ?? null);
}

export async function listConnectedMercadoPagoBusinessConnections() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_payment_connections")
    .select(
      "business_id, provider, status, mercadopago_user_id, mercadopago_public_key, access_token, refresh_token, live_mode, connected_at, refreshed_at, revoked_at"
    )
    .eq("status", "connected")
    .not("access_token", "is", null)
    .returns<PaymentConnectionRow[]>();

  if (error) {
    throw new Error(`No se pudieron listar las conexiones de pago: ${error.message}`);
  }

  return (data ?? []).map((row) => mapConnection(row)).filter(Boolean) as BusinessPaymentConnection[];
}

export async function getMercadoPagoAccessTokenForBusiness(businessId: string) {
  const connection = await getBusinessPaymentConnection(businessId);

  if (connection?.status === "connected" && connection.accessToken) {
    return connection.accessToken;
  }

  return getMercadoPagoAccessToken();
}

export async function createMercadoPagoAuthorizationUrl(params: {
  businessId: string;
  userId: string;
}) {
  const state = crypto.randomUUID();
  const oauth = getOAuthClient();
  const redirectUrl = oauth.getAuthorizationURL({
    options: {
      client_id: getMercadoPagoOAuthClientId(),
      redirect_uri: getMercadoPagoOAuthRedirectUrl(),
      state,
    },
  });

  const store = await cookies();
  store.set(
    OAUTH_COOKIE_NAME,
    JSON.stringify({
      state,
      businessId: params.businessId,
      userId: params.userId,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: OAUTH_COOKIE_TTL_SECONDS,
    }
  );

  return redirectUrl;
}

export async function consumeMercadoPagoOAuthState(params: {
  state: string | null;
}) {
  const store = await cookies();
  const raw = store.get(OAUTH_COOKIE_NAME)?.value;
  store.delete(OAUTH_COOKIE_NAME);

  if (!raw || !params.state) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as {
      state: string;
      businessId: string;
      userId: string;
    };

    if (parsed.state !== params.state) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function connectMercadoPagoBusinessAccount(params: {
  businessId: string;
  code: string;
}) {
  const oauth = getOAuthClient();
  const response = await oauth.create({
    body: {
      client_id: getMercadoPagoOAuthClientId(),
      client_secret: getMercadoPagoOAuthClientSecret(),
      code: params.code,
      redirect_uri: getMercadoPagoOAuthRedirectUrl(),
    },
  });

  if (!response.access_token) {
    throw new Error("Mercado Pago no devolvió un access token para la cuenta conectada.");
  }

  const admin = createAdminClient();
  const { error } = await admin.from("business_payment_connections").upsert(
    {
      business_id: params.businessId,
      provider: "mercado_pago",
      status: "connected",
      mercadopago_user_id: response.user_id ?? null,
      mercadopago_public_key: response.public_key ?? null,
      access_token: response.access_token,
      refresh_token: response.refresh_token ?? null,
      live_mode: Boolean(response.live_mode),
      connected_at: new Date().toISOString(),
      refreshed_at: new Date().toISOString(),
      revoked_at: null,
    },
    {
      onConflict: "business_id",
    }
  );

  if (error) {
    throw new Error(`No se pudo guardar la cuenta conectada de Mercado Pago: ${error.message}`);
  }
}

export async function disconnectMercadoPagoBusinessAccount(businessId: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("business_payment_connections").upsert(
    {
      business_id: businessId,
      provider: "mercado_pago",
      status: "disconnected",
      mercadopago_user_id: null,
      mercadopago_public_key: null,
      access_token: null,
      refresh_token: null,
      live_mode: false,
      revoked_at: new Date().toISOString(),
    },
    {
      onConflict: "business_id",
    }
  );

  if (error) {
    throw new Error(`No se pudo desconectar Mercado Pago: ${error.message}`);
  }
}
