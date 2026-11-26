import { revalidatePath } from "next/cache";
import { resetDemo } from "@/lib/db";

/**
 * Optional nightly reset of a public demo (see vercel.json).
 * Off unless CRON_SECRET is set: Vercel Cron then sends it as a Bearer token.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const counts = await resetDemo();
  revalidatePath("/", "layout");
  return Response.json({ reset: true, counts });
}
