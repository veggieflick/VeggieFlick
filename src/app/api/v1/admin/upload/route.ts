import { NextResponse } from "next/server";
import { uploadProductImageFile } from "@/lib/storage";
import { getSession, BACK_OFFICE_ROLES } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !BACK_OFFICE_ROLES.includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized: Staff portal access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imageUrl = await uploadProductImageFile(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      url: imageUrl,
    });
  } catch (error) {
    console.error("Image upload API error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Upload failed" },
      { status: 500 }
    );
  }
}
