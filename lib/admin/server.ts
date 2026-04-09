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

export type AdminBusinessSalesSnapshot = {
  paidOrders: number;
  revenueAmount: number;
  averageTicketAmount: number;
};

export type AdminOverview = {
  applications: {
    pending: number;
    approved: number;
    rejected: number;
  };
  businesses: {
    total: number;
    active: number;
    onboardingCompleted: number;
    connectedPayments: number;
  };
  salesLast30Days: AdminBusinessSalesSnapshot;
};

export type AdminBusinessListItem = {
  id: string;
  name: string;
  slug: string;
  contactEmail: string | null;
  contactPhone: string | null;
  pickupAddress: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  onboardingCompletedAt: string | null;
  paymentConnectionStatus: "disconnected" | "connected" | "error";
  paymentConnectionConnectedAt: string | null;
  memberCounts: {
    owners: number;
    admins: number;
    staff: number;
  };
  salesLast30Days: AdminBusinessSalesSnapshot;
  approvedApplicationId: string | null;
};

export type AdminBusinessDetail = AdminBusinessListItem & {
  currencyCode: string;
  timezone: string;
  pickupInstructions: string | null;
  businessHoursText: string | null;
  isTemporarilyClosed: boolean;
  paymentConnection: {
    provider: "mercado_pago";
    status: "disconnected" | "connected" | "error";
    mercadopagoUserId: number | null;
    liveMode: boolean;
    connectedAt: string | null;
    refreshedAt: string | null;
    revokedAt: string | null;
  };
  salesLast7Days: AdminBusinessSalesSnapshot;
  salesAllTime: AdminBusinessSalesSnapshot;
  recentPaidOrders: {
    id: string;
    orderNumber: number | null;
    customerName: string;
    totalAmount: number;
    paymentStatus: string;
    statusCode: string;
    placedAt: string;
  }[];
};

type AdminBusinessRow = {
  id: string;
  name: string;
  slug: string;
  contact_email: string | null;
  contact_phone: string | null;
  pickup_address: string;
  pickup_instructions: string | null;
  description: string | null;
  timezone: string;
  currency_code: string;
  is_active: boolean;
  business_hours_text: string | null;
  is_temporarily_closed: boolean;
  onboarding_completed_at: string | null;
  created_at: string;
};

type AdminBusinessUserRow = {
  business_id: string;
  role: "owner" | "admin" | "staff";
};

type AdminBusinessPaymentConnectionRow = {
  business_id: string;
  provider: "mercado_pago";
  status: "disconnected" | "connected" | "error";
  mercadopago_user_id: number | null;
  live_mode: boolean;
  connected_at: string | null;
  refreshed_at: string | null;
  revoked_at: string | null;
};

type AdminOrderRow = {
  id: string;
  business_id: string;
  order_number: number | null;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  status_code: string;
  placed_at: string;
};

type AdminApprovedApplicationRow = {
  id: string;
  approved_business_id: string | null;
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

function buildSalesSnapshot(orders: AdminOrderRow[]): AdminBusinessSalesSnapshot {
  const revenueAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);

  return {
    paidOrders: orders.length,
    revenueAmount,
    averageTicketAmount: orders.length > 0 ? Math.round(revenueAmount / orders.length) : 0,
  };
}

function getIsoDateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

async function getAdminBusinessBaseData() {
  const admin = createAdminClient();
  const [businessesResult, membersResult, paymentConnectionsResult, applicationsResult] =
    await Promise.all([
      admin
        .from("businesses")
        .select(
          "id, name, slug, contact_email, contact_phone, pickup_address, pickup_instructions, description, timezone, currency_code, is_active, business_hours_text, is_temporarily_closed, onboarding_completed_at, created_at"
        )
        .order("created_at", { ascending: false })
        .returns<AdminBusinessRow[]>(),
      admin
        .from("business_users")
        .select("business_id, role")
        .returns<AdminBusinessUserRow[]>(),
      admin
        .from("business_payment_connections")
        .select(
          "business_id, provider, status, mercadopago_user_id, live_mode, connected_at, refreshed_at, revoked_at"
        )
        .returns<AdminBusinessPaymentConnectionRow[]>(),
      admin
        .from("business_applications")
        .select("id, approved_business_id")
        .not("approved_business_id", "is", null)
        .returns<AdminApprovedApplicationRow[]>(),
    ]);

  if (businessesResult.error) {
    throw new Error(`No se pudieron cargar los negocios: ${businessesResult.error.message}`);
  }

  if (membersResult.error) {
    throw new Error(`No se pudieron cargar los usuarios de negocios: ${membersResult.error.message}`);
  }

  if (paymentConnectionsResult.error) {
    throw new Error(
      `No se pudieron cargar las conexiones de pago: ${paymentConnectionsResult.error.message}`
    );
  }

  if (applicationsResult.error) {
    throw new Error(
      `No se pudieron cargar las solicitudes aprobadas: ${applicationsResult.error.message}`
    );
  }

  return {
    businesses: businessesResult.data ?? [],
    members: membersResult.data ?? [],
    paymentConnections: paymentConnectionsResult.data ?? [],
    approvedApplications: applicationsResult.data ?? [],
  };
}

function mapAdminBusinessListItem(params: {
  business: AdminBusinessRow;
  members: AdminBusinessUserRow[];
  paymentConnection: AdminBusinessPaymentConnectionRow | null;
  ordersLast30Days: AdminOrderRow[];
  approvedApplicationId: string | null;
}): AdminBusinessListItem {
  const owners = params.members.filter((member) => member.role === "owner").length;
  const admins = params.members.filter((member) => member.role === "admin").length;
  const staff = params.members.filter((member) => member.role === "staff").length;

  return {
    id: params.business.id,
    name: params.business.name,
    slug: params.business.slug,
    contactEmail: params.business.contact_email,
    contactPhone: params.business.contact_phone,
    pickupAddress: params.business.pickup_address,
    description: params.business.description,
    isActive: params.business.is_active,
    createdAt: params.business.created_at,
    onboardingCompletedAt: params.business.onboarding_completed_at,
    paymentConnectionStatus: params.paymentConnection?.status ?? "disconnected",
    paymentConnectionConnectedAt: params.paymentConnection?.connected_at ?? null,
    memberCounts: {
      owners,
      admins,
      staff,
    },
    salesLast30Days: buildSalesSnapshot(params.ordersLast30Days),
    approvedApplicationId: params.approvedApplicationId,
  };
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const admin = createAdminClient();
  const thirtyDaysAgo = getIsoDateDaysAgo(30);
  const [applicationsResult, businessesData, paidOrdersResult] = await Promise.all([
    admin.from("business_applications").select("status").returns<{ status: BusinessApplicationStatus }[]>(),
    getAdminBusinessBaseData(),
    admin
      .from("orders")
      .select("id, total_amount")
      .in("payment_status", ["paid", "authorized"])
      .gte("placed_at", thirtyDaysAgo)
      .returns<{ id: string; total_amount: number }[]>(),
  ]);

  if (applicationsResult.error) {
    throw new Error(`No se pudo cargar el resumen de solicitudes: ${applicationsResult.error.message}`);
  }

  if (paidOrdersResult.error) {
    throw new Error(`No se pudo cargar el resumen de ventas: ${paidOrdersResult.error.message}`);
  }

  const applications = applicationsResult.data ?? [];
  const paidOrders = paidOrdersResult.data ?? [];
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total_amount, 0);

  return {
    applications: {
      pending: applications.filter((item) => item.status === "pending").length,
      approved: applications.filter((item) => item.status === "approved").length,
      rejected: applications.filter((item) => item.status === "rejected").length,
    },
    businesses: {
      total: businessesData.businesses.length,
      active: businessesData.businesses.filter((business) => business.is_active).length,
      onboardingCompleted: businessesData.businesses.filter(
        (business) => business.onboarding_completed_at !== null
      ).length,
      connectedPayments: businessesData.paymentConnections.filter(
        (connection) => connection.status === "connected"
      ).length,
    },
    salesLast30Days: {
      paidOrders: paidOrders.length,
      revenueAmount: totalRevenue,
      averageTicketAmount:
        paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0,
    },
  };
}

export async function getAdminBusinesses(): Promise<AdminBusinessListItem[]> {
  const admin = createAdminClient();
  const thirtyDaysAgo = getIsoDateDaysAgo(30);
  const [{ businesses, members, paymentConnections, approvedApplications }, ordersResult] =
    await Promise.all([
      getAdminBusinessBaseData(),
      admin
        .from("orders")
        .select(
          "id, business_id, order_number, customer_name, total_amount, payment_status, status_code, placed_at"
        )
        .in("payment_status", ["paid", "authorized"])
        .gte("placed_at", thirtyDaysAgo)
        .returns<AdminOrderRow[]>(),
    ]);

  if (ordersResult.error) {
    throw new Error(`No se pudieron cargar las ventas por negocio: ${ordersResult.error.message}`);
  }

  const paidOrders = ordersResult.data ?? [];

  return businesses.map((business) =>
    mapAdminBusinessListItem({
      business,
      members: members.filter((member) => member.business_id === business.id),
      paymentConnection:
        paymentConnections.find((connection) => connection.business_id === business.id) ?? null,
      ordersLast30Days: paidOrders.filter((order) => order.business_id === business.id),
      approvedApplicationId:
        approvedApplications.find((application) => application.approved_business_id === business.id)
          ?.id ?? null,
    })
  );
}

export async function getAdminBusinessById(
  businessId: string
): Promise<AdminBusinessDetail | null> {
  const admin = createAdminClient();
  const sevenDaysAgo = getIsoDateDaysAgo(7);
  const thirtyDaysAgo = getIsoDateDaysAgo(30);

  const [
    businessResult,
    membersResult,
    paymentConnectionResult,
    approvedApplicationResult,
    paidOrdersResult,
  ] = await Promise.all([
    admin
      .from("businesses")
      .select(
        "id, name, slug, contact_email, contact_phone, pickup_address, pickup_instructions, description, timezone, currency_code, is_active, business_hours_text, is_temporarily_closed, onboarding_completed_at, created_at"
      )
      .eq("id", businessId)
      .maybeSingle<AdminBusinessRow>(),
    admin
      .from("business_users")
      .select("business_id, role")
      .eq("business_id", businessId)
      .returns<AdminBusinessUserRow[]>(),
    admin
      .from("business_payment_connections")
      .select(
        "business_id, provider, status, mercadopago_user_id, live_mode, connected_at, refreshed_at, revoked_at"
      )
      .eq("business_id", businessId)
      .maybeSingle<AdminBusinessPaymentConnectionRow>(),
    admin
      .from("business_applications")
      .select("id, approved_business_id")
      .eq("approved_business_id", businessId)
      .maybeSingle<AdminApprovedApplicationRow>(),
    admin
      .from("orders")
      .select(
        "id, business_id, order_number, customer_name, total_amount, payment_status, status_code, placed_at"
      )
      .eq("business_id", businessId)
      .in("payment_status", ["paid", "authorized"])
      .order("placed_at", { ascending: false })
      .returns<AdminOrderRow[]>(),
  ]);

  if (businessResult.error) {
    throw new Error(`No se pudo cargar el negocio: ${businessResult.error.message}`);
  }

  if (!businessResult.data) {
    return null;
  }

  if (membersResult.error) {
    throw new Error(`No se pudo cargar el equipo del negocio: ${membersResult.error.message}`);
  }

  if (paymentConnectionResult.error) {
    throw new Error(
      `No se pudo cargar la conexión de pagos del negocio: ${paymentConnectionResult.error.message}`
    );
  }

  if (approvedApplicationResult.error) {
    throw new Error(
      `No se pudo cargar la solicitud vinculada: ${approvedApplicationResult.error.message}`
    );
  }

  if (paidOrdersResult.error) {
    throw new Error(`No se pudieron cargar las ventas del negocio: ${paidOrdersResult.error.message}`);
  }

  const business = businessResult.data;
  const members = membersResult.data ?? [];
  const paidOrders = paidOrdersResult.data ?? [];
  const base = mapAdminBusinessListItem({
    business,
    members,
    paymentConnection: paymentConnectionResult.data ?? null,
    ordersLast30Days: paidOrders.filter((order) => order.placed_at >= thirtyDaysAgo),
    approvedApplicationId: approvedApplicationResult.data?.id ?? null,
  });

  return {
    ...base,
    currencyCode: business.currency_code,
    timezone: business.timezone,
    pickupInstructions: business.pickup_instructions,
    businessHoursText: business.business_hours_text,
    isTemporarilyClosed: business.is_temporarily_closed,
    paymentConnection: {
      provider: paymentConnectionResult.data?.provider ?? "mercado_pago",
      status: paymentConnectionResult.data?.status ?? "disconnected",
      mercadopagoUserId: paymentConnectionResult.data?.mercadopago_user_id ?? null,
      liveMode: paymentConnectionResult.data?.live_mode ?? false,
      connectedAt: paymentConnectionResult.data?.connected_at ?? null,
      refreshedAt: paymentConnectionResult.data?.refreshed_at ?? null,
      revokedAt: paymentConnectionResult.data?.revoked_at ?? null,
    },
    salesLast7Days: buildSalesSnapshot(
      paidOrders.filter((order) => order.placed_at >= sevenDaysAgo)
    ),
    salesAllTime: buildSalesSnapshot(paidOrders),
    recentPaidOrders: paidOrders.slice(0, 10).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      totalAmount: order.total_amount,
      paymentStatus: order.payment_status,
      statusCode: order.status_code,
      placedAt: order.placed_at,
    })),
  };
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
