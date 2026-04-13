"use server";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";

function buildContactRedirect(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/contacto${query ? `?${query}` : ""}`;
}

export async function createSupportTicketAction(formData: FormData) {
  const source = String(formData.get("source") ?? "support").trim();
  const requesterName = String(formData.get("requesterName") ?? "").trim();
  const requesterEmail = String(formData.get("requesterEmail") ?? "").trim();
  const requesterPhone = String(formData.get("requesterPhone") ?? "").trim();
  const requesterBusinessName = String(formData.get("requesterBusinessName") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!requesterName || !requesterEmail || !subject || !message) {
    redirect(
      buildContactRedirect({
        error: "required",
        source: source === "commercial" ? "commercial" : "support",
      })
    );
  }

  if (source !== "commercial" && source !== "support") {
    redirect(buildContactRedirect({ error: "source" }));
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_support_incidents")
    .insert({
      business_id: null,
      title: subject,
      source,
      status: "open",
      severity: source === "commercial" ? "low" : "normal",
      notes: message,
      requester_name: requesterName,
      requester_email: requesterEmail,
      requester_phone: requesterPhone || null,
      requester_business_name: requesterBusinessName || null,
    })
    .select("ticket_number")
    .single<{ ticket_number: number | null }>();

  if (error) {
    redirect(
      buildContactRedirect({
        error: "save",
        source,
      })
    );
  }

  redirect(
    buildContactRedirect({
      success: "ticket-created",
      source,
      ticket: String(data?.ticket_number ?? ""),
    })
  );
}
