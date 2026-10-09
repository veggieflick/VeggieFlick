import { handle, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Global in-memory catalog cache for serverless functions */
declare global {
  var __VF_SAVED_CATALOG__: any[] | undefined;
}

export async function POST(request: Request) {
  return handle(async () => {
    const body = await request.json();
    const products = Array.isArray(body?.products) ? body.products : [];

    if (products.length > 0) {
      globalThis.__VF_SAVED_CATALOG__ = products;
    }

    return ok({
      synced: true,
      count: products.length,
      timestamp: new Date().toISOString(),
    });
  });
}

export async function GET() {
  return handle(async () => {
    const cached = globalThis.__VF_SAVED_CATALOG__ ?? [];
    return ok(cached);
  });
}
