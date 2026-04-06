import "server-only";

export type BusinessApplicationInput = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string | null;
  instagramOrWebsite: string | null;
  city: string | null;
  businessType: string | null;
  message: string | null;
};

function normalizeOptional(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : null;
}

export function parseBusinessApplicationForm(formData: FormData): BusinessApplicationInput {
  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = normalizeOptional(formData.get("phone"));
  const instagramOrWebsite = normalizeOptional(formData.get("instagramOrWebsite"));
  const city = normalizeOptional(formData.get("city"));
  const businessType = normalizeOptional(formData.get("businessType"));
  const message = normalizeOptional(formData.get("message"));

  if (!businessName) {
    throw new Error("El nombre del local es obligatorio.");
  }

  if (!contactName) {
    throw new Error("El nombre de contacto es obligatorio.");
  }

  if (!email) {
    throw new Error("El email es obligatorio.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Ingresá un email válido.");
  }

  if (phone && phone.length > 40) {
    throw new Error("El celular es demasiado largo.");
  }

  if (instagramOrWebsite && instagramOrWebsite.length > 160) {
    throw new Error("El Instagram o sitio web es demasiado largo.");
  }

  if (city && city.length > 120) {
    throw new Error("La ciudad es demasiado larga.");
  }

  if (businessType && businessType.length > 120) {
    throw new Error("El tipo de negocio es demasiado largo.");
  }

  if (message && message.length > 1200) {
    throw new Error("El mensaje es demasiado largo.");
  }

  return {
    businessName,
    contactName,
    email,
    phone,
    instagramOrWebsite,
    city,
    businessType,
    message,
  };
}
