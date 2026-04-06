"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type SetPasswordFormProps = {
  searchParams: {
    code?: string;
    token_hash?: string;
    type?: string;
    error?: string;
  };
};

export function SetPasswordForm({ searchParams }: SetPasswordFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasSetupSession, setHasSetupSession] = useState(false);

  useEffect(() => {
    let isActive = true;

    const initializeSession = async () => {
      const supabase = createClient();
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const code = searchParams.code;
      const tokenHash = searchParams.token_hash;
      const type = searchParams.type;
      const urlError = searchParams.error;
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const hashType = hashParams.get("type");
      const hasLinkCredentials = Boolean(
        code || tokenHash || (accessToken && refreshToken)
      );

      if (urlError === "invalid-or-expired-link") {
        if (isActive) {
          setError(
            "El link de acceso no es válido o ya expiró. Pedinos uno nuevo y volvé a intentarlo."
          );
          setIsInitializing(false);
        }
        return;
      }

      try {
        if (hasLinkCredentials) {
          await supabase.auth.signOut();
          window.sessionStorage.removeItem("restopickup-password-setup");
        }

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }
        } else if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
            code
          );

          if (exchangeError) {
            throw exchangeError;
          }
        } else if (
          tokenHash &&
          type &&
          ["signup", "invite", "magiclink", "recovery", "email_change", "email"].includes(
            type
          )
        ) {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as EmailOtpType,
          });

          if (verifyError) {
            throw verifyError;
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session && isActive) {
          window.sessionStorage.removeItem("restopickup-password-setup");
          setError(
            "No encontramos una sesión válida para definir la contraseña. Volvé a abrir el link del email."
          );
          setHasSetupSession(false);
        } else if (
          session &&
          (hasLinkCredentials || hashType === "recovery")
        ) {
          window.sessionStorage.setItem("restopickup-password-setup", "1");

          if (isActive) {
            setError(null);
            setHasSetupSession(true);
          }

          if (code || tokenHash || accessToken || refreshToken || hashType) {
            router.replace("/auth/set-password");
            router.refresh();
          }
        } else {
          const isSetupSession =
            window.sessionStorage.getItem("restopickup-password-setup") === "1";

          if (isActive) {
            if (session && isSetupSession) {
              setError(null);
              setHasSetupSession(true);
            } else {
              setHasSetupSession(false);
              setError(
                "No encontramos una sesión válida para definir la contraseña. Volvé a abrir el link del email."
              );
            }
          }
        }
      } catch {
        window.sessionStorage.removeItem("restopickup-password-setup");
        if (isActive) {
          setHasSetupSession(false);
          setError(
            "No pudimos validar el link de primer acceso. Pedinos uno nuevo y volvé a intentarlo."
          );
        }
      } finally {
        if (isActive) {
          setIsInitializing(false);
        }
      }
    };

    initializeSession();

    return () => {
      isActive = false;
    };
  }, [router, searchParams]);

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();

        if (isInitializing || !hasSetupSession) {
          return;
        }

        const formData = new FormData(event.currentTarget);
        const password = String(formData.get("password") ?? "");
        const confirmPassword = String(formData.get("confirmPassword") ?? "");

        if (password.length < 8) {
          setSuccess(null);
          setError("La contraseña debe tener al menos 8 caracteres.");
          return;
        }

        if (password !== confirmPassword) {
          setSuccess(null);
          setError("Las contraseñas no coinciden.");
          return;
        }

        startTransition(async () => {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            setSuccess(null);
            setError(
              "No encontramos una sesión válida para definir la contraseña. Volvé a abrir el link del email."
            );
            return;
          }

          const { error: updateError } = await supabase.auth.updateUser({
            password,
          });

          if (updateError) {
            setSuccess(null);
            setError(updateError.message);
            return;
          }

          window.sessionStorage.removeItem("restopickup-password-setup");
          setError(null);
          setSuccess("Contraseña configurada. Te llevamos al dashboard...");

          router.replace("/dashboard");
          router.refresh();
        });
      }}
    >
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
        >
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={8}
          required
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
        >
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={8}
          required
          className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending || isInitializing}
        className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isInitializing
          ? "Validando acceso..."
          : isPending
            ? "Guardando..."
            : "Definir contraseña"}
      </button>
    </form>
  );
}
