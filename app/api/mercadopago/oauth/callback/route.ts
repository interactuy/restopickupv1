import { NextResponse } from "next/server";

import {
  connectMercadoPagoBusinessAccount,
  consumeMercadoPagoOAuthState,
} from "@/lib/mercadopago/accounts";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard/pagos?error=mercadopago-oauth`, requestUrl)
    );
  }

  const oauthState = await consumeMercadoPagoOAuthState({ state });

  if (!oauthState || !code) {
    return NextResponse.redirect(
      new URL(`/dashboard/pagos?error=mercadopago-state`, requestUrl)
    );
  }

  try {
    await connectMercadoPagoBusinessAccount({
      businessId: oauthState.businessId,
      code,
    });

    return NextResponse.redirect(
      new URL("/dashboard/pagos?success=mercadopago-connected", requestUrl)
    );
  } catch (oauthError) {
    console.error("[mercadopago:oauth] callback failed", {
      businessId: oauthState.businessId,
      error: oauthError instanceof Error ? oauthError.message : oauthError,
    });

    return NextResponse.redirect(
      new URL("/dashboard/pagos?error=mercadopago-save", requestUrl)
    );
  }
}
