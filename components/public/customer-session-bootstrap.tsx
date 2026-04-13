"use client";

import { useEffect } from "react";

import { bootstrapCustomerAccountState } from "@/lib/customer-account-client";
import { createClient } from "@/lib/supabase/client";

export function CustomerSessionBootstrap() {
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const sync = async () => {
      if (!isMounted) {
        return;
      }

      await bootstrapCustomerAccountState();
    };

    sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        sync();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
