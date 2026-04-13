import "server-only";

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const ADMIN_MODE_COOKIE_PREFIX = "dashboard_admin_mode";
const ADMIN_MODE_COOKIE_TTL_SECONDS = 60 * 60 * 12;

function getAdminModeCookieName(params: { businessId: string; userId: string }) {
  return `${ADMIN_MODE_COOKIE_PREFIX}:${params.businessId}:${params.userId}`;
}

export function hashAdminPin(pin: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(pin, salt, 64).toString("hex");

  return `${salt}:${derived}`;
}

export function verifyAdminPin(params: { pin: string; hash: string | null | undefined }) {
  if (!params.hash) {
    return false;
  }

  const [salt, expectedHex] = params.hash.split(":");

  if (!salt || !expectedHex) {
    return false;
  }

  const actual = scryptSync(params.pin, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export async function isAdminModeEnabled(params: {
  businessId: string;
  userId: string;
}) {
  const store = await cookies();
  const value = store.get(getAdminModeCookieName(params))?.value;

  return value === "1";
}

export async function enableAdminMode(params: {
  businessId: string;
  userId: string;
}) {
  const store = await cookies();
  store.set(getAdminModeCookieName(params), "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/dashboard",
    maxAge: ADMIN_MODE_COOKIE_TTL_SECONDS,
  });
}

export async function disableAdminMode(params: {
  businessId: string;
  userId: string;
}) {
  const store = await cookies();
  store.set(getAdminModeCookieName(params), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/dashboard",
    maxAge: 0,
  });
}
