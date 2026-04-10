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
  pickupAddress: string | null;
  businessType: string | null;
  currentSalesChannels: string | null;
  estimatedOrderVolume: string | null;
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

export type AdminDayHourHeatmap = {
  totalOrders: number;
  rows: {
    dayLabel: string;
    fullDayLabel: string;
    hours: {
      hourLabel: string;
      count: number;
    }[];
  }[];
};

export type AdminSalesSeriesPoint = {
  label: string;
  revenueAmount: number;
  paidOrders: number;
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
  salesLast7Days: AdminBusinessSalesSnapshot;
  salesLast30Days: AdminBusinessSalesSnapshot;
  salesAllTime: AdminBusinessSalesSnapshot;
  dayHourHeatmapLast30Days: AdminDayHourHeatmap;
  salesSeriesLast30Days: AdminSalesSeriesPoint[];
  commissionsCurrentMonth: {
    estimatedAmount: number;
    configuredBusinesses: number;
  };
  support: {
    openIncidents: number;
    highSeverityOpenIncidents: number;
  };
};

export type AdminPlatformHealthStats = {
  business: {
    gmvTotalAmount: number;
    netCommissionAmount: number;
    realTakeRate: number;
    currentMonthGmvAmount: number;
    previousMonthGmvAmount: number;
    monthlyGmvGrowthRate: number | null;
    currentMonthCommissionAmount: number;
    previousMonthCommissionAmount: number;
    monthlyCommissionGrowthRate: number | null;
  };
  demand: {
    totalOrders: number;
    paidOrders: number;
    ordersPerActiveBusiness: number;
    averageTicketAmount: number;
    purchaseFrequencyPerCustomer: number | null;
  };
  marketplace: {
    registeredBusinesses: number;
    activeBusinesses: number;
    activeCustomersLast30Days: number;
    ordersPerBusinessLast30Days: number;
    topBusinessRevenueShare: number;
    topTwoBusinessesRevenueShare: number;
  };
  conversion: {
    hasTracking: boolean;
    menuViews: number;
    cartAdds: number;
    checkoutStarts: number;
    ordersCreated: number;
    paymentSuccesses: number;
    menuToCartRate: number | null;
    cartToCheckoutRate: number | null;
    checkoutToOrderRate: number | null;
    orderToPaymentRate: number | null;
    totalPurchaseRate: number | null;
  };
  operation: {
    averageReadyMinutes: number | null;
    canceledOrders: number;
    paymentErrorOrders: number;
    notPickedUpOrders: number;
    averageIncidentResolutionHours: number | null;
  };
  retention: {
    repeatCustomerRate: number | null;
    localChurnRate: number;
    businessesWithoutSalesLast30Days: number;
    customersBuyingAgainWithin30DaysRate: number | null;
  };
  onboarding: {
    applicationsTotal: number;
    applicationsApproved: number;
    applicationApprovalRate: number | null;
    approvedToOnboardingCompletedRate: number | null;
    onboardingCompletedToFirstOrderRate: number | null;
    averageDaysFromApplicationToFirstOrder: number | null;
  };
  dayHourHeatmapLast30Days: AdminDayHourHeatmap;
  salesSeriesLast30Days: AdminSalesSeriesPoint[];
  monthlySalesSeriesLast12Months: AdminSalesSeriesPoint[];
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
  platformStatus: "active" | "paused" | "blocked";
  fiscalName: string | null;
  fiscalTaxId: string | null;
  fiscalAddress: string | null;
  commercialOwner: string | null;
  acquisitionSource: string | null;
  commissionBps: number;
  billingNotes: string | null;
  estimatedCommissionCurrentMonthAmount: number;
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
  dayHourHeatmapLast30Days: AdminDayHourHeatmap;
  salesSeriesLast30Days: AdminSalesSeriesPoint[];
  commissionsCurrentMonthAmount: number;
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
  customer_phone?: string | null;
  total_amount: number;
  payment_status: string;
  payment_provider?: string | null;
  status_code: string;
  placed_at: string;
  ready_for_pickup_at?: string | null;
  picked_up_at?: string | null;
  canceled_at?: string | null;
};

type AdminApprovedApplicationRow = {
  id: string;
  approved_business_id: string | null;
};

type AdminBusinessPlatformSettingsRow = {
  business_id: string;
  commission_bps: number;
  billing_notes: string | null;
  platform_status: "active" | "paused" | "blocked";
  fiscal_name: string | null;
  fiscal_tax_id: string | null;
  fiscal_address: string | null;
  commercial_owner: string | null;
  acquisition_source: string | null;
};

type AdminSupportIncidentRow = {
  id: string;
  business_id: string;
  title: string;
  status: "open" | "in_progress" | "resolved";
  severity: "low" | "normal" | "high";
  notes: string | null;
  created_at: string;
  business?: {
    name: string;
    slug: string;
  } | null;
};

type AdminAuditLogRow = {
  id: string;
  actor_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

type AdminPlatformSettingRow = {
  key: string;
  value: Record<string, unknown>;
};

type AdminHealthApplicationRow = {
  id: string;
  status: BusinessApplicationStatus;
  approved_business_id: string | null;
  created_at: string;
  processed_at: string | null;
};

type AdminHealthSupportIncidentRow = {
  id: string;
  status: "open" | "in_progress" | "resolved";
  created_at: string;
  resolved_at: string | null;
};

type AdminFunnelEventRow = {
  event_type: "menu_view" | "cart_add" | "checkout_started" | "order_created" | "payment_success";
  session_id: string | null;
  order_id: string | null;
  created_at: string;
};

export type AdminGlobalOrder = {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  orderNumber: number | null;
  customerName: string;
  customerPhone: string | null;
  totalAmount: number;
  paymentStatus: string;
  paymentProvider: string | null;
  statusCode: string;
  placedAt: string;
  isProblematic: boolean;
};

export type AdminSupportIncident = {
  id: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  title: string;
  status: "open" | "in_progress" | "resolved";
  severity: "low" | "normal" | "high";
  notes: string | null;
  createdAt: string;
};

export type AdminAuditLog = {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AdminPlatformSettings = {
  defaultCommissionBps: number;
  featureFlags: Record<string, unknown>;
  globalTexts: Record<string, unknown>;
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

function getCurrentMonthStartIso() {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function getMonthStartOffset(offset: number) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + offset);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) {
    return null;
  }

  return Number(((numerator / denominator) * 100).toFixed(1));
}

function getRatio(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Number((numerator / denominator).toFixed(1));
}

function getGrowthRate(current: number, previous: number): number | null {
  if (previous <= 0) {
    return current > 0 ? 100 : null;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function getAverage(numbers: number[]): number | null {
  if (numbers.length === 0) {
    return null;
  }

  return Math.round(numbers.reduce((sum, item) => sum + item, 0) / numbers.length);
}

function normalizeCustomerKey(phone?: string | null) {
  const normalizedPhone = phone?.replace(/\D/g, "");
  return normalizedPhone && normalizedPhone.length >= 6 ? normalizedPhone : null;
}

function getStableEventKey(event: AdminFunnelEventRow) {
  return event.session_id ?? event.order_id ?? event.created_at;
}

const heatmapDays = [
  { index: 1, dayLabel: "Lu", fullDayLabel: "Lunes" },
  { index: 2, dayLabel: "Ma", fullDayLabel: "Martes" },
  { index: 3, dayLabel: "Mi", fullDayLabel: "Miércoles" },
  { index: 4, dayLabel: "Ju", fullDayLabel: "Jueves" },
  { index: 5, dayLabel: "Vi", fullDayLabel: "Viernes" },
  { index: 6, dayLabel: "Sa", fullDayLabel: "Sábado" },
  { index: 0, dayLabel: "Do", fullDayLabel: "Domingo" },
];

function buildDayHourHeatmap(orders: AdminOrderRow[]): AdminDayHourHeatmap {
  const matrix = new Map<string, number>();

  for (const order of orders) {
    const date = new Date(order.placed_at);
    const key = `${date.getDay()}-${date.getHours()}`;
    matrix.set(key, (matrix.get(key) ?? 0) + 1);
  }

  return {
    totalOrders: orders.length,
    rows: heatmapDays.map((day) => ({
      dayLabel: day.dayLabel,
      fullDayLabel: day.fullDayLabel,
      hours: Array.from({ length: 24 }, (_, hour) => ({
        hourLabel: `${String(hour).padStart(2, "0")}:00`,
        count: matrix.get(`${day.index}-${hour}`) ?? 0,
      })),
    })),
  };
}

function buildSalesSeries(orders: AdminOrderRow[], days: number): AdminSalesSeriesPoint[] {
  const today = new Date();

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - index - 1));
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    const dayOrders = orders.filter((order) => {
      const placedAt = new Date(order.placed_at);
      return placedAt >= date && placedAt < nextDate;
    });

    return {
      label: date.toLocaleDateString("es-UY", {
        day: "2-digit",
        month: "2-digit",
      }),
      revenueAmount: dayOrders.reduce((sum, order) => sum + order.total_amount, 0),
      paidOrders: dayOrders.length,
    };
  });
}

function buildMonthlySalesSeries(orders: AdminOrderRow[], months: number): AdminSalesSeriesPoint[] {
  const currentMonth = getMonthStartOffset(0);

  return Array.from({ length: months }, (_, index) => {
    const monthStart = new Date(currentMonth);
    monthStart.setMonth(currentMonth.getMonth() - (months - index - 1));

    const nextMonthStart = new Date(monthStart);
    nextMonthStart.setMonth(monthStart.getMonth() + 1);

    const monthOrders = orders.filter((order) => {
      const placedAt = new Date(order.placed_at);
      return placedAt >= monthStart && placedAt < nextMonthStart;
    });

    return {
      label: monthStart.toLocaleDateString("es-UY", {
        month: "short",
        year: "2-digit",
      }),
      revenueAmount: monthOrders.reduce((sum, order) => sum + order.total_amount, 0),
      paidOrders: monthOrders.length,
    };
  });
}

async function getAdminBusinessBaseData() {
  const admin = createAdminClient();
  const [
    businessesResult,
    membersResult,
    paymentConnectionsResult,
    applicationsResult,
    settingsResult,
  ] =
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
      admin
        .from("business_platform_settings")
        .select(
          "business_id, commission_bps, billing_notes, platform_status, fiscal_name, fiscal_tax_id, fiscal_address, commercial_owner, acquisition_source"
        )
        .returns<AdminBusinessPlatformSettingsRow[]>(),
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

  if (settingsResult.error) {
    throw new Error(
      `No se pudo cargar la configuración de comisiones: ${settingsResult.error.message}`
    );
  }

  return {
    businesses: businessesResult.data ?? [],
    members: membersResult.data ?? [],
    paymentConnections: paymentConnectionsResult.data ?? [],
    approvedApplications: applicationsResult.data ?? [],
    platformSettings: settingsResult.data ?? [],
  };
}

function mapAdminBusinessListItem(params: {
  business: AdminBusinessRow;
  members: AdminBusinessUserRow[];
  paymentConnection: AdminBusinessPaymentConnectionRow | null;
  ordersLast30Days: AdminOrderRow[];
  ordersCurrentMonth: AdminOrderRow[];
  platformSettings: AdminBusinessPlatformSettingsRow | null;
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
    platformStatus: params.platformSettings?.platform_status ?? "active",
    fiscalName: params.platformSettings?.fiscal_name ?? null,
    fiscalTaxId: params.platformSettings?.fiscal_tax_id ?? null,
    fiscalAddress: params.platformSettings?.fiscal_address ?? null,
    commercialOwner: params.platformSettings?.commercial_owner ?? null,
    acquisitionSource: params.platformSettings?.acquisition_source ?? null,
    commissionBps: params.platformSettings?.commission_bps ?? 0,
    billingNotes: params.platformSettings?.billing_notes ?? null,
    estimatedCommissionCurrentMonthAmount: Math.round(
      buildSalesSnapshot(params.ordersCurrentMonth).revenueAmount *
        ((params.platformSettings?.commission_bps ?? 0) / 10000)
    ),
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
  const sevenDaysAgo = getIsoDateDaysAgo(7);
  const thirtyDaysAgo = getIsoDateDaysAgo(30);
  const monthStartIso = getCurrentMonthStartIso();
  const [
    applicationsResult,
    businessesData,
    lifetimeOrdersResult,
    currentMonthOrdersResult,
    supportResult,
  ] =
    await Promise.all([
    admin
      .from("business_applications")
      .select("status")
      .returns<{ status: BusinessApplicationStatus }[]>(),
    getAdminBusinessBaseData(),
    admin
      .from("orders")
      .select(
        "id, business_id, order_number, customer_name, total_amount, payment_status, status_code, placed_at"
      )
      .in("payment_status", ["paid", "authorized"])
      .returns<AdminOrderRow[]>(),
    admin
      .from("orders")
      .select(
        "id, business_id, order_number, customer_name, total_amount, payment_status, status_code, placed_at"
      )
      .in("payment_status", ["paid", "authorized"])
      .gte("placed_at", monthStartIso)
      .returns<AdminOrderRow[]>(),
    admin
      .from("business_support_incidents")
      .select("id, severity")
      .in("status", ["open", "in_progress"])
      .returns<{ id: string; severity: "low" | "normal" | "high" }[]>(),
  ]);

  if (applicationsResult.error) {
    throw new Error(`No se pudo cargar el resumen de solicitudes: ${applicationsResult.error.message}`);
  }

  if (lifetimeOrdersResult.error) {
    throw new Error(
      `No se pudo cargar el resumen de ventas: ${lifetimeOrdersResult.error.message}`
    );
  }

  if (currentMonthOrdersResult.error) {
    throw new Error(
      `No se pudo cargar el resumen mensual de comisiones: ${currentMonthOrdersResult.error.message}`
    );
  }

  if (supportResult.error) {
    throw new Error(`No se pudo cargar el resumen de soporte: ${supportResult.error.message}`);
  }

  const applications = applicationsResult.data ?? [];
  const lifetimeOrders = lifetimeOrdersResult.data ?? [];
  const currentMonthOrders = currentMonthOrdersResult.data ?? [];
  const salesLast7Days = buildSalesSnapshot(
    lifetimeOrders.filter((order) => order.placed_at >= sevenDaysAgo)
  );
  const salesLast30Days = buildSalesSnapshot(
    lifetimeOrders.filter((order) => order.placed_at >= thirtyDaysAgo)
  );
  const ordersLast30Days = lifetimeOrders.filter((order) => order.placed_at >= thirtyDaysAgo);
  const salesAllTime = buildSalesSnapshot(lifetimeOrders);
  const commissionsCurrentMonthEstimated = businessesData.businesses.reduce((sum, business) => {
    const settings =
      businessesData.platformSettings.find((item) => item.business_id === business.id) ?? null;
    const businessMonthRevenue = buildSalesSnapshot(
      currentMonthOrders.filter((order) => order.business_id === business.id)
    ).revenueAmount;
    return sum + Math.round(businessMonthRevenue * ((settings?.commission_bps ?? 0) / 10000));
  }, 0);

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
    salesLast7Days,
    salesLast30Days,
    salesAllTime,
    dayHourHeatmapLast30Days: buildDayHourHeatmap(ordersLast30Days),
    salesSeriesLast30Days: buildSalesSeries(ordersLast30Days, 30),
    commissionsCurrentMonth: {
      estimatedAmount: commissionsCurrentMonthEstimated,
      configuredBusinesses: businessesData.platformSettings.filter(
        (item) => item.commission_bps > 0
      ).length,
    },
    support: {
      openIncidents: supportResult.data?.length ?? 0,
      highSeverityOpenIncidents:
        supportResult.data?.filter((incident) => incident.severity === "high").length ?? 0,
    },
  };
}

export async function getAdminPlatformHealthStats(): Promise<AdminPlatformHealthStats> {
  const admin = createAdminClient();
  const thirtyDaysAgo = getIsoDateDaysAgo(30);
  const currentMonthStart = getMonthStartOffset(0);
  const previousMonthStart = getMonthStartOffset(-1);
  const nextMonthStart = getMonthStartOffset(1);
  const twoHoursAgo = new Date(Date.now() - 1000 * 60 * 60 * 2);

  const [
    businessesData,
    ordersResult,
    applicationsResult,
    supportIncidentsResult,
    funnelEventsResult,
  ] = await Promise.all([
    getAdminBusinessBaseData(),
    admin
      .from("orders")
      .select(
        "id, business_id, order_number, customer_name, customer_phone, total_amount, payment_status, payment_provider, status_code, placed_at, ready_for_pickup_at, picked_up_at, canceled_at"
      )
      .order("placed_at", { ascending: true })
      .returns<AdminOrderRow[]>(),
    admin
      .from("business_applications")
      .select("id, status, approved_business_id, created_at, processed_at")
      .order("created_at", { ascending: true })
      .returns<AdminHealthApplicationRow[]>(),
    admin
      .from("business_support_incidents")
      .select("id, status, created_at, resolved_at")
      .returns<AdminHealthSupportIncidentRow[]>(),
    admin
      .from("platform_funnel_events")
      .select("event_type, session_id, order_id, created_at")
      .gte("created_at", thirtyDaysAgo)
      .returns<AdminFunnelEventRow[]>(),
  ]);

  if (ordersResult.error) {
    throw new Error(`No se pudieron cargar los pedidos para estadísticas: ${ordersResult.error.message}`);
  }

  if (applicationsResult.error) {
    throw new Error(
      `No se pudieron cargar las solicitudes para estadísticas: ${applicationsResult.error.message}`
    );
  }

  if (supportIncidentsResult.error) {
    throw new Error(
      `No se pudieron cargar las incidencias para estadísticas: ${supportIncidentsResult.error.message}`
    );
  }

  const funnelErrorCode =
    funnelEventsResult.error && "code" in funnelEventsResult.error
      ? funnelEventsResult.error.code
      : null;
  const shouldIgnoreMissingFunnelTable =
    funnelErrorCode === "PGRST205" ||
    funnelEventsResult.error?.message.includes("platform_funnel_events") === true;

  if (funnelEventsResult.error && !shouldIgnoreMissingFunnelTable) {
    throw new Error(
      `No se pudieron cargar los eventos de conversión: ${funnelEventsResult.error.message}`
    );
  }

  const orders = ordersResult.data ?? [];
  const paidOrders = orders.filter((order) => ["paid", "authorized"].includes(order.payment_status));
  const ordersLast30Days = paidOrders.filter((order) => order.placed_at >= thirtyDaysAgo);
  const currentMonthOrders = paidOrders.filter((order) => {
    const placedAt = new Date(order.placed_at);
    return placedAt >= currentMonthStart && placedAt < nextMonthStart;
  });
  const previousMonthOrders = paidOrders.filter((order) => {
    const placedAt = new Date(order.placed_at);
    return placedAt >= previousMonthStart && placedAt < currentMonthStart;
  });
  const settingsByBusiness = new Map(
    businessesData.platformSettings.map((settings) => [settings.business_id, settings])
  );
  const commissionForOrders = (items: AdminOrderRow[]) =>
    items.reduce((sum, order) => {
      const commissionBps = settingsByBusiness.get(order.business_id)?.commission_bps ?? 0;
      return sum + Math.round(order.total_amount * (commissionBps / 10000));
    }, 0);
  const totalGmvAmount = paidOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const currentMonthGmvAmount = currentMonthOrders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );
  const previousMonthGmvAmount = previousMonthOrders.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );
  const activeBusinesses = businessesData.businesses.filter((business) => business.is_active);
  const activeBusinessIds = new Set(activeBusinesses.map((business) => business.id));
  const customerOrders = new Map<string, AdminOrderRow[]>();

  for (const order of paidOrders) {
    const customerKey = normalizeCustomerKey(order.customer_phone);

    if (!customerKey) {
      continue;
    }

    const items = customerOrders.get(customerKey) ?? [];
    items.push(order);
    customerOrders.set(customerKey, items);
  }

  const sortedBusinessRevenues = businessesData.businesses
    .map((business) =>
      paidOrders
        .filter((order) => order.business_id === business.id)
        .reduce((sum, order) => sum + order.total_amount, 0)
    )
    .sort((a, b) => b - a);
  const businessIdsWithSalesLast30Days = new Set(
    ordersLast30Days.map((order) => order.business_id)
  );
  const funnelEvents = funnelEventsResult.error ? [] : funnelEventsResult.data ?? [];
  const uniqueEventCount = (eventType: AdminFunnelEventRow["event_type"]) =>
    new Set(
      funnelEvents
        .filter((event) => event.event_type === eventType)
        .map((event) => getStableEventKey(event))
    ).size;
  const menuViews = uniqueEventCount("menu_view");
  const cartAdds = uniqueEventCount("cart_add");
  const checkoutStarts = uniqueEventCount("checkout_started");
  const trackedOrdersCreated = uniqueEventCount("order_created");
  const trackedPaymentSuccesses = uniqueEventCount("payment_success");
  const readyDurations = paidOrders
    .filter((order) => order.ready_for_pickup_at)
    .map((order) =>
      Math.round(
        (new Date(order.ready_for_pickup_at as string).getTime() -
          new Date(order.placed_at).getTime()) /
          (1000 * 60)
      )
    )
    .filter((minutes) => minutes >= 0);
  const resolvedIncidentDurations = (supportIncidentsResult.data ?? [])
    .filter((incident) => incident.resolved_at)
    .map((incident) =>
      Math.round(
        (new Date(incident.resolved_at as string).getTime() -
          new Date(incident.created_at).getTime()) /
          (1000 * 60 * 60)
      )
    )
    .filter((hours) => hours >= 0);
  const customersWithRepeatOrders = [...customerOrders.values()].filter(
    (items) => items.length >= 2
  ).length;
  const customersBuyingAgainWithin30Days = [...customerOrders.values()].filter((items) => {
    const sortedOrders = [...items].sort(
      (a, b) => new Date(a.placed_at).getTime() - new Date(b.placed_at).getTime()
    );

    return sortedOrders.some((order, index) => {
      const nextOrder = sortedOrders[index + 1];

      if (!nextOrder) {
        return false;
      }

      return (
        new Date(nextOrder.placed_at).getTime() - new Date(order.placed_at).getTime() <=
        1000 * 60 * 60 * 24 * 30
      );
    });
  }).length;
  const applications = applicationsResult.data ?? [];
  const approvedApplications = applications.filter(
    (application) => application.status === "approved"
  );
  const businessesById = new Map(
    businessesData.businesses.map((business) => [business.id, business])
  );
  const firstPaidOrderByBusiness = new Map<string, AdminOrderRow>();

  for (const order of paidOrders) {
    if (!firstPaidOrderByBusiness.has(order.business_id)) {
      firstPaidOrderByBusiness.set(order.business_id, order);
    }
  }

  const approvedWithBusiness = approvedApplications.filter(
    (application) => application.approved_business_id
  );
  const approvedWithCompletedOnboarding = approvedWithBusiness.filter((application) => {
    const business = application.approved_business_id
      ? businessesById.get(application.approved_business_id)
      : null;
    return business?.onboarding_completed_at !== null && business?.onboarding_completed_at !== undefined;
  });
  const completedWithFirstOrder = approvedWithCompletedOnboarding.filter(
    (application) =>
      application.approved_business_id &&
      firstPaidOrderByBusiness.has(application.approved_business_id)
  );
  const daysFromApplicationToFirstOrder = completedWithFirstOrder
    .map((application) => {
      const firstOrder = application.approved_business_id
        ? firstPaidOrderByBusiness.get(application.approved_business_id)
        : null;

      if (!firstOrder) {
        return null;
      }

      return Math.round(
        (new Date(firstOrder.placed_at).getTime() - new Date(application.created_at).getTime()) /
          (1000 * 60 * 60 * 24)
      );
    })
    .filter((days): days is number => days !== null && days >= 0);

  return {
    business: {
      gmvTotalAmount: totalGmvAmount,
      netCommissionAmount: commissionForOrders(paidOrders),
      realTakeRate: getRate(commissionForOrders(paidOrders), totalGmvAmount) ?? 0,
      currentMonthGmvAmount,
      previousMonthGmvAmount,
      monthlyGmvGrowthRate: getGrowthRate(currentMonthGmvAmount, previousMonthGmvAmount),
      currentMonthCommissionAmount: commissionForOrders(currentMonthOrders),
      previousMonthCommissionAmount: commissionForOrders(previousMonthOrders),
      monthlyCommissionGrowthRate: getGrowthRate(
        commissionForOrders(currentMonthOrders),
        commissionForOrders(previousMonthOrders)
      ),
    },
    demand: {
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      ordersPerActiveBusiness: getRatio(paidOrders.length, activeBusinesses.length),
      averageTicketAmount: buildSalesSnapshot(paidOrders).averageTicketAmount,
      purchaseFrequencyPerCustomer:
        customerOrders.size > 0 ? getRatio(paidOrders.length, customerOrders.size) : null,
    },
    marketplace: {
      registeredBusinesses: businessesData.businesses.length,
      activeBusinesses: activeBusinesses.length,
      activeCustomersLast30Days: new Set(
        ordersLast30Days.map((order) => normalizeCustomerKey(order.customer_phone)).filter(Boolean)
      ).size,
      ordersPerBusinessLast30Days: getRatio(ordersLast30Days.length, activeBusinesses.length),
      topBusinessRevenueShare: getRate(sortedBusinessRevenues[0] ?? 0, totalGmvAmount) ?? 0,
      topTwoBusinessesRevenueShare:
        getRate((sortedBusinessRevenues[0] ?? 0) + (sortedBusinessRevenues[1] ?? 0), totalGmvAmount) ??
        0,
    },
    conversion: {
      hasTracking: menuViews > 0,
      menuViews,
      cartAdds,
      checkoutStarts,
      ordersCreated: trackedOrdersCreated || orders.filter((order) => order.placed_at >= thirtyDaysAgo).length,
      paymentSuccesses: trackedPaymentSuccesses || ordersLast30Days.length,
      menuToCartRate: getRate(cartAdds, menuViews),
      cartToCheckoutRate: getRate(checkoutStarts, cartAdds),
      checkoutToOrderRate: getRate(trackedOrdersCreated, checkoutStarts),
      orderToPaymentRate: getRate(trackedPaymentSuccesses, trackedOrdersCreated),
      totalPurchaseRate: getRate(trackedPaymentSuccesses, menuViews),
    },
    operation: {
      averageReadyMinutes: getAverage(readyDurations),
      canceledOrders: orders.filter(
        (order) => order.status_code === "canceled" || order.payment_status === "canceled"
      ).length,
      paymentErrorOrders: orders.filter((order) => order.payment_status === "failed").length,
      notPickedUpOrders: paidOrders.filter(
        (order) =>
          order.status_code === "ready_for_pickup" &&
          !order.picked_up_at &&
          order.ready_for_pickup_at &&
          new Date(order.ready_for_pickup_at) < twoHoursAgo
      ).length,
      averageIncidentResolutionHours: getAverage(resolvedIncidentDurations),
    },
    retention: {
      repeatCustomerRate: getRate(customersWithRepeatOrders, customerOrders.size),
      localChurnRate: getRate(
        businessesData.businesses.filter((business) => {
          const settings = settingsByBusiness.get(business.id);
          return !business.is_active || settings?.platform_status === "blocked";
        }).length,
        businessesData.businesses.length
      ) ?? 0,
      businessesWithoutSalesLast30Days: activeBusinesses.filter(
        (business) =>
          activeBusinessIds.has(business.id) && !businessIdsWithSalesLast30Days.has(business.id)
      ).length,
      customersBuyingAgainWithin30DaysRate: getRate(
        customersBuyingAgainWithin30Days,
        customerOrders.size
      ),
    },
    onboarding: {
      applicationsTotal: applications.length,
      applicationsApproved: approvedApplications.length,
      applicationApprovalRate: getRate(approvedApplications.length, applications.length),
      approvedToOnboardingCompletedRate: getRate(
        approvedWithCompletedOnboarding.length,
        approvedWithBusiness.length
      ),
      onboardingCompletedToFirstOrderRate: getRate(
        completedWithFirstOrder.length,
        approvedWithCompletedOnboarding.length
      ),
      averageDaysFromApplicationToFirstOrder: getAverage(daysFromApplicationToFirstOrder),
    },
    dayHourHeatmapLast30Days: buildDayHourHeatmap(ordersLast30Days),
    salesSeriesLast30Days: buildSalesSeries(ordersLast30Days, 30),
    monthlySalesSeriesLast12Months: buildMonthlySalesSeries(paidOrders, 12),
  };
}

export async function getAdminBusinesses(): Promise<AdminBusinessListItem[]> {
  const admin = createAdminClient();
  const thirtyDaysAgo = getIsoDateDaysAgo(30);
  const monthStartIso = getCurrentMonthStartIso();
  const [{ businesses, members, paymentConnections, approvedApplications, platformSettings }, ordersResult, monthOrdersResult] =
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
      admin
        .from("orders")
        .select(
          "id, business_id, order_number, customer_name, total_amount, payment_status, status_code, placed_at"
        )
        .in("payment_status", ["paid", "authorized"])
        .gte("placed_at", monthStartIso)
        .returns<AdminOrderRow[]>(),
    ]);

  if (ordersResult.error) {
    throw new Error(`No se pudieron cargar las ventas por negocio: ${ordersResult.error.message}`);
  }

  if (monthOrdersResult.error) {
    throw new Error(
      `No se pudieron cargar las ventas del mes por negocio: ${monthOrdersResult.error.message}`
    );
  }

  const paidOrders = ordersResult.data ?? [];
  const monthOrders = monthOrdersResult.data ?? [];

  return businesses.map((business) =>
    mapAdminBusinessListItem({
      business,
      members: members.filter((member) => member.business_id === business.id),
      paymentConnection:
        paymentConnections.find((connection) => connection.business_id === business.id) ?? null,
      ordersLast30Days: paidOrders.filter((order) => order.business_id === business.id),
      ordersCurrentMonth: monthOrders.filter((order) => order.business_id === business.id),
      platformSettings:
        platformSettings.find((settings) => settings.business_id === business.id) ?? null,
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
    platformSettingsResult,
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
      .from("business_platform_settings")
      .select(
        "business_id, commission_bps, billing_notes, platform_status, fiscal_name, fiscal_tax_id, fiscal_address, commercial_owner, acquisition_source"
      )
      .eq("business_id", businessId)
      .maybeSingle<AdminBusinessPlatformSettingsRow>(),
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

  if (platformSettingsResult.error) {
    throw new Error(
      `No se pudo cargar la configuración comercial del negocio: ${platformSettingsResult.error.message}`
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
  const monthStartIso = getCurrentMonthStartIso();
  const ordersLast30Days = paidOrders.filter((order) => order.placed_at >= thirtyDaysAgo);
  const base = mapAdminBusinessListItem({
    business,
    members,
    paymentConnection: paymentConnectionResult.data ?? null,
    ordersLast30Days,
    ordersCurrentMonth: paidOrders.filter((order) => order.placed_at >= monthStartIso),
    platformSettings: platformSettingsResult.data ?? null,
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
    dayHourHeatmapLast30Days: buildDayHourHeatmap(ordersLast30Days),
    salesSeriesLast30Days: buildSalesSeries(ordersLast30Days, 30),
    commissionsCurrentMonthAmount: Math.round(
      buildSalesSnapshot(paidOrders.filter((order) => order.placed_at >= monthStartIso))
        .revenueAmount * ((platformSettingsResult.data?.commission_bps ?? 0) / 10000)
    ),
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

export async function getAdminGlobalOrders(params?: {
  businessId?: string;
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  const admin = createAdminClient();
  let query = admin
    .from("orders")
    .select(
      "id, business_id, order_number, customer_name, customer_phone, total_amount, payment_status, payment_provider, status_code, placed_at, business:businesses(name, slug)"
    )
    .order("placed_at", { ascending: false })
    .limit(200);

  if (params?.businessId) {
    query = query.eq("business_id", params.businessId);
  }

  if (params?.status) {
    query = query.eq("status_code", params.status);
  }

  if (params?.paymentStatus) {
    query = query.eq("payment_status", params.paymentStatus);
  }

  if (params?.dateFrom) {
    query = query.gte("placed_at", params.dateFrom);
  }

  if (params?.dateTo) {
    query = query.lte("placed_at", params.dateTo);
  }

  const { data, error } = await query.returns<
    (AdminOrderRow & {
      business:
        | {
            name: string;
            slug: string;
          }
        | {
            name: string;
            slug: string;
          }[]
        | null;
    })[]
  >();

  if (error) {
    throw new Error(`No se pudieron cargar los pedidos globales: ${error.message}`);
  }

  return (data ?? []).map((order): AdminGlobalOrder => {
    const relatedBusiness = Array.isArray(order.business)
      ? order.business[0]
      : order.business;
    const isProblematic =
      order.payment_status === "failed" ||
      order.payment_status === "canceled" ||
      (order.payment_status === "pending" &&
        Date.now() - new Date(order.placed_at).getTime() > 1000 * 60 * 30);

    return {
      id: order.id,
      businessId: order.business_id,
      businessName: relatedBusiness?.name ?? "Negocio eliminado",
      businessSlug: relatedBusiness?.slug ?? "",
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerPhone: order.customer_phone ?? null,
      totalAmount: order.total_amount,
      paymentStatus: order.payment_status,
      paymentProvider: order.payment_provider ?? null,
      statusCode: order.status_code,
      placedAt: order.placed_at,
      isProblematic,
    };
  });
}

export async function getAdminSupportIncidents() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("business_support_incidents")
    .select("id, business_id, title, status, severity, notes, created_at, business:businesses(name, slug)")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<AdminSupportIncidentRow[]>();

  if (error) {
    throw new Error(`No se pudieron cargar las incidencias: ${error.message}`);
  }

  return (data ?? []).map((incident): AdminSupportIncident => ({
    id: incident.id,
    businessId: incident.business_id,
    businessName: incident.business?.name ?? "Negocio eliminado",
    businessSlug: incident.business?.slug ?? "",
    title: incident.title,
    status: incident.status,
    severity: incident.severity,
    notes: incident.notes,
    createdAt: incident.created_at,
  }));
}

export async function getAdminAuditLogs() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("admin_audit_logs")
    .select("id, actor_user_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(150)
    .returns<AdminAuditLogRow[]>();

  if (error) {
    throw new Error(`No se pudo cargar la auditoría: ${error.message}`);
  }

  return (data ?? []).map((log): AdminAuditLog => ({
    id: log.id,
    actorUserId: log.actor_user_id,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    metadata: log.metadata,
    createdAt: log.created_at,
  }));
}

export async function getAdminPlatformSettings(): Promise<AdminPlatformSettings> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("platform_settings")
    .select("key, value")
    .returns<AdminPlatformSettingRow[]>();

  if (error) {
    throw new Error(`No se pudo cargar la configuración de plataforma: ${error.message}`);
  }

  const byKey = new Map((data ?? []).map((setting) => [setting.key, setting.value]));
  const commercialDefaults = byKey.get("commercial_defaults") ?? {};
  const defaultCommissionBpsValue = commercialDefaults.default_commission_bps;

  return {
    defaultCommissionBps:
      typeof defaultCommissionBpsValue === "number" ? defaultCommissionBpsValue : 0,
    featureFlags: byKey.get("feature_flags") ?? {},
    globalTexts: byKey.get("global_texts") ?? {},
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
    pickup_address: string | null;
    business_type: string | null;
    current_sales_channels: string | null;
    estimated_order_volume: string | null;
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
    pickupAddress: row.pickup_address,
    businessType: row.business_type,
    currentSalesChannels: row.current_sales_channels,
    estimatedOrderVolume: row.estimated_order_volume,
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
      "id, status, business_name, contact_name, email, phone, instagram_or_website, city, pickup_address, business_type, current_sales_channels, estimated_order_volume, message, review_notes, reviewed_at, reviewer_user_id, approved_business_id, related_user_id, processed_at, access_email_sent_at, created_at, updated_at"
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
      pickup_address: string | null;
      business_type: string | null;
      current_sales_channels: string | null;
      estimated_order_volume: string | null;
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
      "id, status, business_name, contact_name, email, phone, instagram_or_website, city, pickup_address, business_type, current_sales_channels, estimated_order_volume, message, review_notes, reviewed_at, reviewer_user_id, approved_business_id, related_user_id, processed_at, access_email_sent_at, created_at, updated_at"
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
      pickup_address: string | null;
      business_type: string | null;
      current_sales_channels: string | null;
      estimated_order_volume: string | null;
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
