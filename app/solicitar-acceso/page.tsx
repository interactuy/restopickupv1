import { redirect } from "next/navigation";

type LegacyAccessRequestPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function LegacyAccessRequestPage({
  searchParams,
}: LegacyAccessRequestPageProps) {
  const query = await searchParams;
  const params = new URLSearchParams();

  if (query.error) {
    params.set("error", query.error);
  }

  if (query.success) {
    params.set("success", query.success);
  }

  redirect(`/registrar-local${params.toString() ? `?${params.toString()}` : ""}`);
}
