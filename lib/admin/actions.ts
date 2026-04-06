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
