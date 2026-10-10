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
 * Upload product image file to Supabase Storage bucket 'product-images'.
 * If Supabase storage is not configured/bucket missing, fall back to local public uploads.
 */
export async function uploadProductImageFile(
  buffer: Buffer,
  originalFilename: string,
  contentType: string
): Promise<string> {
  const ext = path.extname(originalFilename) || ".jpg";
  const cleanBaseName = path.basename(originalFilename, ext).toLowerCase().replace(/[^a-z0-9]/g, "-");
  const filename = `${cleanBaseName}-${Date.now()}${ext}`;
  const bucketName = "product-images";

  try {
    if (supabaseAnonKey) {
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
    }
  } catch (err) {
    console.warn("Supabase Storage upload warning, attempting local save fallback:", err);
  }

  // Fallback: Save to local public/images/products directory
  try {
    const localDir = path.join(process.cwd(), "public", "images", "products");
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const filePath = path.join(localDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/images/products/${filename}`;
  } catch (err) {
    console.error("Local file save error:", err);
    throw new Error("Failed to save image file.");
  }
}
