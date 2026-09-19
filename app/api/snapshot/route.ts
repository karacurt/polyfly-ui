import { getSnapshot } from "@/lib/snapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  const snapshot = await getSnapshot();
  return Response.json(snapshot, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
