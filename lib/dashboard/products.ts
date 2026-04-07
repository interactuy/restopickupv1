import "server-only";

const imageMimeExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function slugifyProduct(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseMoneyInput(value: string, fieldLabel: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${fieldLabel} es obligatorio.`);
  }

  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`${fieldLabel} debe ser un entero sin separadores.`);
  }

  return Number.parseInt(trimmed, 10);
}

export function parseOptionalMoneyInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^\d+$/.test(trimmed)) {
    throw new Error("El precio anterior debe ser un entero sin separadores.");
  }

  return Number.parseInt(trimmed, 10);
}

export function parsePositionInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed || !/^-?\d+$/.test(trimmed)) {
    throw new Error("La posición debe ser un número entero.");
  }

  return Number.parseInt(trimmed, 10);
}

export function getImageExtension(fileType: string) {
  return imageMimeExtensions[fileType] ?? null;
}

export type ProductOptionFormGroup = {
  id: string;
  name: string;
  description: string;
  selectionType: "single" | "multiple";
  isRequired: boolean;
  minSelect: number;
  maxSelect: number | null;
  position: number;
  items: ProductOptionFormItem[];
};

export type ProductOptionFormItem = {
  id: string;
  name: string;
  priceDeltaAmount: number;
  isActive: boolean;
  position: number;
};

export function parseProductOptionsInput(value: string): ProductOptionFormGroup[] {
  if (!value.trim()) {
    return [];
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error("Las opciones del producto tienen un formato inválido.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Las opciones del producto tienen un formato inválido.");
  }

  return parsed.map((group, groupIndex) => {
    if (!group || typeof group !== "object") {
      throw new Error("Hay un grupo de opciones inválido.");
    }

    const candidateGroup = group as Record<string, unknown>;
    const name = String(candidateGroup.name ?? "").trim();
    const description = String(candidateGroup.description ?? "").trim();
    const selectionType =
      candidateGroup.selectionType === "multiple" ? "multiple" : "single";
    const isRequired = Boolean(candidateGroup.isRequired);
    const minSelect = Number(candidateGroup.minSelect ?? 0);
    const maxSelectRaw = candidateGroup.maxSelect;
    const maxSelect =
      maxSelectRaw === null || maxSelectRaw === "" || typeof maxSelectRaw === "undefined"
        ? null
        : Number(maxSelectRaw);
    const itemsRaw = Array.isArray(candidateGroup.items) ? candidateGroup.items : [];

    if (!name) {
      throw new Error("Cada grupo de opciones debe tener nombre.");
    }

    if (!Number.isInteger(minSelect) || minSelect < 0) {
      throw new Error(`El mínimo de selección no es válido en "${name}".`);
    }

    if (maxSelect !== null && (!Number.isInteger(maxSelect) || maxSelect < minSelect)) {
      throw new Error(`El máximo de selección no es válido en "${name}".`);
    }

    const items = itemsRaw.map((item, itemIndex) => {
      if (!item || typeof item !== "object") {
        throw new Error(`Hay una opción inválida en "${name}".`);
      }

      const candidateItem = item as Record<string, unknown>;
      const itemName = String(candidateItem.name ?? "").trim();
      const priceDeltaAmount = Number(candidateItem.priceDeltaAmount ?? 0);
      const isActiveItem =
        typeof candidateItem.isActive === "boolean" ? candidateItem.isActive : true;

      if (!itemName) {
        throw new Error(`Cada opción dentro de "${name}" debe tener nombre.`);
      }

      if (!Number.isInteger(priceDeltaAmount) || priceDeltaAmount < 0) {
        throw new Error(`El precio extra no es válido en "${itemName}".`);
      }

      return {
        id: String(candidateItem.id ?? `new-item-${groupIndex}-${itemIndex}`),
        name: itemName,
        priceDeltaAmount,
        isActive: isActiveItem,
        position: itemIndex,
      };
    });

    if (items.length === 0) {
      throw new Error(`El grupo "${name}" debe tener al menos una opción.`);
    }

    if (selectionType === "single" && (minSelect > 1 || (maxSelect !== null && maxSelect > 1))) {
      throw new Error(`"${name}" es de selección simple y solo admite una opción.`);
    }

    return {
      id: String(candidateGroup.id ?? `new-group-${groupIndex}`),
      name,
      description,
      selectionType,
      isRequired,
      minSelect: isRequired ? Math.max(1, minSelect || 1) : minSelect,
      maxSelect:
        selectionType === "single"
          ? 1
          : maxSelect,
      position: groupIndex,
      items,
    };
  });
}
