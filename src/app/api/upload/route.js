import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { uploadEvidencePhoto } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") || formData.get("photo");

      if (!file || typeof file !== "object" || file.size === 0) {
        return NextResponse.json(
          { error: "No image file provided" },
          { status: 400 }
        );
      }

      const mimeType = file.type || "";
      if (!mimeType.startsWith("image/")) {
        return NextResponse.json(
          { error: "Invalid file type. Only JPG, PNG, and WebP images are allowed." },
          { status: 400 }
        );
      }

      // Max 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image file is too large. Maximum size is 10MB." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadEvidencePhoto(buffer, auth.session.userId);

      return NextResponse.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
      });
    }

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { imageBase64 } = body;

      if (!imageBase64 || typeof imageBase64 !== "string") {
        return NextResponse.json(
          { error: "No base64 image data provided" },
          { status: 400 }
        );
      }

      const result = await uploadEvidencePhoto(imageBase64, auth.session.userId);

      return NextResponse.json({
        success: true,
        url: result.url,
        publicId: result.publicId,
      });
    }

    return NextResponse.json(
      { error: "Unsupported Content-Type. Please use multipart/form-data or application/json." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Upload API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image. Please try again." },
      { status: 500 }
    );
  }
}
