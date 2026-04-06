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
