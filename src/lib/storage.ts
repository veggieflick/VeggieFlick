import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qteotyhogcsucfumsbxr.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || "dummy-anon-key-for-build"
);

/**
 * Upload product image file (from Desktop / Downloads) to Supabase Storage bucket 'product-images' or local storage.
 * Ensures 100% success fallback so any image chosen on desktop displays instantly.
 */
export async function uploadProductImageFile(
  buffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<string> {
  const ext = path.extname(originalFilename) || ".jpg";
  const cleanBaseName = path.basename(originalFilename, ext).toLowerCase().replace(/[^a-z0-9]/g, "-") || "product";
  const filename = `${cleanBaseName}-${Date.now()}${ext}`;
  const bucketName = "product-images";

  // 1. Attempt Supabase Storage upload if anon key is configured
  if (supabaseAnonKey && supabaseAnonKey !== "dummy-anon-key-for-build") {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filename, buffer, {
          contentType: contentType || "image/jpeg",
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filename);

        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn("Supabase Storage upload notice, falling back to public disk/data URL:", err);
    }
  }

  // 2. Save to local public/images/products directory
  try {
    const localDir = path.join(process.cwd(), "public", "images", "products");
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const filePath = path.join(localDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/images/products/${filename}`;
  } catch (err) {
    console.warn("Local disk write notice, converting to Data URL fallback:", err);
    // 3. Fallback to Data URL so desktop upload never fails
    const mime = contentType || "image/jpeg";
    return `data:${mime};base64,${buffer.toString("base64")}`;
  }
}
