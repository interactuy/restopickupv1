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
      business_type: payload.businessType,
      message: payload.message,
      status: "pending",
    });

    if (error) {
      throw new Error(`No pudimos guardar la solicitud: ${error.message}`);
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
        : "No pudimos enviar la solicitud.";

    redirect(
      buildApplicationRedirect({
        error: message,
      }),
    );
  }
}
