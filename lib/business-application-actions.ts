"use server";

import { redirect, unstable_rethrow } from "next/navigation";

import { parseBusinessApplicationForm } from "@/lib/business-applications";
import { createAdminClient } from "@/lib/supabase/admin";

function buildApplicationRedirect(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/solicitar-acceso${query ? `?${query}` : ""}`;
}

export async function submitBusinessApplicationAction(formData: FormData) {
  try {
    const payload = parseBusinessApplicationForm(formData);
    const admin = createAdminClient();

    const { error } = await admin.from("business_applications").insert({
      business_name: payload.businessName,
      contact_name: payload.contactName,
      email: payload.email,
      phone: payload.phone,
      instagram_or_website: payload.instagramOrWebsite,
      city: payload.city,
      pickup_address: payload.pickupAddress,
      business_type: payload.businessType,
      current_sales_channels: payload.currentSalesChannels,
      estimated_order_volume: payload.estimatedOrderVolume,
      message: payload.message,
      status: "pending",
    });

    if (error) {
      console.error("[business-application] insert failed", {
        email: payload.email,
        businessName: payload.businessName,
        error: error.message,
      });
      throw new Error("No pudimos enviar la solicitud. Probá de nuevo en unos segundos.");
    }

    redirect(
      buildApplicationRedirect({
        success: "submitted",
      }),
    );
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error
        ? error.message
        : "No pudimos enviar la solicitud. Probá de nuevo en unos segundos.";

    redirect(
      buildApplicationRedirect({
        error: message,
      }),
    );
  }
}
