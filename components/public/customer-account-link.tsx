"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  CUSTOMER_PROFILE_UPDATED_EVENT,
  getStoredCustomerProfile,
} from "@/lib/customer-profile";

export function CustomerAccountLink() {
  const [label, setLabel] = useState("Ingresar");

  useEffect(() => {
    function syncLabel() {
      const profile = getStoredCustomerProfile();
      setLabel(profile.name.trim() ? profile.name.trim().split(/\s+/)[0] : "Ingresar");
    }

    syncLabel();
    window.addEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, syncLabel);

    return () => {
      window.removeEventListener(CUSTOMER_PROFILE_UPDATED_EVENT, syncLabel);
    };
  }, []);

  return (
    <Link
      href="/cuenta"
      className="text-sm font-medium text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
    >
      {label}
    </Link>
  );
}
