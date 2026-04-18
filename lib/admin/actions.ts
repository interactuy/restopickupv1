"use server";

import { revalidatePath } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";

import {
  getBusinessApplicationById,
  requireInternalAdminContext,
  type BusinessApplicationStatus,
} from "@/lib/admin/server";
import { approveBusinessApplicationProvisioning } from "@/lib/admin/provisioning";
import { createAdminClient } from "@/lib/supabase/admin";

function buildApplicationDetailRedirect(
  applicationId: string,
  params: Record<string, string>,
) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/admin/solicitudes/${applicationId}${query ? `?${query}` : ""}`;
}

export async function updateBusinessApplicationAction(formData: FormData) {
  const context = await requireInternalAdminContext();
  const applicationId = String(formData.get("applicationId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as BusinessApplicationStatus;
  const reviewNotes = String(formData.get("reviewNotes") ?? "").trim();

  const allowedStatuses = new Set<BusinessApplicationStatus>([
    "pending",
    "approved",
    "rejected",
  ]);

  if (!applicationId || !allowedStatuses.has(status)) {
    throw new Error("Solicitud o estado inválido.");
  }

  try {
    const existingApplication = await getBusinessApplicationById(applicationId);

    if (!existingApplication) {
      throw new Error("La solicitud no existe.");
    }

    const admin = createAdminClient();
    const reviewedAt = new Date().toISOString();
    let updates: Record<string, string | null> = {
      status,
      review_notes: reviewNotes || null,
      reviewed_at: reviewedAt,
      reviewer_user_id: context.user.id,
    };

    if (status === "approved") {
      if (
        existingApplication.status === "approved" &&
        existingApplication.approvedBusinessId &&
        existingApplication.relatedUserId &&
        existingApplication.processedAt
      ) {
        updates = {
          ...updates,
          approved_business_id: existingApplication.approvedBusinessId,
          related_user_id: existingApplication.relatedUserId,
          processed_at: existingApplication.processedAt,
          access_email_sent_at: existingApplication.accessEmailSentAt,
        };
      } else {
        const provisioning = await approveBusinessApplicationProvisioning(
          existingApplication,
        );

        updates = {
          ...updates,
          approved_business_id: provisioning.business.id,
          related_user_id: provisioning.user.id,
          processed_at: reviewedAt,
          access_email_sent_at: reviewedAt,
        };
      }
    }

    if (status !== "approved") {
      updates = {
        ...updates,
        processed_at: null,
        access_email_sent_at: null,
      };
    }

    const { error } = await admin
      .from("business_applications")
      .update(updates)
      .eq("id", applicationId);

    if (error) {
      throw new Error(`No se pudo actualizar la solicitud: ${error.message}`);
    }

    revalidatePath("/admin/solicitudes");
    revalidatePath(`/admin/solicitudes/${applicationId}`);

    redirect(
      buildApplicationDetailRedirect(applicationId, {
        success: "updated",
      }),
    );
  } catch (error) {
    unstable_rethrow(error);

    const message =
      error instanceof Error
        ? error.message
        : "No se pudo actualizar la solicitud.";

    redirect(
      buildApplicationDetailRedirect(applicationId, {
        error: message,
      }),
    );
  }
}

function buildBusinessDetailRedirect(
  businessId: string,
  params: Record<string, string>,
) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/admin/negocios/${businessId}${query ? `?${query}` : ""}`;
}

function buildSupportRedirect(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/admin/soporte${query ? `?${query}` : ""}`;
}

export async function updateSupportIncidentStatusAction(formData: FormData) {
  const context = await requireInternalAdminContext("/admin/soporte");
  const incidentId = String(formData.get("incidentId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  const allowedStatuses = new Set(["open", "in_progress", "resolved"]);

  if (!incidentId || !allowedStatuses.has(status)) {
    redirect(
      buildSupportRedirect({
        error: "invalid-support-status",
      })
    );
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("business_support_incidents")
    .update({
      status,
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    })
    .eq("id", incidentId);

  if (error) {
    redirect(
      buildSupportRedirect({
        error: "support-save",
      })
    );
  }

  await admin.from("admin_audit_logs").insert({
    actor_user_id: context.user.id,
    action: "support_incident.status_updated",
    entity_type: "support_incident",
    entity_id: incidentId,
    metadata: {
      status,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/soporte");

  redirect(
    buildSupportRedirect({
      success: "support-updated",
    })
  );
}

export async function updateBusinessPlatformSettingsAction(formData: FormData) {
  const context = await requireInternalAdminContext();
  const businessId = String(formData.get("businessId") ?? "").trim();
  const commissionPercentRaw = String(formData.get("commissionPercent") ?? "").trim();
  const platformStatus = String(formData.get("platformStatus") ?? "").trim();
  const fiscalName = String(formData.get("fiscalName") ?? "").trim();
  const fiscalTaxId = String(formData.get("fiscalTaxId") ?? "").trim();
  const fiscalAddress = String(formData.get("fiscalAddress") ?? "").trim();
  const commercialOwner = String(formData.get("commercialOwner") ?? "").trim();
  const acquisitionSource = String(formData.get("acquisitionSource") ?? "").trim();
  const billingNotes = String(formData.get("billingNotes") ?? "").trim();

  if (!businessId) {
    throw new Error("Negocio inválido.");
  }

  const normalizedPercent = commissionPercentRaw.replace(",", ".");
  const commissionPercent = Number.parseFloat(normalizedPercent);

  if (
    !Number.isFinite(commissionPercent) ||
    commissionPercent < 0 ||
    commissionPercent > 100
  ) {
    redirect(
      buildBusinessDetailRedirect(businessId, {
        error: "La comisión debe ser un porcentaje entre 0 y 100.",
      })
    );
  }

  const commissionBps = Math.round(commissionPercent * 100);
  const allowedStatuses = new Set(["active", "paused", "blocked"]);

  if (!allowedStatuses.has(platformStatus)) {
    redirect(
      buildBusinessDetailRedirect(businessId, {
        error: "Estado de plataforma inválido.",
      })
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.from("business_platform_settings").upsert({
    business_id: businessId,
    commission_bps: commissionBps,
    platform_status: platformStatus,
    fiscal_name: fiscalName || null,
    fiscal_tax_id: fiscalTaxId || null,
    fiscal_address: fiscalAddress || null,
    commercial_owner: commercialOwner || null,
    acquisition_source: acquisitionSource || null,
    billing_notes: billingNotes || null,
  });

  if (error) {
    redirect(
      buildBusinessDetailRedirect(businessId, {
        error: `No se pudo guardar la comisión: ${error.message}`,
      })
    );
  }

  await admin.from("admin_audit_logs").insert({
    actor_user_id: context.user.id,
    action: "business_platform_settings.updated",
    entity_type: "business",
    entity_id: businessId,
    metadata: {
      commission_bps: commissionBps,
      platform_status: platformStatus,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/negocios");
  revalidatePath("/admin/comisiones");
  revalidatePath(`/admin/negocios/${businessId}`);

  redirect(
    buildBusinessDetailRedirect(businessId, {
      success: "commission-updated",
    })
  );
}

export async function updatePlatformSettingsAction(formData: FormData) {
  const context = await requireInternalAdminContext();
  const defaultCommissionRaw = String(formData.get("defaultCommissionPercent") ?? "").trim();
  const defaultCommission = Number.parseFloat(defaultCommissionRaw.replace(",", "."));

  if (
    !Number.isFinite(defaultCommission) ||
    defaultCommission < 0 ||
    defaultCommission > 100
  ) {
    redirect("/admin/plataforma?error=La comisión global debe estar entre 0 y 100.");
  }

  const defaultCommissionBps = Math.round(defaultCommission * 100);
  const admin = createAdminClient();
  const { error } = await admin.from("platform_settings").upsert({
    key: "commercial_defaults",
    value: {
      default_commission_bps: defaultCommissionBps,
    },
    updated_by_user_id: context.user.id,
  });

  if (error) {
    redirect(`/admin/plataforma?error=${encodeURIComponent(error.message)}`);
  }

  await admin.from("admin_audit_logs").insert({
    actor_user_id: context.user.id,
    action: "platform_settings.updated",
    entity_type: "platform_settings",
    entity_id: "commercial_defaults",
    metadata: {
      default_commission_bps: defaultCommissionBps,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/comisiones");
  revalidatePath("/admin/plataforma");
  redirect("/admin/plataforma?success=updated");
}
