import { submitBusinessApplicationAction } from "@/lib/business-application-actions";

import { SubmitButton } from "@/components/dashboard/submit-button";

type BusinessApplicationFormProps = {
  error?: string;
  success?: string;
};

export function BusinessApplicationForm({
  error,
  success,
}: BusinessApplicationFormProps) {
  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success === "submitted" ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Recibimos tu solicitud. La revisamos manualmente y te contactamos si avanzamos.
        </div>
      ) : null}

      <form action={submitBusinessApplicationAction} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="businessName"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Nombre del local
            </label>
            <input
              id="businessName"
              name="businessName"
              required
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="contactName"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Nombre de contacto
            </label>
            <input
              id="contactName"
              name="contactName"
              required
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Celular
            </label>
            <input
              id="phone"
              name="phone"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label
              htmlFor="instagramOrWebsite"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Instagram o web
            </label>
            <input
              id="instagramOrWebsite"
              name="instagramOrWebsite"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Ciudad
            </label>
            <input
              id="city"
              name="city"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 text-sm outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="businessType"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Tipo de negocio
            </label>
            <input
              id="businessType"
              name="businessType"
              placeholder="Pizzería, burgers, café..."
              className="w-full rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
          >
            Contanos un poco más
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            placeholder="Qué venden, cómo manejan retiros, si ya tienen menú digital, etc."
            className="w-full rounded-2xl border border-[var(--color-border)] bg-white/90 px-4 py-3 text-sm outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton
            label="Enviar solicitud"
            pendingLabel="Enviando..."
          />
          <p className="text-sm text-[var(--color-muted)]">
            No se crea acceso automático. Primero revisamos la solicitud manualmente.
          </p>
        </div>
      </form>
    </div>
  );
}
