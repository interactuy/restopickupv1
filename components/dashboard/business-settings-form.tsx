"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

import { updateBusinessSettingsAction } from "@/lib/dashboard/actions";
import type { DashboardContext } from "@/lib/dashboard/server";

import { AccordionSection } from "@/components/dashboard/accordion-section";
import { SubmitButton } from "@/components/dashboard/submit-button";

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const WEEKDAY_DAY_INDEXES = [1, 2, 3, 4, 5];
const WEEKEND_DAY_INDEXES = [0, 6];

type BusinessSettingsFormProps = {
  business: DashboardContext["business"];
};

export function BusinessSettingsForm({ business }: BusinessSettingsFormProps) {
  const initialScheduleByDay = useMemo(
    () =>
      Object.fromEntries(
        DAY_LABELS.map((_, day) => {
          const entry = business.businessHours.find((item) => item.day === day);
          const intervals =
            entry?.intervals?.length
              ? entry.intervals
              : entry?.openTime && entry.closeTime
                ? [{ openTime: entry.openTime, closeTime: entry.closeTime }]
                : [];
          return [
            day,
            {
              isClosed: entry?.isClosed ?? true,
              intervals,
            },
          ];
        })
      ) as Record<
        number,
        { isClosed: boolean; intervals: { openTime: string; closeTime: string }[] }
      >,
    [business.businessHours]
  );
  const [scheduleByDay, setScheduleByDay] = useState(initialScheduleByDay);

  function cloneDaySchedule(daySchedule: (typeof scheduleByDay)[number]) {
    const currentDay = daySchedule;

    if (!currentDay) {
      return {
        isClosed: true,
        intervals: [],
      };
    }

    return {
      isClosed: currentDay.isClosed,
      intervals: currentDay.intervals.map((interval) => ({ ...interval })),
    };
  }

  function applyScheduleToDays(sourceDay: number, targetDays: number[]) {
    setScheduleByDay((current) => {
      const sourceSchedule = current[sourceDay];

      if (!sourceSchedule) {
        return current;
      }

      const nextEntries = Object.fromEntries(
        Object.entries(current).map(([dayKey, value]) => {
          const dayIndex = Number(dayKey);

          if (!targetDays.includes(dayIndex)) {
            return [dayIndex, value];
          }

          return [dayIndex, cloneDaySchedule(sourceSchedule)];
        })
      ) as typeof current;

      return nextEntries;
    });
  }

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
              La app calcula automáticamente si el local está abierto según estos horarios y la zona horaria del negocio. Podés cargar uno o varios turnos por día.
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
                intervals: [],
              };
              const isClosed = daySchedule.isClosed;
              const visibleIntervals = isClosed
                ? []
                : daySchedule.intervals.length > 0
                  ? daySchedule.intervals
                  : [{ openTime: "", closeTime: "" }];

              return (
                <div
                  key={label}
                  className="grid gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-white p-4 xl:grid-cols-[140px_minmax(0,1fr)_120px]"
                >
                  <div className="flex items-center text-sm font-medium text-[var(--color-foreground)]">
                    <div>
                      <p>{label}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setScheduleByDay((current) => {
                              const sourceDay = current[day];

                              if (!sourceDay) {
                                return current;
                              }

                              const nextDay = (day + 1) % DAY_LABELS.length;

                              return {
                                ...current,
                                [nextDay]: {
                                  ...cloneDaySchedule(sourceDay),
                                },
                              };
                            })
                          }
                          className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                          Copiar al siguiente
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setScheduleByDay((current) =>
                              Object.fromEntries(
                                DAY_LABELS.map((_, currentDay) => [
                                  currentDay,
                                  currentDay === day
                                    ? cloneDaySchedule(current[day])
                                    : cloneDaySchedule(current[day]),
                                ])
                              ) as typeof current
                            )
                          }
                          className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                          Copiar a todos
                        </button>
                        <button
                          type="button"
                          onClick={() => applyScheduleToDays(day, WEEKDAY_DAY_INDEXES)}
                          className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                          Copiar Lun a Vie
                        </button>
                        <button
                          type="button"
                          onClick={() => applyScheduleToDays(day, WEEKEND_DAY_INDEXES)}
                          className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                        >
                          Copiar Sáb y Dom
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="hidden"
                      name={`hours_${day}_segments_count`}
                      value={visibleIntervals.length || 1}
                    />

                    {visibleIntervals.map((interval, segmentIndex) => (
                      <div
                        key={`${label}-${segmentIndex}`}
                        className="grid gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
                      >
                        <div className="grid gap-3 sm:grid-cols-2 md:contents">
                          <label
                            htmlFor={`hours-${day}-segment-${segmentIndex}-open`}
                            className="block"
                          >
                            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                              {segmentIndex === 0 ? "Abre" : `Turno ${segmentIndex + 1}`}
                            </span>
                            <input
                              id={`hours-${day}-segment-${segmentIndex}-open`}
                              name={`hours_${day}_segment_${segmentIndex}_open`}
                              type="time"
                              value={interval.openTime}
                              onChange={(event) =>
                                setScheduleByDay((current) => ({
                                  ...current,
                                  [day]: {
                                    ...current[day],
                                    intervals: (current[day]?.intervals ?? []).map(
                                      (currentInterval, currentIndex) =>
                                        currentIndex === segmentIndex
                                          ? {
                                              ...currentInterval,
                                              openTime: event.target.value,
                                            }
                                          : currentInterval
                                    ),
                                  },
                                }))
                              }
                              disabled={isClosed}
                              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none disabled:opacity-50"
                            />
                          </label>
                          <label
                            htmlFor={`hours-${day}-segment-${segmentIndex}-close`}
                            className="block"
                          >
                            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-muted)]">
                              Cierra
                            </span>
                            <input
                              id={`hours-${day}-segment-${segmentIndex}-close`}
                              name={`hours_${day}_segment_${segmentIndex}_close`}
                              type="time"
                              value={interval.closeTime}
                              onChange={(event) =>
                                setScheduleByDay((current) => ({
                                  ...current,
                                  [day]: {
                                    ...current[day],
                                    intervals: (current[day]?.intervals ?? []).map(
                                      (currentInterval, currentIndex) =>
                                        currentIndex === segmentIndex
                                          ? {
                                              ...currentInterval,
                                              closeTime: event.target.value,
                                            }
                                          : currentInterval
                                    ),
                                  },
                                }))
                              }
                              disabled={isClosed}
                              className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none disabled:opacity-50"
                            />
                          </label>
                        </div>
                        <div className="flex items-end sm:justify-end">
                          {visibleIntervals.length > 1 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setScheduleByDay((current) => ({
                                  ...current,
                                  [day]: {
                                    ...current[day],
                                    intervals: (current[day]?.intervals ?? []).filter(
                                      (_, currentIndex) => currentIndex !== segmentIndex
                                    ),
                                  },
                                }))
                              }
                              className="inline-flex h-12 w-12 items-center justify-center self-end rounded-full border border-[var(--color-border)] bg-white text-[var(--color-muted)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                              aria-label={`Eliminar turno ${segmentIndex + 1} de ${label}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}

                    {!isClosed ? (
                      <button
                        type="button"
                        onClick={() =>
                          setScheduleByDay((current) => ({
                            ...current,
                            [day]: {
                              ...current[day],
                              intervals:
                                (current[day]?.intervals ?? []).length >= 3
                                  ? current[day]!.intervals
                                  : [
                                      ...(current[day]?.intervals ?? []),
                                      { openTime: "", closeTime: "" },
                                    ],
                            },
                          }))
                        }
                        disabled={visibleIntervals.length >= 3}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar turno
                      </button>
                    ) : null}
                  </div>
                  <label className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-foreground)] xl:col-span-1">
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
                            intervals:
                              event.target.checked
                                ? current[day]?.intervals ?? []
                                : (current[day]?.intervals?.length ?? 0) > 0
                                  ? current[day]?.intervals ?? []
                                  : [{ openTime: "12:00", closeTime: "23:00" }],
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
