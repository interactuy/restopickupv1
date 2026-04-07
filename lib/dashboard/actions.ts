"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import {
  getImageExtension,
  parseProductOptionsInput,
  parseMoneyInput,
  parseOptionalMoneyInput,
  parsePositionInput,
  slugifyProduct,
} from "@/lib/dashboard/products";
import { getDashboardProductById, requireDashboardContext } from "@/lib/dashboard/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const PRODUCT_IMAGES_BUCKET = "product-images";

function buildDashboardProductsRedirect(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/dashboard/productos${query ? `?${query}` : ""}`;
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
  const context = await requireDashboardContext();
  const name = String(formData.get("name") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();
  const pickupAddress = String(formData.get("pickupAddress") ?? "").trim();
  const pickupInstructions = String(formData.get("pickupInstructions") ?? "").trim();

  if (!name || !pickupAddress) {
    throw new Error("Nombre y dirección de retiro son obligatorios.");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("businesses")
    .update({
      name,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
      pickup_address: pickupAddress,
      pickup_instructions: pickupInstructions || null,
    })
    .eq("id", context.business.id);

  if (error) {
    throw new Error(`No se pudo actualizar el negocio: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/configuracion");
  revalidatePath(`/locales/${context.business.slug}`);
}

export async function completeDashboardOnboardingAction() {
  const context = await requireDashboardContext();
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
