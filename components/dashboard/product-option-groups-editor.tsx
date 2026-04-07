"use client";

import { useId, useState } from "react";

import type { ProductOptionFormGroup } from "@/lib/dashboard/products";

type ProductOptionGroupsEditorProps = {
  initialGroups: ProductOptionFormGroup[];
};

function createGroup(): ProductOptionFormGroup {
  return {
    id: `group-${crypto.randomUUID()}`,
    name: "",
    description: "",
    selectionType: "single",
    isRequired: false,
    minSelect: 0,
    maxSelect: 1,
    position: 0,
    items: [
      {
        id: `item-${crypto.randomUUID()}`,
        name: "",
        priceDeltaAmount: 0,
        isActive: true,
        position: 0,
      },
    ],
  };
}

export function ProductOptionGroupsEditor({
  initialGroups,
}: ProductOptionGroupsEditorProps) {
  const [groups, setGroups] = useState<ProductOptionFormGroup[]>(
    initialGroups.length > 0 ? initialGroups : []
  );
  const fieldId = useId();

  function updateGroups(nextGroups: ProductOptionFormGroup[]) {
    setGroups(
      nextGroups.map((group, index) => ({
        ...group,
        position: index,
        items: group.items.map((item, itemIndex) => ({
          ...item,
          position: itemIndex,
        })),
      }))
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
            Opciones del producto
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Agregá variantes como punto de cocción, extras, panes o aderezos. Cada
            grupo puede ser de selección simple o múltiple y cada opción puede tener
            precio extra.
          </p>
        </div>
        <button
          type="button"
          onClick={() => updateGroups([...groups, createGroup()])}
          className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Agregar grupo
        </button>
      </div>

      <input
        id={fieldId}
        type="hidden"
        name="optionGroups"
        value={JSON.stringify(groups)}
        readOnly
      />

      {groups.length === 0 ? (
        <p className="mt-5 text-sm text-[var(--color-muted)]">
          Este producto todavía no tiene opciones configurables.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {groups.map((group, groupIndex) => (
            <div
              key={group.id}
              className="rounded-[1.5rem] border border-[var(--color-border)] bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    Grupo {groupIndex + 1}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    updateGroups(groups.filter((candidate) => candidate.id !== group.id))
                  }
                  className="text-sm font-medium text-red-700 transition hover:text-red-800"
                >
                  Quitar grupo
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  value={group.name}
                  onChange={(event) =>
                    updateGroups(
                      groups.map((candidate) =>
                        candidate.id === group.id
                          ? { ...candidate, name: event.target.value }
                          : candidate
                      )
                    )
                  }
                  placeholder="Ej. Punto de cocción"
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
                />
                <input
                  value={group.description}
                  onChange={(event) =>
                    updateGroups(
                      groups.map((candidate) =>
                        candidate.id === group.id
                          ? { ...candidate, description: event.target.value }
                          : candidate
                      )
                    )
                  }
                  placeholder="Descripción opcional"
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <select
                  value={group.selectionType}
                  onChange={(event) =>
                    updateGroups(
                      groups.map((candidate) =>
                        candidate.id === group.id
                          ? {
                              ...candidate,
                              selectionType:
                                event.target.value === "multiple" ? "multiple" : "single",
                              maxSelect:
                                event.target.value === "multiple"
                                  ? candidate.maxSelect
                                  : 1,
                            }
                          : candidate
                      )
                    )
                  }
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
                >
                  <option value="single">Selección simple</option>
                  <option value="multiple">Selección múltiple</option>
                </select>
                <label className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-foreground)]">
                  <input
                    type="checkbox"
                    checked={group.isRequired}
                    onChange={(event) =>
                      updateGroups(
                        groups.map((candidate) =>
                          candidate.id === group.id
                            ? {
                                ...candidate,
                                isRequired: event.target.checked,
                                minSelect: event.target.checked
                                  ? Math.max(1, candidate.minSelect || 1)
                                  : 0,
                              }
                            : candidate
                        )
                      )
                    }
                  />
                  Obligatorio
                </label>
                <input
                  type="number"
                  min={0}
                  value={group.minSelect}
                  onChange={(event) =>
                    updateGroups(
                      groups.map((candidate) =>
                        candidate.id === group.id
                          ? {
                              ...candidate,
                              minSelect: Number(event.target.value || 0),
                            }
                          : candidate
                      )
                    )
                  }
                  placeholder="Mínimo"
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none"
                />
                <input
                  type="number"
                  min={group.selectionType === "single" ? 1 : 0}
                  value={group.maxSelect ?? ""}
                  onChange={(event) =>
                    updateGroups(
                      groups.map((candidate) =>
                        candidate.id === group.id
                          ? {
                              ...candidate,
                              maxSelect: event.target.value ? Number(event.target.value) : null,
                            }
                          : candidate
                      )
                    )
                  }
                  placeholder={group.selectionType === "single" ? "1" : "Sin máximo"}
                  disabled={group.selectionType === "single"}
                  className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm outline-none disabled:opacity-60"
                />
              </div>

              <div className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 md:grid-cols-[minmax(0,1fr)_140px_auto]"
                  >
                    <input
                      value={item.name}
                      onChange={(event) =>
                        updateGroups(
                          groups.map((candidate) =>
                            candidate.id === group.id
                              ? {
                                  ...candidate,
                                  items: candidate.items.map((candidateItem) =>
                                    candidateItem.id === item.id
                                      ? { ...candidateItem, name: event.target.value }
                                      : candidateItem
                                  ),
                                }
                              : candidate
                          )
                        )
                      }
                      placeholder="Ej. Cheddar extra"
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
                    />
                    <input
                      type="number"
                      min={0}
                      value={item.priceDeltaAmount}
                      onChange={(event) =>
                        updateGroups(
                          groups.map((candidate) =>
                            candidate.id === group.id
                              ? {
                                  ...candidate,
                                  items: candidate.items.map((candidateItem) =>
                                    candidateItem.id === item.id
                                      ? {
                                          ...candidateItem,
                                          priceDeltaAmount: Number(event.target.value || 0),
                                        }
                                      : candidateItem
                                  ),
                                }
                              : candidate
                          )
                        )
                      }
                      placeholder="0"
                      className="w-full rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateGroups(
                          groups.map((candidate) =>
                            candidate.id === group.id
                              ? {
                                  ...candidate,
                                  items:
                                    candidate.items.length > 1
                                      ? candidate.items.filter(
                                          (candidateItem) => candidateItem.id !== item.id
                                        )
                                      : candidate.items,
                                }
                              : candidate
                          )
                        )
                      }
                      className="inline-flex items-center justify-center rounded-full border border-red-200 px-4 py-3 text-sm font-medium text-red-700 transition hover:bg-red-50"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  updateGroups(
                    groups.map((candidate) =>
                      candidate.id === group.id
                        ? {
                            ...candidate,
                            items: [
                              ...candidate.items,
                              {
                                id: `item-${crypto.randomUUID()}`,
                                name: "",
                                priceDeltaAmount: 0,
                                isActive: true,
                                position: candidate.items.length,
                              },
                            ],
                          }
                        : candidate
                    )
                  )
                }
                className="mt-4 inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                Agregar opción
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
