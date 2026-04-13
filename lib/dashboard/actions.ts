"use server";

import { createHash, randomBytes } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import {
  disableAdminMode,
  enableAdminMode,
  hashAdminPin,
  verifyAdminPin,
} from "@/lib/dashboard/admin-mode";
import {
  getImageExtension,
  parseProductOptionsInput,
  parseMoneyInput,
  parseOptionalMoneyInput,
  parsePositionInput,
  slugifyCategory,
  slugifyProduct,
} from "@/lib/dashboard/products";
import {
  getDashboardCategoryById,
  requireAdminDashboardContext,
  getDashboardProductById,
  requireDashboardContext,
} from "@/lib/dashboard/server";
import {
  createMercadoPagoAuthorizationUrl,
  disconnectMercadoPagoBusinessAccount,
} from "@/lib/mercadopago/accounts";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const PRODUCT_IMAGES_BUCKET = "product-images";
const BUSINESS_BRANDING_BUCKET = "business-branding";
const MAPBOX_GEOCODING_URL = "https://api.mapbox.com/search/geocode/v6/forward";
const BUSINESS_DAY_COUNT = 7;
const ADMIN_PIN_RESET_TTL_MS = 1000 * 60 * 30;

function buildDashboardProductsRedirect(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/dashboard/productos${query ? `?${query}` : ""}`;
}

function buildDashboardCategoriesRedirect(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/dashboard/categorias${query ? `?${query}` : ""}`;
}

function buildDashboardNewProductRedirect(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/dashboard/productos/nuevo${query ? `?${query}` : ""}`;
}

function buildDashboardProductEditRedirect(
  productId: string,
  params: Record<string, string>
) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/dashboard/productos/${productId}/editar${query ? `?${query}` : ""}`;
}

function buildDashboardCategoryEditRedirect(
  categoryId: string,
  params: Record<string, string>
) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/dashboard/categorias/${categoryId}/editar${query ? `?${query}` : ""}`;
}

function getAppUrl() {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("Falta APP_URL para generar links del dashboard.");
  }

  return appUrl.replace(/\/+$/, "");
}

function buildAdminModeRedirect(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/dashboard/admin-mode${query ? `?${query}` : ""}`;
}

function sanitizeDashboardNextPath(nextPath: string) {
  return nextPath.startsWith("/dashboard") ? nextPath : "/dashboard";
}

async function sendAdminPinResetEmail(params: {
  email: string;
  businessName: string;
  resetUrl: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;

  if (!resendApiKey || !resendFromEmail) {
    throw new Error(
      "Faltan RESEND_API_KEY o RESEND_FROM_EMAIL para enviar el reset del PIN."
    );
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [params.email],
      subject: `Reset de PIN admin para ${params.businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #24160d; line-height: 1.6;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Reset de PIN admin</h1>
          <p>Recibimos un pedido para cambiar el PIN admin de <strong>${params.businessName}</strong>.</p>
          <p>Si fuiste vos, usá este link para definir un PIN nuevo:</p>
          <p style="margin: 24px 0;">
            <a href="${params.resetUrl}" style="display: inline-block; background: #c67a30; color: white; text-decoration: none; padding: 12px 20px; border-radius: 999px; font-weight: 700;">
              Cambiar PIN admin
            </a>
          </p>
          <p>Este enlace vence en 30 minutos.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`No se pudo enviar el email de reset del PIN: ${body}`);
  }
}

async function ensureBusinessCategory(
  businessId: string,
  categoryId: string | null,
) {
  if (!categoryId) {
    return null;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_categories")
    .select("id")
    .eq("id", categoryId)
    .eq("business_id", businessId)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(`No se pudo validar la categoría: ${error.message}`);
  }

  if (!data) {
    throw new Error("La categoría seleccionada no pertenece a este negocio.");
  }

  return data.id;
}

async function ensureUniqueProductSlug(
  businessId: string,
  slug: string,
  currentProductId?: string,
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("id")
    .eq("business_id", businessId)
    .eq("slug", slug)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(`No se pudo validar el slug: ${error.message}`);
  }

  if (data && data.id !== currentProductId) {
    throw new Error("Ya existe otro producto con ese slug.");
  }
}

async function ensureUniqueCategorySlug(
  businessId: string,
  slug: string,
  currentCategoryId?: string
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_categories")
    .select("id")
    .eq("business_id", businessId)
    .eq("slug", slug)
    .maybeSingle<{ id: string }>();

  if (error) {
    throw new Error(`No se pudo validar el slug de la categoría: ${error.message}`);
  }

  if (data && data.id !== currentCategoryId) {
    throw new Error("Ya existe otra categoría con ese slug.");
  }
}

async function uploadProductImage(
  businessId: string,
  productId: string,
  file: File,
) {
  const extension = getImageExtension(file.type);

  if (!extension) {
    throw new Error("La imagen debe ser JPG, PNG o WEBP.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const storagePath = `${businessId}/${productId}/${Date.now()}.${extension}`;
  const admin = createAdminClient();

  const { error } = await admin.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }

  const { data } = admin.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
}

async function uploadBusinessBrandingImage(
  businessId: string,
  file: File,
  variant: "profile" | "cover"
) {
  const extension = getImageExtension(file.type);

  if (!extension) {
    throw new Error("La imagen debe ser JPG, PNG o WEBP.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const storagePath = `${businessId}/${variant}/${Date.now()}.${extension}`;
  const admin = createAdminClient();

  const { error } = await admin.storage
    .from(BUSINESS_BRANDING_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`No se pudo subir la imagen: ${error.message}`);
  }

  const { data } = admin.storage
    .from(BUSINESS_BRANDING_BUCKET)
    .getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
}

async function geocodePickupAddress(address: string) {
  const accessToken =
    process.env.MAPBOX_ACCESS_TOKEN ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!accessToken || !address) {
    return null;
  }

  const searchParams = new URLSearchParams({
    q: address,
    access_token: accessToken,
    limit: "1",
    autocomplete: "false",
    types: "address,street,place",
    country: "uy",
    language: "es",
    permanent: "true",
  });

  const response = await fetch(`${MAPBOX_GEOCODING_URL}?${searchParams.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Mapbox respondió ${response.status}.`);
  }

  const payload = (await response.json()) as {
    features?: Array<{
      geometry?: { coordinates?: [number, number] };
    }>;
  };

  const coordinates = payload.features?.[0]?.geometry?.coordinates;

  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  const [longitude, latitude] = coordinates;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function parseBusinessHoursFromFormData(formData: FormData) {
  const schedule = Array.from({ length: BUSINESS_DAY_COUNT }, (_, day) => {
    const isClosed = formData.get(`hours_${day}_closed`) === "on";
    const openTime = String(formData.get(`hours_${day}_open`) ?? "").trim();
    const closeTime = String(formData.get(`hours_${day}_close`) ?? "").trim();

    if (!isClosed && (!openTime || !closeTime)) {
      throw new Error("Cada día abierto debe tener horario de apertura y cierre.");
    }

    if (!isClosed && openTime >= closeTime) {
      throw new Error("La hora de cierre debe ser mayor a la de apertura.");
    }

    return {
      day,
      is_closed: isClosed,
      open_time: isClosed ? null : openTime,
      close_time: isClosed ? null : closeTime,
    };
  });

  return schedule;
}

async function replacePrimaryProductImage(params: {
  productId: string;
  businessId: string;
  productName: string;
  imageFile: File;
  previousStoragePath?: string | null;
}) {
  const admin = createAdminClient();
  const uploadedImage = await uploadProductImage(
    params.businessId,
    params.productId,
    params.imageFile,
  );

  const { data: existingImage, error: existingImageError } = await admin
    .from("product_images")
    .select("id, storage_path")
    .eq("product_id", params.productId)
    .eq("is_primary", true)
    .maybeSingle<{ id: string; storage_path: string }>();

  if (existingImageError) {
    throw new Error(
      `No se pudo consultar la imagen actual: ${existingImageError.message}`,
    );
  }

  const imagePayload = {
    storage_path: uploadedImage.storagePath,
    public_url: uploadedImage.publicUrl,
    alt_text: params.productName,
    position: 1,
    is_primary: true,
  };

  if (existingImage) {
    const { error } = await admin
      .from("product_images")
      .update(imagePayload)
      .eq("id", existingImage.id);

    if (error) {
      throw new Error(`No se pudo actualizar la imagen: ${error.message}`);
    }
  } else {
    const { error } = await admin.from("product_images").insert({
      product_id: params.productId,
      ...imagePayload,
    });

    if (error) {
      throw new Error(`No se pudo guardar la imagen: ${error.message}`);
    }
  }

  const staleStoragePath = existingImage?.storage_path ?? params.previousStoragePath ?? null;

  if (staleStoragePath && staleStoragePath !== uploadedImage.storagePath) {
    await admin.storage.from(PRODUCT_IMAGES_BUCKET).remove([staleStoragePath]);
  }
}

async function syncProductOptionGroups(
  productId: string,
  optionGroupsRaw: string
) {
  const optionGroups = parseProductOptionsInput(optionGroupsRaw);
  const admin = createAdminClient();

  const { error: deleteError } = await admin
    .from("product_option_groups")
    .delete()
    .eq("product_id", productId);

  if (deleteError) {
    throw new Error(
      `No se pudieron limpiar las opciones actuales: ${deleteError.message}`
    );
  }

  if (optionGroups.length === 0) {
    return;
  }

  for (const group of optionGroups) {
    const { data: insertedGroup, error: groupError } = await admin
      .from("product_option_groups")
      .insert({
        product_id: productId,
        name: group.name,
        description: group.description || null,
        selection_type: group.selectionType,
        is_required: group.isRequired,
        min_select: group.minSelect,
        max_select: group.maxSelect,
        position: group.position,
      })
      .select("id")
      .single<{ id: string }>();

    if (groupError || !insertedGroup) {
      throw new Error(
        `No se pudo guardar el grupo "${group.name}": ${groupError?.message ?? "sin respuesta"}`
      );
    }

    const { error: itemsError } = await admin.from("product_option_items").insert(
      group.items.map((item) => ({
        group_id: insertedGroup.id,
        name: item.name,
        price_delta_amount: item.priceDeltaAmount,
        is_active: item.isActive,
        position: item.position,
      }))
    );

    if (itemsError) {
      throw new Error(
        `No se pudieron guardar las opciones de "${group.name}": ${itemsError.message}`
      );
    }
  }
}

function parseProductFormData(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceAmount = parseMoneyInput(
    String(formData.get("priceAmount") ?? ""),
    "El precio",
  );
  const compareAtAmount = parseOptionalMoneyInput(
    String(formData.get("compareAtAmount") ?? ""),
  );
  const position = parsePositionInput(String(formData.get("position") ?? ""));
  const categoryIdValue = String(formData.get("categoryId") ?? "").trim();
  const isAvailable = String(formData.get("isAvailable") ?? "") === "true";
  const normalizedSlug = slugifyProduct(slugInput || name);

  if (!name) {
    throw new Error("El nombre del producto es obligatorio.");
  }

  if (!normalizedSlug) {
    throw new Error("El slug del producto no es válido.");
  }

  if (priceAmount < 0) {
    throw new Error("El precio no puede ser negativo.");
  }

  if (compareAtAmount !== null && compareAtAmount < priceAmount) {
    throw new Error("El precio anterior debe ser mayor o igual al precio actual.");
  }

  return {
    name,
    slug: normalizedSlug,
    description: description || null,
    priceAmount,
    compareAtAmount,
    position,
    categoryId: categoryIdValue || null,
    isAvailable,
  };
}

function parseCategoryFormData(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const position = parsePositionInput(String(formData.get("position") ?? ""));
  const isActive = String(formData.get("isActive") ?? "true") === "true";
  const normalizedSlug = slugifyCategory(slugInput || name);

  if (!name) {
    throw new Error("El nombre de la categoría es obligatorio.");
  }

  if (!normalizedSlug) {
    throw new Error("El slug de la categoría no es válido.");
  }

  return {
    name,
    slug: normalizedSlug,
    description: description || null,
    position,
    isActive,
  };
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/dashboard");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=invalid-credentials");
  }

  redirect(redirectTo || "/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function unlockAdminModeAction(formData: FormData) {
  const context = await requireDashboardContext();
  const pin = String(formData.get("pin") ?? "").trim();
  const pinConfirmation = String(formData.get("pinConfirmation") ?? "").trim();
  const nextPath = sanitizeDashboardNextPath(
    String(formData.get("next") ?? "/dashboard").trim() || "/dashboard"
  );

  if (!context.membership.isAdminRole) {
    redirect("/dashboard/pedidos");
  }

  if (!/^\d{4}$/.test(pin)) {
    redirect(
      buildAdminModeRedirect({
        error: "pin-format",
        next: nextPath,
      })
    );
  }

  const admin = createAdminClient();

  const { data: security, error: securityError } = await admin
    .from("business_admin_security")
    .select("business_id, pin_hash")
    .eq("business_id", context.business.id)
    .maybeSingle<{ business_id: string; pin_hash: string | null }>();

  if (securityError) {
    throw new Error(`No se pudo cargar la seguridad admin: ${securityError.message}`);
  }

  if (!security?.pin_hash) {
    if (pin !== pinConfirmation) {
      redirect(
        buildAdminModeRedirect({
          error: "pin-mismatch",
          next: nextPath,
        })
      );
    }

    const { error } = await admin.from("business_admin_security").upsert(
      {
        business_id: context.business.id,
        pin_hash: hashAdminPin(pin),
        pin_updated_at: new Date().toISOString(),
      },
      { onConflict: "business_id" }
    );

    if (error) {
      throw new Error(`No se pudo guardar el PIN admin: ${error.message}`);
    }
  } else if (!verifyAdminPin({ pin, hash: security.pin_hash })) {
    redirect(
      buildAdminModeRedirect({
        error: "pin-invalid",
        next: nextPath,
      })
    );
  }

  await enableAdminMode({
    businessId: context.business.id,
    userId: context.user.id,
  });

  redirect(nextPath);
}

export async function lockAdminModeAction() {
  const context = await requireDashboardContext();

  await disableAdminMode({
    businessId: context.business.id,
    userId: context.user.id,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pedidos");
  revalidatePath("/dashboard/configuracion");

  redirect("/dashboard/pedidos");
}

export async function updateAdminPinAction(formData: FormData) {
  const context = await requireAdminDashboardContext();
  const currentPin = String(formData.get("currentPin") ?? "").trim();
  const nextPin = String(formData.get("nextPin") ?? "").trim();
  const nextPinConfirmation = String(formData.get("nextPinConfirmation") ?? "").trim();

  if (!/^\d{4}$/.test(nextPin)) {
    redirect("/dashboard/configuracion?error=pin-format");
  }

  if (nextPin !== nextPinConfirmation) {
    redirect("/dashboard/configuracion?error=pin-mismatch");
  }

  const admin = createAdminClient();
  const { data: security, error: securityError } = await admin
    .from("business_admin_security")
    .select("business_id, pin_hash")
    .eq("business_id", context.business.id)
    .maybeSingle<{ business_id: string; pin_hash: string | null }>();

  if (securityError) {
    throw new Error(`No se pudo cargar el PIN actual: ${securityError.message}`);
  }

  if (security?.pin_hash && !verifyAdminPin({ pin: currentPin, hash: security.pin_hash })) {
    redirect("/dashboard/configuracion?error=pin-current-invalid");
  }

  const { error } = await admin.from("business_admin_security").upsert(
    {
      business_id: context.business.id,
      pin_hash: hashAdminPin(nextPin),
      pin_updated_at: new Date().toISOString(),
    },
    { onConflict: "business_id" }
  );

  if (error) {
    throw new Error(`No se pudo actualizar el PIN admin: ${error.message}`);
  }

  revalidatePath("/dashboard/configuracion");
  redirect("/dashboard/configuracion?success=pin-updated");
}

export async function requestAdminPinResetAction() {
  const context = await requireDashboardContext();

  if (!context.membership.isAdminRole) {
    redirect("/dashboard/pedidos");
  }

  const email = context.user.email ?? context.business.contactEmail;

  if (!email) {
    redirect("/dashboard/configuracion?error=pin-reset-email");
  }

  const rawToken = randomBytes(24).toString("hex");
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + ADMIN_PIN_RESET_TTL_MS).toISOString();
  const admin = createAdminClient();

  const { error } = await admin.from("business_admin_pin_resets").insert({
    business_id: context.business.id,
    requested_by_user_id: context.user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error(`No se pudo generar el reset del PIN: ${error.message}`);
  }

  const resetUrl = new URL("/dashboard/admin-mode/reset", getAppUrl());
  resetUrl.searchParams.set("token", rawToken);
  await sendAdminPinResetEmail({
    email,
    businessName: context.business.name,
    resetUrl: resetUrl.toString(),
  });

  redirect("/dashboard/configuracion?success=pin-reset-sent");
}

export async function completeAdminPinResetAction(formData: FormData) {
  const context = await requireDashboardContext();
  const token = String(formData.get("token") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();
  const pinConfirmation = String(formData.get("pinConfirmation") ?? "").trim();

  if (!context.membership.isAdminRole) {
    redirect("/dashboard/pedidos");
  }

  if (!/^\d{4}$/.test(pin)) {
    redirect(`/dashboard/admin-mode/reset?token=${encodeURIComponent(token)}&error=pin-format`);
  }

  if (pin !== pinConfirmation) {
    redirect(`/dashboard/admin-mode/reset?token=${encodeURIComponent(token)}&error=pin-mismatch`);
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const admin = createAdminClient();
  const { data: resetRequest, error: resetError } = await admin
    .from("business_admin_pin_resets")
    .select("id, business_id, used_at, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle<{ id: string; business_id: string; used_at: string | null; expires_at: string }>();

  if (resetError) {
    throw new Error(`No se pudo validar el reset del PIN: ${resetError.message}`);
  }

  if (
    !resetRequest ||
    resetRequest.business_id !== context.business.id ||
    resetRequest.used_at ||
    new Date(resetRequest.expires_at).getTime() < Date.now()
  ) {
    redirect("/dashboard/admin-mode/reset?token=invalid&error=token-invalid");
  }

  const { error: securityError } = await admin.from("business_admin_security").upsert(
    {
      business_id: context.business.id,
      pin_hash: hashAdminPin(pin),
      pin_updated_at: new Date().toISOString(),
    },
    { onConflict: "business_id" }
  );

  if (securityError) {
    throw new Error(`No se pudo guardar el PIN nuevo: ${securityError.message}`);
  }

  const { error: markUsedError } = await admin
    .from("business_admin_pin_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("id", resetRequest.id);

  if (markUsedError) {
    throw new Error(`No se pudo cerrar el reset del PIN: ${markUsedError.message}`);
  }

  await enableAdminMode({
    businessId: context.business.id,
    userId: context.user.id,
  });

  redirect("/dashboard/configuracion?success=pin-reset");
}

export async function startMercadoPagoConnectAction() {
  const context = await requireAdminDashboardContext();
  const authorizationUrl = await createMercadoPagoAuthorizationUrl({
    businessId: context.business.id,
    userId: context.user.id,
  });

  redirect(authorizationUrl);
}

export async function disconnectMercadoPagoConnectionAction() {
  const context = await requireAdminDashboardContext();
  await disconnectMercadoPagoBusinessAccount(context.business.id);
  revalidatePath("/dashboard/pagos");
  redirect("/dashboard/pagos?success=mercadopago-disconnected");
}

export async function updateOrderStatusAction(formData: FormData) {
  const context = await requireDashboardContext();
  const orderId = String(formData.get("orderId") ?? "");
  const statusCode = String(formData.get("statusCode") ?? "");
  const businessSlug = String(formData.get("businessSlug") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();

  const allowedStatuses = new Set([
    "pending",
    "preparing",
    "ready_for_pickup",
    "completed",
    "canceled",
  ]);

  if (!orderId || !allowedStatuses.has(statusCode)) {
    throw new Error("Estado de pedido inválido.");
  }

  const admin = createAdminClient();
  const updates: Record<string, string | null> = {
    status_code: statusCode,
  };

  if (statusCode === "ready_for_pickup") {
    updates.ready_for_pickup_at = new Date().toISOString();
  }

  if (statusCode === "completed") {
    updates.picked_up_at = new Date().toISOString();
  }

  if (statusCode === "canceled") {
    updates.canceled_at = new Date().toISOString();
  }

  const { error } = await admin
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .eq("business_id", context.business.id);

  if (error) {
    throw new Error(`No se pudo actualizar el pedido: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pedidos");

  if (businessSlug && orderNumber) {
    revalidatePath(`/locales/${businessSlug}/pedido/${orderNumber}`);
  }
}

export async function updateOrderEstimatedReadyAtAction(formData: FormData) {
  const context = await requireDashboardContext();
  const orderId = String(formData.get("orderId") ?? "").trim();
  const businessSlug = String(formData.get("businessSlug") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();
  const estimatedMinutes = Number.parseInt(
    String(formData.get("estimatedMinutes") ?? "").trim(),
    10
  );

  if (!orderId || Number.isNaN(estimatedMinutes) || estimatedMinutes < 0) {
    throw new Error("Tiempo estimado inválido.");
  }

  if (estimatedMinutes > 240) {
    throw new Error("El tiempo estimado no puede superar 240 minutos.");
  }

  const estimatedReadyAt = new Date(
    Date.now() + estimatedMinutes * 60 * 1000
  ).toISOString();

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({
      estimated_ready_at: estimatedReadyAt,
    })
    .eq("id", orderId)
    .eq("business_id", context.business.id);

  if (error) {
    throw new Error(
      `No se pudo actualizar el tiempo estimado: ${error.message}`
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pedidos");

  if (businessSlug && orderNumber) {
    revalidatePath(`/locales/${businessSlug}/pedido/${orderNumber}`);
  }
}

export async function deleteOrderAction(formData: FormData) {
  const context = await requireDashboardContext();
  const orderId = String(formData.get("orderId") ?? "").trim();

  if (!orderId) {
    throw new Error("Pedido inválido.");
  }

  const admin = createAdminClient();
  const { data: order, error: orderLookupError } = await admin
    .from("orders")
    .select("id, status_code")
    .eq("id", orderId)
    .eq("business_id", context.business.id)
    .maybeSingle<{ id: string; status_code: string }>();

  if (orderLookupError) {
    throw new Error(`No se pudo validar el pedido: ${orderLookupError.message}`);
  }

  if (!order) {
    throw new Error("No encontramos el pedido para eliminar.");
  }

  if (!["completed", "canceled"].includes(order.status_code)) {
    throw new Error("Solo se pueden eliminar pedidos entregados o cancelados.");
  }

  const { error } = await admin
    .from("orders")
    .delete()
    .eq("id", orderId)
    .eq("business_id", context.business.id);

  if (error) {
    throw new Error(`No se pudo eliminar el pedido: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pedidos");
  redirect("/dashboard/pedidos?tab=delivered");
}

export async function toggleProductAvailabilityAction(formData: FormData) {
  const context = await requireDashboardContext();
  const productId = String(formData.get("productId") ?? "");
  const nextValue = String(formData.get("nextValue") ?? "") === "true";

  if (!productId) {
    throw new Error("Producto inválido.");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("products")
    .update({
      is_available: nextValue,
    })
    .eq("id", productId)
    .eq("business_id", context.business.id);

  if (error) {
    throw new Error(`No se pudo actualizar el producto: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/productos");
  revalidatePath(`/locales/${context.business.slug}`);
}

export async function updateBusinessSettingsAction(formData: FormData) {
  const context = await requireAdminDashboardContext();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const contactActionType = String(formData.get("contactActionType") ?? "call").trim();
  const isTemporarilyClosed = formData.get("isTemporarilyClosed") === "on";
  const pickupAddress = String(formData.get("pickupAddress") ?? "").trim();
  const pickupInstructions = String(formData.get("pickupInstructions") ?? "").trim();
  const prepTimeMinMinutesRaw = String(formData.get("prepTimeMinMinutes") ?? "").trim();
  const prepTimeMaxMinutesRaw = String(formData.get("prepTimeMaxMinutes") ?? "").trim();
  const profileImageFile = formData.get("profileImage");
  const coverImageFile = formData.get("coverImage");

  const parsedPrepTimeMinMinutes = prepTimeMinMinutesRaw
    ? Number.parseInt(prepTimeMinMinutesRaw, 10)
    : Number.NaN;
  const parsedPrepTimeMaxMinutes = prepTimeMaxMinutesRaw
    ? Number.parseInt(prepTimeMaxMinutesRaw, 10)
    : Number.NaN;
  const prepTimeMinMinutes = Number.isInteger(parsedPrepTimeMinMinutes)
    ? parsedPrepTimeMinMinutes
    : null;
  const prepTimeMaxMinutes = Number.isInteger(parsedPrepTimeMaxMinutes)
    ? parsedPrepTimeMaxMinutes
    : null;
  if (!name || !pickupAddress) {
    throw new Error("Nombre y dirección de retiro son obligatorios.");
  }

  if (contactActionType !== "call" && contactActionType !== "whatsapp") {
    throw new Error("La acción de contacto debe ser llamada o WhatsApp.");
  }

  if (
    (prepTimeMinMinutesRaw &&
      (!Number.isInteger(parsedPrepTimeMinMinutes) ||
        parsedPrepTimeMinMinutes < 0)) ||
    (prepTimeMaxMinutesRaw &&
      (!Number.isInteger(parsedPrepTimeMaxMinutes) ||
        parsedPrepTimeMaxMinutes < 0))
  ) {
    throw new Error("El tiempo estimado debe ser un número entero mayor o igual a 0.");
  }

  if (
    prepTimeMinMinutes != null &&
    prepTimeMaxMinutes != null &&
    prepTimeMaxMinutes < prepTimeMinMinutes
  ) {
    throw new Error("El tiempo máximo no puede ser menor al mínimo.");
  }

  const admin = createAdminClient();
  const businessHours = parseBusinessHoursFromFormData(formData);
  let geocodedCoordinates = {
    latitude: context.business.latitude,
    longitude: context.business.longitude,
  };

  try {
    const result = await geocodePickupAddress(pickupAddress);

    geocodedCoordinates = result ?? { latitude: null, longitude: null };
  } catch (error) {
    console.error("[dashboard] geocoding failed", {
      businessId: context.business.id,
      pickupAddress,
      error: error instanceof Error ? error.message : "unknown",
    });

    geocodedCoordinates = { latitude: null, longitude: null };
  }

  let profileImageUpdate:
    | { profile_image_path: string; profile_image_url: string }
    | undefined;
  let coverImageUpdate:
    | { cover_image_path: string; cover_image_url: string }
    | undefined;

  if (profileImageFile instanceof File && profileImageFile.size > 0) {
    profileImageUpdate = await uploadBusinessBrandingImage(
      context.business.id,
      profileImageFile,
      "profile"
    ).then((image) => ({
      profile_image_path: image.storagePath,
      profile_image_url: image.publicUrl,
    }));
  }

  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    coverImageUpdate = await uploadBusinessBrandingImage(
      context.business.id,
      coverImageFile,
      "cover"
    ).then((image) => ({
      cover_image_path: image.storagePath,
      cover_image_url: image.publicUrl,
    }));
  }

  const { error } = await admin
    .from("businesses")
    .update({
      name,
      description: description || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      contact_action_type: contactActionType,
      business_hours_text: null,
      is_open_now: false,
      business_hours: businessHours,
      is_temporarily_closed: isTemporarilyClosed,
      pickup_address: pickupAddress,
      pickup_instructions: pickupInstructions || null,
      latitude: geocodedCoordinates.latitude,
      longitude: geocodedCoordinates.longitude,
      prep_time_min_minutes: prepTimeMinMinutes,
      prep_time_max_minutes: prepTimeMaxMinutes,
      ...(profileImageUpdate ?? {}),
      ...(coverImageUpdate ?? {}),
    })
    .eq("id", context.business.id);

  if (error) {
    throw new Error(`No se pudo actualizar el negocio: ${error.message}`);
  }

  if (
    profileImageUpdate &&
    context.business.profileImagePath &&
    context.business.profileImagePath !== profileImageUpdate.profile_image_path
  ) {
    await admin.storage
      .from(BUSINESS_BRANDING_BUCKET)
      .remove([context.business.profileImagePath]);
  }

  if (
    coverImageUpdate &&
    context.business.coverImagePath &&
    context.business.coverImagePath !== coverImageUpdate.cover_image_path
  ) {
    await admin.storage
      .from(BUSINESS_BRANDING_BUCKET)
      .remove([context.business.coverImagePath]);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/configuracion");
  revalidatePath("/dashboard/pedidos");
  revalidatePath(`/locales/${context.business.slug}`);
}

export async function toggleBusinessTemporaryClosedAction(formData: FormData) {
  const context = await requireAdminDashboardContext();
  const nextClosedState = formData.get("isTemporarilyClosed") === "true";
  const admin = createAdminClient();

  const { error } = await admin
    .from("businesses")
    .update({
      is_temporarily_closed: nextClosedState,
    })
    .eq("id", context.business.id);

  if (error) {
    throw new Error(`No se pudo actualizar el estado del local: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pedidos");
  revalidatePath("/dashboard/configuracion");
  revalidatePath(`/locales/${context.business.slug}`);
}

export async function completeDashboardOnboardingAction() {
  const context = await requireDashboardContext();

  if (!context.membership.isAdminRole) {
    redirect("/dashboard/pedidos");
  }

  if (!context.isAdminModeEnabled) {
    redirect("/dashboard/admin-mode?next=/dashboard/onboarding");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("businesses")
    .update({
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", context.business.id);

  if (error) {
    throw new Error(`No se pudo completar el onboarding: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/onboarding");
  redirect("/dashboard/configuracion");
}

export async function createProductAction(formData: FormData) {
  const context = await requireDashboardContext();

  try {
    const admin = createAdminClient();
    const productData = parseProductFormData(formData);
    const categoryId = await ensureBusinessCategory(
      context.business.id,
      productData.categoryId,
    );
    await ensureUniqueProductSlug(context.business.id, productData.slug);

    const { data: product, error } = await admin
      .from("products")
      .insert({
        business_id: context.business.id,
        category_id: categoryId,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price_amount: productData.priceAmount,
        compare_at_amount: productData.compareAtAmount,
        currency_code: context.business.currencyCode,
        is_available: productData.isAvailable,
        position: productData.position,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !product) {
      throw new Error(error?.message ?? "No se pudo crear el producto.");
    }

    const imageFile = formData.get("image");
    const optionGroupsRaw = String(formData.get("optionGroups") ?? "[]");

    if (imageFile instanceof File && imageFile.size > 0) {
      await replacePrimaryProductImage({
        productId: product.id,
        businessId: context.business.id,
        productName: productData.name,
        imageFile,
      });
    }

    await syncProductOptionGroups(product.id, optionGroupsRaw);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/productos");
    revalidatePath(`/dashboard/productos/${product.id}/editar`);
    revalidatePath(`/locales/${context.business.slug}`);

    redirect(
      buildDashboardProductEditRedirect(product.id, {
        success: "created",
      }),
    );
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? error.message : "No se pudo crear el producto.";

    redirect(
      buildDashboardNewProductRedirect({
        error: message,
      }),
    );
  }
}

export async function updateProductAction(formData: FormData) {
  const context = await requireDashboardContext();
  const productId = String(formData.get("productId") ?? "").trim();

  if (!productId) {
    redirect(
      buildDashboardProductsRedirect({
        error: "Producto inválido.",
      }),
    );
  }

  try {
    const existingProduct = await getDashboardProductById(context.business.id, productId);

    if (!existingProduct) {
      throw new Error("El producto no existe o no pertenece a este negocio.");
    }

    const admin = createAdminClient();
    const productData = parseProductFormData(formData);
    const categoryId = await ensureBusinessCategory(
      context.business.id,
      productData.categoryId,
    );
    await ensureUniqueProductSlug(
      context.business.id,
      productData.slug,
      existingProduct.id,
    );

    const { error } = await admin
      .from("products")
      .update({
        category_id: categoryId,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price_amount: productData.priceAmount,
        compare_at_amount: productData.compareAtAmount,
        is_available: productData.isAvailable,
        position: productData.position,
      })
      .eq("id", existingProduct.id)
      .eq("business_id", context.business.id);

    if (error) {
      throw new Error(`No se pudo actualizar el producto: ${error.message}`);
    }

    const imageFile = formData.get("image");
    const optionGroupsRaw = String(formData.get("optionGroups") ?? "[]");

    if (imageFile instanceof File && imageFile.size > 0) {
      await replacePrimaryProductImage({
        productId: existingProduct.id,
        businessId: context.business.id,
        productName: productData.name,
        imageFile,
        previousStoragePath: existingProduct.image?.storagePath ?? null,
      });
    }

    await syncProductOptionGroups(existingProduct.id, optionGroupsRaw);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/productos");
    revalidatePath(`/dashboard/productos/${existingProduct.id}/editar`);
    revalidatePath(`/locales/${context.business.slug}`);

    redirect(
      buildDashboardProductEditRedirect(existingProduct.id, {
        success: "updated",
      }),
    );
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo actualizar el producto.";

    redirect(
      buildDashboardProductEditRedirect(productId, {
        error: message,
      }),
    );
  }
}

export async function deleteProductAction(formData: FormData) {
  const context = await requireDashboardContext();
  const productId = String(formData.get("productId") ?? "").trim();

  if (!productId) {
    redirect(
      buildDashboardProductsRedirect({
        error: "Producto inválido.",
      }),
    );
  }

  try {
    const existingProduct = await getDashboardProductById(context.business.id, productId);

    if (!existingProduct) {
      throw new Error("El producto no existe o no pertenece a este negocio.");
    }

    const admin = createAdminClient();
    const { data: images, error: imagesError } = await admin
      .from("product_images")
      .select("storage_path")
      .eq("product_id", existingProduct.id)
      .returns<{ storage_path: string }[]>();

    if (imagesError) {
      throw new Error(`No se pudieron cargar las imágenes: ${imagesError.message}`);
    }

    const { error } = await admin
      .from("products")
      .delete()
      .eq("id", existingProduct.id)
      .eq("business_id", context.business.id);

    if (error) {
      throw new Error(`No se pudo eliminar el producto: ${error.message}`);
    }

    const storagePaths = (images ?? [])
      .map((image) => image.storage_path)
      .filter(Boolean);

    if (storagePaths.length > 0) {
      await admin.storage.from(PRODUCT_IMAGES_BUCKET).remove(storagePaths);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/productos");
    revalidatePath(`/locales/${context.business.slug}`);

    redirect(
      buildDashboardProductsRedirect({
        success: "deleted",
      }),
    );
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? error.message : "No se pudo eliminar el producto.";

    redirect(
      buildDashboardProductEditRedirect(productId, {
        error: message,
      }),
    );
  }
}

export async function createCategoryAction(formData: FormData) {
  const context = await requireDashboardContext();

  try {
    const categoryData = parseCategoryFormData(formData);
    await ensureUniqueCategorySlug(context.business.id, categoryData.slug);

    const admin = createAdminClient();
    const { data: category, error } = await admin
      .from("product_categories")
      .insert({
        business_id: context.business.id,
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        position: categoryData.position,
        is_active: categoryData.isActive,
      })
      .select("id")
      .single<{ id: string }>();

    if (error || !category) {
      throw new Error(error?.message ?? "No se pudo crear la categoría.");
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categorias");
    revalidatePath("/dashboard/productos");
    revalidatePath(`/locales/${context.business.slug}`);

    redirect(
      buildDashboardCategoryEditRedirect(category.id, {
        success: "created",
      })
    );
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error ? error.message : "No se pudo crear la categoría.";

    redirect(
      buildDashboardCategoriesRedirect({
        error: message,
      })
    );
  }
}

export async function updateCategoryAction(formData: FormData) {
  const context = await requireDashboardContext();
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!categoryId) {
    redirect(
      buildDashboardCategoriesRedirect({
        error: "Categoría inválida.",
      })
    );
  }

  try {
    const existingCategory = await getDashboardCategoryById(
      context.business.id,
      categoryId
    );

    if (!existingCategory) {
      throw new Error("La categoría no existe o no pertenece a este negocio.");
    }

    const categoryData = parseCategoryFormData(formData);
    await ensureUniqueCategorySlug(
      context.business.id,
      categoryData.slug,
      existingCategory.id
    );

    const admin = createAdminClient();
    const { error } = await admin
      .from("product_categories")
      .update({
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        position: categoryData.position,
        is_active: categoryData.isActive,
      })
      .eq("id", existingCategory.id)
      .eq("business_id", context.business.id);

    if (error) {
      throw new Error(`No se pudo actualizar la categoría: ${error.message}`);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categorias");
    revalidatePath("/dashboard/productos");
    revalidatePath(`/locales/${context.business.slug}`);

    redirect(
      buildDashboardCategoryEditRedirect(existingCategory.id, {
        success: "updated",
      })
    );
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo actualizar la categoría.";

    redirect(
      buildDashboardCategoryEditRedirect(categoryId, {
        error: message,
      })
    );
  }
}

export async function deleteCategoryAction(formData: FormData) {
  const context = await requireDashboardContext();
  const categoryId = String(formData.get("categoryId") ?? "").trim();

  if (!categoryId) {
    redirect(
      buildDashboardCategoriesRedirect({
        error: "Categoría inválida.",
      })
    );
  }

  try {
    const existingCategory = await getDashboardCategoryById(
      context.business.id,
      categoryId
    );

    if (!existingCategory) {
      throw new Error("La categoría no existe o no pertenece a este negocio.");
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("product_categories")
      .delete()
      .eq("id", existingCategory.id)
      .eq("business_id", context.business.id);

    if (error) {
      throw new Error(`No se pudo eliminar la categoría: ${error.message}`);
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/categorias");
    revalidatePath("/dashboard/productos");
    revalidatePath(`/locales/${context.business.slug}`);

    redirect(
      buildDashboardCategoriesRedirect({
        success: "deleted",
      })
    );
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo eliminar la categoría.";

    redirect(
      buildDashboardCategoryEditRedirect(categoryId, {
        error: message,
      })
    );
  }
}
