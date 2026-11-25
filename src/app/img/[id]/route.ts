import { getImage } from "@/lib/db";

/** Serves an image attached to an update. Ids are random and never reused, so cache forever. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const image = await getImage(id);
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(Buffer.from(image.data, "base64")), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
