import "server-only";

import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type InternalAdminContext = {
  user: {
    id: string;
    email: string;
  };
};

export type BusinessApplicationStatus = "pending" | "approved" | "rejected";

export type AdminBusinessApplication = {
  id: string;
  status: BusinessApplicationStatus;
  businessName: string;
  contactName: string;
  email: string;
  phone: string | null;
  instagramOrWebsite: string | null;
  city: string | null;
  businessType: string | null;
  message: string | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
  reviewerUserId: string | null;
  approvedBusinessId: string | null;
  relatedUserId: string | null;
  processedAt: string | null;
  accessEmailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function getAllowedInternalAdminEmails() {
  return (process.env.INTERNAL_ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export async function getInternalAdminContext(): Promise<InternalAdminContext | null> {
  const allowedEmails = getAllowedInternalAdminEmails();

  if (allowedEmails.length === 0) {
    throw new Error(
      "Falta configurar INTERNAL_ADMIN_EMAILS para proteger el panel interno."
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const normalizedEmail = user?.email?.toLowerCase() ?? null;

  if (!user || !normalizedEmail || !allowedEmails.includes(normalizedEmail)) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? normalizedEmail,
    },
  };
}

export async function requireInternalAdminContext() {
  const context = await getInternalAdminContext();

  if (!context) {
    redirect("/login?redirectTo=/admin/solicitudes");
  }

  return context;
}

function mapBusinessApplication(
  row: {
    id: string;
    status: BusinessApplicationStatus;
    business_name: string;
    contact_name: string;
    email: string;
    phone: string | null;
    instagram_or_website: string | null;
    city: string | null;
    business_type: string | null;
    message: string | null;
    review_notes: string | null;
    reviewed_at: string | null;
    reviewer_user_id: string | null;
    approved_business_id: string | null;
    related_user_id: string | null;
    processed_at: string | null;
    access_email_sent_at: string | null;
    created_at: string;
    updated_at: string;
  },
): AdminBusinessApplication {
  return {
    id: row.id,
    status: row.status,
    businessName: row.business_name,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    instagramOrWebsite: row.instagram_or_website,
    city: row.city,
    businessType: row.business_type,
    message: row.message,
    reviewNotes: row.review_notes,
    reviewedAt: row.reviewed_at,
    reviewerUserId: row.reviewer_user_id,
    approvedBusinessId: row.approved_business_id,
    relatedUserId: row.related_user_id,
    processedAt: row.processed_at,
    accessEmailSentAt: row.access_email_sent_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getBusinessApplications(status?: BusinessApplicationStatus) {
  const admin = createAdminClient();
  let query = admin
    .from("business_applications")
    .select(
      "id, status, business_name, contact_name, email, phone, instagram_or_website, city, business_type, message, review_notes, reviewed_at, reviewer_user_id, approved_business_id, related_user_id, processed_at, access_email_sent_at, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (status && status !== "pending") {
    query = query.eq("status", status);
  }

  if (status === "pending") {
    query = query.eq("status", "pending");
  }

  const { data, error } = await query.returns<
    {
      id: string;
      status: BusinessApplicationStatus;
      business_name: string;
      contact_name: string;
      email: string;
      phone: string | null;
      instagram_or_website: string | null;
      city: string | null;
      business_type: string | null;
      message: string | null;
      review_notes: string | null;
      reviewed_at: string | null;
      reviewer_user_id: string | null;
      approved_business_id: string | null;
      related_user_id: string | null;
      processed_at: string | null;
      access_email_sent_at: string | null;
      created_at: string;
      updated_at: string;
    }[]
  >();

  if (error) {
    throw new Error(`No se pudieron cargar las solicitudes: ${error.message}`);
  }

  return (data ?? []).map(mapBusinessApplication);
}

export async function getBusinessApplicationById(applicationId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_applications")
    .select(
      "id, status, business_name, contact_name, email, phone, instagram_or_website, city, business_type, message, review_notes, reviewed_at, reviewer_user_id, approved_business_id, related_user_id, processed_at, access_email_sent_at, created_at, updated_at"
    )
    .eq("id", applicationId)
    .maybeSingle<{
      id: string;
      status: BusinessApplicationStatus;
      business_name: string;
      contact_name: string;
      email: string;
      phone: string | null;
      instagram_or_website: string | null;
      city: string | null;
      business_type: string | null;
      message: string | null;
      review_notes: string | null;
      reviewed_at: string | null;
      reviewer_user_id: string | null;
      approved_business_id: string | null;
      related_user_id: string | null;
      processed_at: string | null;
      access_email_sent_at: string | null;
      created_at: string;
      updated_at: string;
    }>();

  if (error) {
    throw new Error(`No se pudo cargar la solicitud: ${error.message}`);
  }

  return data ? mapBusinessApplication(data) : null;
}
