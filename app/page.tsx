import { HomeLanding } from "@/components/public/home-landing";
import { getHomePageData } from "@/lib/supabase/public";

export default async function Home() {
  const data = await getHomePageData();

  return <HomeLanding data={data} />;
}
