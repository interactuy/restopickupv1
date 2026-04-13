"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { updateBusinessSettingsAction } from "@/lib/dashboard/actions";
import type { DashboardContext } from "@/lib/dashboard/server";

import { AccordionSection } from "@/components/dashboard/accordion-section";
import { SubmitButton } from "@/components/dashboard/submit-button";

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

type BusinessSettingsFormProps = {
  business: DashboardContext["business"];
};

export function BusinessSettingsForm({ business }: BusinessSettingsFormProps) {
  const initialScheduleByDay = useMemo(
    () =>
      Object.fromEntries(
        DAY_LABELS.map((_, day) => {
          const entry = business.businessHours.find((item) => item.day === day);
          return [
            day,
            {
              isClosed: entry?.isClosed ?? true,
              openTime: entry?.openTime ?? "",
              closeTime: entry?.closeTime ?? "",
            },
          ];
        })
      ) as Record<number, { isClosed: boolean; openTime: string; closeTime: string }>,
    [business.businessHours]
  );
  const [scheduleByDay, setScheduleByDay] = useState(initialScheduleByDay);

  return (
    <form action={updateBusinessSettingsAction} className="space-y-5">
      <AccordionSection
        title="Identidad del local"
        description="Definí nombre, descripción y la información base que ve el cliente al entrar al menú."
        badge="Visible en el menú"
        defaultOpen
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Descripción breve del local
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={business.description ?? ""}
              placeholder="Contale al cliente qué tipo de cocina hacés, qué te destaca o qué puede esperar al pedir."
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            />
            <p className="mt-2 text-xs text-[var(--color-muted)]">
              Esta descripción se muestra arriba del menú público.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Nombre del local
              </label>
              <input
                id="name"
                name="name"
                defaultValue={business.name}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="contactEmail"
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Email de contacto
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                defaultValue={business.contactEmail ?? ""}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
              />
            </div>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection
        title="Contacto y branding"
        description="Configurá cómo aparece el local y cómo puede contactarse el cliente después de una compra."
        badge="Opcional"
      >
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="contactPhone"
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Celular de contacto
              </label>
              <input
                id="contactPhone"
                name="contactPhone"
                defaultValue={business.contactPhone ?? ""}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="contactActionType"
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Contacto después de la compra
              </label>
              <select
                id="contactActionType"
                name="contactActionType"
                defaultValue={business.contactActionType}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
              >
                <option value="call">Llamar</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Este contacto se muestra en la pantalla del pedido confirmado.
              </p>
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <label
                htmlFor="profileImage"
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Foto de perfil
              </label>
              <input
                id="profileImage"
                name="profileImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-surface)] file:px-3 file:py-2 file:text-sm file:font-medium"
              />
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Ideal para logo o avatar del local.
              </p>
              {business.profileImageUrl ? (
                <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={business.profileImageUrl}
                    alt={business.name}
                    className="h-32 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>

            <div className="rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <label
                htmlFor="coverImage"
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Portada del menú
              </label>
              <input
                id="coverImage"
                name="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] outline-none file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-surface)] file:px-3 file:py-2 file:text-sm file:font-medium"
              />
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                Se usa en el hero público del menú.
              </p>
              {business.coverImageUrl ? (
                <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-[var(--color-border)] bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={business.coverImageUrl}
                    alt={`Portada de ${business.name}`}
                    className="h-32 w-full object-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </AccordionSection>

      <details className="group overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-4 marker:hidden [&::-webkit-details-marker]:hidden">
          <div>
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              Horarios por día
            </p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              Definí los horarios semanales y usá cierre especial cuando el local no tome pedidos.
            </p>
          </div>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-muted)] transition group-open:rotate-180">
            <ChevronDown className="h-4 w-4" />
          </span>
        </summary>

        <div className="space-y-3 border-t border-[var(--color-border)] px-4 pb-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl text-xs text-[var(--color-muted)]">
              La app calcula automáticamente si el local está abierto según estos horarios y la zona horaria del negocio.
            </p>
            <label className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-foreground)]">
              <span className="whitespace-nowrap">Cierre especial</span>
              <input
                type="checkbox"
                name="isTemporarilyClosed"
                defaultChecked={business.isTemporarilyClosed}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
            </label>
          </div>

          <div className="space-y-3">
            {DAY_LABELS.map((label, day) => {
              const daySchedule = scheduleByDay[day] ?? {
                isClosed: true,
                openTime: "",
                closeTime: "",
              };
              const isClosed = daySchedule.isClosed;

              return (
                <div
                  key={label}
                  className="grid gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-white p-4 md:grid-cols-2 xl:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)_120px]"
                >
                  <div className="flex items-center text-sm font-medium text-[var(--color-foreground)] md:col-span-2 xl:col-span-1">
                    {label}
                  </div>
                  <div>
                    <label
                      htmlFor={`hours-${day}-open`}
                      className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]"
                    >
                      Abre
                    </label>
                    <input
                      id={`hours-${day}-open`}
                      name={`hours_${day}_open`}
                      type="time"
                      value={daySchedule.openTime}
                      onChange={(event) =>
                        setScheduleByDay((current) => ({
                          ...current,
                          [day]: {
                            ...current[day],
                            openTime: event.target.value,
                          },
                        }))
                      }
                      disabled={isClosed}
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`hours-${day}-close`}
                      className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]"
                    >
                      Cierra
                    </label>
                    <input
                      id={`hours-${day}-close`}
                      name={`hours_${day}_close`}
                      type="time"
                      value={daySchedule.closeTime}
                      onChange={(event) =>
                        setScheduleByDay((current) => ({
                          ...current,
                          [day]: {
                            ...current[day],
                            closeTime: event.target.value,
                          },
                        }))
                      }
                      disabled={isClosed}
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none disabled:opacity-50"
                    />
                  </div>
                  <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-foreground)] md:col-span-2 xl:col-span-1">
                    <span>Cerrado</span>
                    <input
                      type="checkbox"
                      name={`hours_${day}_closed`}
                      checked={isClosed}
                      onChange={(event) =>
                        setScheduleByDay((current) => ({
                          ...current,
                          [day]: {
                            isClosed: event.target.checked,
                            openTime:
                              !event.target.checked && !current[day]?.openTime
                                ? "12:00"
                                : current[day]?.openTime ?? "",
                            closeTime:
                              !event.target.checked && !current[day]?.closeTime
                                ? "23:00"
                                : current[day]?.closeTime ?? "",
                          },
                        }))
                      }
                      className="h-4 w-4 accent-[var(--color-accent)]"
                    />
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </details>

      <AccordionSection
        title="Retiro y tiempos"
        description="Ajustá la dirección visible, el tiempo estimado y las instrucciones para que el retiro sea claro."
        badge="Operación"
        defaultOpen
      >
        <div className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="pickupAddress"
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Dirección de retiro
              </label>
              <input
                id="pickupAddress"
                name="pickupAddress"
                defaultValue={business.pickupAddress}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
              />
              <p className="mt-2 text-xs text-[var(--color-muted)]">
                La ubicación del mapa se detecta automáticamente a partir de esta dirección.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="prepTimeMinMinutes"
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Tiempo mínimo estimado
              </label>
              <div className="relative">
                <input
                  id="prepTimeMinMinutes"
                  name="prepTimeMinMinutes"
                  type="number"
                  min={0}
                  defaultValue={business.prepTimeMinMinutes ?? ""}
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 pr-16 text-sm outline-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-[var(--color-muted)]">
                  min
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="prepTimeMaxMinutes"
                className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
              >
                Tiempo máximo estimado
              </label>
              <div className="relative">
                <input
                  id="prepTimeMaxMinutes"
                  name="prepTimeMaxMinutes"
                  type="number"
                  min={0}
                  defaultValue={business.prepTimeMaxMinutes ?? ""}
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 pr-16 text-sm outline-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm text-[var(--color-muted)]">
                  min
                </span>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="pickupInstructions"
              className="mb-2 block text-sm font-medium text-[var(--color-foreground)]"
            >
              Instrucciones de retiro
            </label>
            <textarea
              id="pickupInstructions"
              name="pickupInstructions"
              rows={5}
              defaultValue={business.pickupInstructions ?? ""}
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>
      </AccordionSection>

      <SubmitButton label="Guardar cambios" pendingLabel="Guardando..." />
    </form>
  );
}
