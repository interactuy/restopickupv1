import "server-only";

import { createHash } from "crypto";

import type { User } from "@supabase/supabase-js";

import type { AdminBusinessApplication } from "@/lib/admin/server";
import { createAdminClient } from "@/lib/supabase/admin";

type ProvisioningResult = {
  business: {
    id: string;
    slug: string;
    name: string;
  };
  user: User;
  recoveryLink: string;
};

function slugifyBusiness(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getAppUrl() {
  const appUrl = process.env.APP_URL;

  if (!appUrl) {
    throw new Error("Falta APP_URL para generar links de acceso.");
  }

  return appUrl.replace(/\/+$/, "");
}

async function findAuthUserByEmail(email: string) {
  const admin = createAdminClient();
  let page = 1;

  while (page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw new Error(`No se pudo consultar Auth: ${error.message}`);
    }

    const matchedUser =
      data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ??
      null;

    if (matchedUser) {
      return matchedUser;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

async function ensureUniqueBusinessSlug(baseSlug: string) {
  const admin = createAdminClient();

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await admin
      .from("businesses")
      .select("id")
      .ilike("slug", candidate)
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new Error(`No se pudo validar el slug del negocio: ${error.message}`);
    }

    if (!data) {
      return candidate;
    }
  }

  const fallbackHash = createHash("sha1")
    .update(`${baseSlug}-${Date.now()}`)
    .digest("hex")
    .slice(0, 6);

  return `${baseSlug}-${fallbackHash}`;
}

async function ensureBusiness(application: AdminBusinessApplication) {
  const admin = createAdminClient();

  if (application.approvedBusinessId) {
    const { data, error } = await admin
      .from("businesses")
      .select("id, slug, name")
      .eq("id", application.approvedBusinessId)
      .maybeSingle<{ id: string; slug: string; name: string }>();

    if (error) {
      throw new Error(`No se pudo recuperar el negocio vinculado: ${error.message}`);
    }

    if (data) {
      return data;
    }
  }

  let existingBusiness: { id: string; slug: string; name: string } | null = null;

  if (application.email) {
    const { data, error } = await admin
      .from("businesses")
      .select("id, slug, name")
      .eq("contact_email", application.email)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<{ id: string; slug: string; name: string }>();

    if (error) {
      throw new Error(`No se pudo buscar negocio por email: ${error.message}`);
    }

    existingBusiness = data ?? null;
  }

  if (!existingBusiness) {
    const { data, error } = await admin
      .from("businesses")
      .select("id, slug, name")
      .ilike("name", application.businessName)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle<{ id: string; slug: string; name: string }>();

    if (error) {
      throw new Error(`No se pudo buscar negocio por nombre: ${error.message}`);
    }

    existingBusiness = data ?? null;
  }

  if (existingBusiness) {
    return existingBusiness;
  }

  const baseSlug = slugifyBusiness(application.businessName);

  if (!baseSlug) {
    throw new Error("No se pudo generar un slug válido para el negocio.");
  }

  const slug = await ensureUniqueBusinessSlug(baseSlug);
  const pickupAddress = application.city
    ? `Pendiente de configurar en dashboard (${application.city})`
    : "Pendiente de configurar en dashboard";

  const { data, error } = await admin
    .from("businesses")
    .insert({
      name: application.businessName,
      slug,
      contact_email: application.email,
      contact_phone: application.phone,
      pickup_address: pickupAddress,
      pickup_instructions: "Completar instrucciones de retiro en el onboarding inicial.",
      timezone: "America/Montevideo",
      currency_code: "UYU",
      is_active: true,
    })
    .select("id, slug, name")
    .single<{ id: string; slug: string; name: string }>();

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo crear el negocio.");
  }

  const { error: counterError } = await admin
    .from("business_order_counters")
    .upsert(
      {
        business_id: data.id,
        last_order_number: 0,
      },
      {
        onConflict: "business_id",
        ignoreDuplicates: false,
      },
    );

  if (counterError) {
    throw new Error(
      `No se pudo inicializar la numeración del negocio: ${counterError.message}`,
    );
  }

  return data;
}

async function ensureAuthUser(application: AdminBusinessApplication) {
  const admin = createAdminClient();
  const existingUser = await findAuthUserByEmail(application.email);

  if (existingUser) {
    return existingUser;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: application.email,
    email_confirm: true,
    user_metadata: {
      contact_name: application.contactName,
      business_name: application.businessName,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "No se pudo crear el usuario en Auth.");
  }

  return data.user;
}

async function ensureBusinessMembership(params: {
  businessId: string;
  userId: string;
}) {
  const admin = createAdminClient();
  const { error } = await admin.from("business_users").upsert(
    {
      business_id: params.businessId,
      user_id: params.userId,
      role: "owner",
    },
    {
      onConflict: "business_id,user_id",
      ignoreDuplicates: false,
    },
  );

  if (error) {
    throw new Error(`No se pudo vincular el usuario al negocio: ${error.message}`);
  }
}

async function generatePasswordSetupLink(email: string) {
  const admin = createAdminClient();
  const appUrl = getAppUrl();
  const redirectTo = `${appUrl}/auth/set-password`;

  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo,
    },
  });

  if (
    error ||
    !data.properties?.hashed_token ||
    !data.properties?.verification_type
  ) {
    throw new Error(
      error?.message ?? "No se pudo generar el link de configuración de acceso.",
    );
  }

  const setupUrl = new URL("/auth/set-password", appUrl);
  setupUrl.searchParams.set("token_hash", data.properties.hashed_token);
  setupUrl.searchParams.set("type", data.properties.verification_type);

  return setupUrl.toString();
}

async function sendApprovalEmail(params: {
  email: string;
  contactName: string;
  businessName: string;
  businessSlug: string;
  setupLink: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFromEmail = process.env.RESEND_FROM_EMAIL;
  const appUrl = getAppUrl();

  if (!resendApiKey || !resendFromEmail) {
    throw new Error(
      "Faltan RESEND_API_KEY o RESEND_FROM_EMAIL para enviar el email de aprobación.",
    );
  }

  const loginUrl = `${appUrl}/login`;
  const storefrontUrl = `${appUrl}/locales/${params.businessSlug}`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [params.email],
      subject: `Tu local fue aprobado en Restopickup`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #24160d; line-height: 1.6;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Tu solicitud fue aprobada</h1>
          <p>Hola ${params.contactName || params.businessName},</p>
          <p>Ya habilitamos <strong>${params.businessName}</strong> dentro de Restopickup.</p>
          <p>Para definir tu contraseña y entrar por primera vez, usá este botón:</p>
          <p style="margin: 24px 0;">
            <a href="${params.setupLink}" style="background:#c46d29;color:#ffffff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;">
              Definir contraseña
            </a>
          </p>
          <p>Después vas a poder ingresar desde <a href="${loginUrl}">${loginUrl}</a>.</p>
          <p>Tu tienda pública quedará disponible en: <a href="${storefrontUrl}">${storefrontUrl}</a></p>
          <p>Al entrar por primera vez, vas a ver un onboarding para completar datos del local y cargar tu catálogo.</p>
          <p style="margin-top: 24px;">Equipo Restopickup</p>
        </div>
      `,
      text: `Hola ${params.contactName || params.businessName},\n\nTu solicitud para ${params.businessName} fue aprobada.\n\nDefiní tu contraseña y entrá por primera vez desde este link:\n${params.setupLink}\n\nDespués vas a poder iniciar sesión en:\n${loginUrl}\n\nTu tienda pública quedará disponible en:\n${storefrontUrl}\n\nEquipo Restopickup`,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `No se pudo enviar el email de aprobación: ${response.status} ${errorBody}`,
    );
  }
}

export async function approveBusinessApplicationProvisioning(
  application: AdminBusinessApplication,
): Promise<ProvisioningResult> {
  const business = await ensureBusiness(application);
  const user = await ensureAuthUser(application);
  await ensureBusinessMembership({
    businessId: business.id,
    userId: user.id,
  });
  const recoveryLink = await generatePasswordSetupLink(application.email);

  await sendApprovalEmail({
    email: application.email,
    contactName: application.contactName,
    businessName: business.name,
    businessSlug: business.slug,
    setupLink: recoveryLink,
  });

  return {
    business,
    user,
    recoveryLink,
  };
}
