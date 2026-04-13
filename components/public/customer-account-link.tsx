"use client";

import Link from "next/link";
import { useState } from "react";

import { getStoredCustomerProfile } from "@/lib/customer-profile";

export function CustomerAccountLink() {
  const [label] = useState(() => {
    const profile = getStoredCustomerProfile();
    return profile.name.trim() ? profile.name.trim().split(/\s+/)[0] : "Ingresar";
  });

  return (
    <Link
      href="/cuenta"
      className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
    >
      {label}
    </Link>
  );
}
