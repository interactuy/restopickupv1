import { submitBusinessApplicationAction } from "@/lib/business-application-actions";

import { SubmitButton } from "@/components/dashboard/submit-button";

type BusinessApplicationFormProps = {
  error?: string;
  success?: string;
  mode?: "commercial" | "full";
  redirectPath?: string;
};

export function BusinessApplicationForm({
  error,
  success,
  mode = "full",
  redirectPath = "/solicitar-acceso",
}: BusinessApplicationFormProps) {
  const inputClass =
    "w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[rgba(107,98,90,0.55)] focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[rgba(198,90,46,0.1)]";
  const labelClass = "mb-2 block text-sm font-semibold text-[#2f2118]";
  const sectionTitleClass =
    "text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-secondary)]";
  const isCommercial = mode === "commercial";

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success === "submitted" ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Recibimos el registro de tu local. Te contactamos para seguir con la puesta en marcha.
        </div>
      ) : null}

      <form action={submitBusinessApplicationAction} className="space-y-7">
        <input type="hidden" name="redirectPath" value={redirectPath} />

        {isCommercial ? (
          <section className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="businessName" className={labelClass}>
                  Nombre del local
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  required
                  placeholder="Ej. Mostrador Centro"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="contactName" className={labelClass}>
                  Responsable
                </label>
                <input
                  id="contactName"
                  name="contactName"
                  required
                  placeholder="Nombre y apellido"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="email" className={labelClass}>
                  Email de contacto
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="nombre@local.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="city" className={labelClass}>
                  Ciudad / zona
                </label>
                <input
                  id="city"
                  name="city"
                  required
                  placeholder="Ej. Centro, Pocitos, Cordón..."
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="businessType" className={labelClass}>
                  Tipo de negocio
                </label>
                <input
                  id="businessType"
                  name="businessType"
                  required
                  placeholder="Café, burgers, panadería..."
                  className={inputClass}
                />
              </div>
              <div className="hidden md:block" />
            </div>
          </section>
        ) : (
          <>
            <div className="rounded-[1.4rem] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--color-foreground)]">
                Nos sirve para entender cómo opera tu local hoy.
              </p>
              <p className="mt-1 text-sm leading-7 text-[var(--color-muted)]">
                Con estos datos revisamos encaje, zona, tipo de operación y la mejor forma de ponerlo en marcha.
              </p>
            </div>

            <section className="space-y-5">
              <p className={sectionTitleClass}>Identidad</p>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="businessName" className={labelClass}>
                    Nombre del local
                  </label>
                  <input
                    id="businessName"
                    name="businessName"
                    required
                    placeholder="Ej. Mostrador Centro"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="contactName" className={labelClass}>
                    Responsable
                  </label>
                  <input
                    id="contactName"
                    name="contactName"
                    required
                    placeholder="Nombre y apellido"
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <p className={sectionTitleClass}>Contacto</p>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="nombre@local.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Celular
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    required
                    placeholder="+598 ..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="instagramOrWebsite" className={labelClass}>
                    Instagram o web{" "}
                    <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
                  </label>
                  <input
                    id="instagramOrWebsite"
                    name="instagramOrWebsite"
                    placeholder="@tu_local o https://..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="city" className={labelClass}>
                    Ciudad / zona
                  </label>
                  <input
                    id="city"
                    name="city"
                    required
                    placeholder="Ej. Centro, Pocitos, Cordón..."
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <p className={sectionTitleClass}>Operación</p>
              <div>
                <label htmlFor="pickupAddress" className={labelClass}>
                  Dirección de retiro del local{" "}
                  <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
                </label>
                <input
                  id="pickupAddress"
                  name="pickupAddress"
                  placeholder="Ej. Av. 18 de Julio 1450, Montevideo"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label htmlFor="businessType" className={labelClass}>
                    Tipo de negocio
                  </label>
                  <input
                    id="businessType"
                    name="businessType"
                    required
                    placeholder="Pizzería, burgers, café..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="currentSalesChannels" className={labelClass}>
                    ¿Ya venden online?{" "}
                    <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
                  </label>
                  <select
                    id="currentSalesChannels"
                    name="currentSalesChannels"
                    className={inputClass}
                    defaultValue=""
                  >
                    <option value="">Seleccionar</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="web">Web propia</option>
                    <option value="marketplace">App/marketplace</option>
                    <option value="multiple">Varios canales</option>
                    <option value="none">Todavía no</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="estimatedOrderVolume" className={labelClass}>
                    Volumen estimado{" "}
                    <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
                  </label>
                  <select
                    id="estimatedOrderVolume"
                    name="estimatedOrderVolume"
                    className={inputClass}
                    defaultValue=""
                  >
                    <option value="">Seleccionar</option>
                    <option value="starting">Recién empezando</option>
                    <option value="1-10">1-10 pedidos/día</option>
                    <option value="11-30">11-30 pedidos/día</option>
                    <option value="31-60">31-60 pedidos/día</option>
                    <option value="60+">60+ pedidos/día</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className={labelClass}>
                  Comentario breve{" "}
                  <span className="font-normal text-[var(--color-muted)]">(opcional)</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Qué venden, cómo manejan retiros o cualquier detalle útil."
                  className={inputClass}
                />
              </div>
            </section>
          </>
        )}

        <div className="flex flex-wrap items-center gap-4 border-t border-[var(--color-border)] pt-6">
          <SubmitButton
            label={isCommercial ? "Quiero activar mi local" : "Registrar local"}
            pendingLabel="Enviando..."
          />
          <p className="text-sm text-[var(--color-muted)]">
            {isCommercial
              ? "Te contactamos para revisar si encaja con tu operación y cómo seguir."
              : "Te contactamos para revisar próximos pasos y si encaja con tu operación."}
          </p>
        </div>
      </form>
    </div>
  );
}
