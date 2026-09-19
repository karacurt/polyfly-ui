import { Dashboard } from "@/components/Dashboard";
import { getSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initial = await getSnapshot();
  return <Dashboard initial={initial} />;
}
