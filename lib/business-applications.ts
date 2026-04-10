import "server-only";

export type BusinessApplicationInput = {
  businessName: string;
  contactName: string;
  email: string;
  phone: string | null;
  instagramOrWebsite: string | null;
  city: string | null;
  pickupAddress: string;
  businessType: string | null;
  currentSalesChannels: string | null;
  estimatedOrderVolume: string | null;
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
  const pickupAddress = String(formData.get("pickupAddress") ?? "").trim();
  const businessType = normalizeOptional(formData.get("businessType"));
  const currentSalesChannels = normalizeOptional(formData.get("currentSalesChannels"));
  const estimatedOrderVolume = normalizeOptional(formData.get("estimatedOrderVolume"));
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

  if (!pickupAddress) {
    throw new Error("La dirección de retiro es obligatoria.");
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

  if (pickupAddress.length > 240) {
    throw new Error("La dirección de retiro es demasiado larga.");
  }

  if (currentSalesChannels && currentSalesChannels.length > 160) {
    throw new Error("El canal de venta actual es demasiado largo.");
  }

  if (estimatedOrderVolume && estimatedOrderVolume.length > 120) {
    throw new Error("El volumen estimado es demasiado largo.");
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
    pickupAddress,
    businessType,
    currentSalesChannels,
    estimatedOrderVolume,
    message,
  };
}
