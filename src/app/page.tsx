import { HomeExperience } from "@/components/home/HomeExperience";
import { getHomePageData } from "@/lib/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomePageData();
  return <HomeExperience data={data} />;
}
