import fs from "fs";
import path from "path";
import { handle, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/** Global in-memory catalog cache for serverless functions */
declare global {
  var __VF_SAVED_CATALOG__: any[] | undefined;
}

const getCacheFilePath = () => {
  try {
    const dir = path.join(process.cwd(), ".data");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, "saved_catalog.json");
  } catch {
    return null;
  }
};

export function getPersistedCatalog(): any[] {
  if (
    globalThis.__VF_SAVED_CATALOG__ &&
    Array.isArray(globalThis.__VF_SAVED_CATALOG__) &&
    globalThis.__VF_SAVED_CATALOG__.length > 0
  ) {
    return globalThis.__VF_SAVED_CATALOG__;
  }

  const filePath = getCacheFilePath();
  if (filePath && fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__VF_SAVED_CATALOG__ = parsed;
        return parsed;
      }
    } catch (e) {
      console.warn("Failed to read persisted catalog file:", e);
    }
  }

  return [];
}

export async function POST(request: Request) {
  return handle(async () => {
    const body = await request.json();
    const products = Array.isArray(body?.products) ? body.products : [];

    if (products.length > 0) {
      globalThis.__VF_SAVED_CATALOG__ = products;
      const filePath = getCacheFilePath();
      if (filePath) {
        try {
          fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf-8");
        } catch (e) {
          console.warn("Failed to write persisted catalog file:", e);
        }
      }
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
    const cached = getPersistedCatalog();
    return ok(cached);
  });
}
