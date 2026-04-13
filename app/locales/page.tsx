import { AllBusinessesPage } from "@/components/public/all-businesses-page";
import { getHomePageData } from "@/lib/supabase/public";

export default async function LocalesPage() {
  const data = await getHomePageData();

  return <AllBusinessesPage data={data} />;
}
