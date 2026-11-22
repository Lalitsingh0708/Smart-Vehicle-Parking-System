import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ParkingSession from "@/models/ParkingSession";
import { authenticateApiRequest } from "@/lib/api-auth";
import { uploadLandmarkPhoto, deleteLandmarkPhoto } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(request, context) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    const params = await context.params;
    const { id: sessionId } = params;

    await connectDB();

    const session = await ParkingSession.findById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Parking session not found" },
        { status: 404 }
      );
    }

    // Only session owner or admin/attendant can edit landmark notes
    const isOwner = session.userId.toString() === auth.session.userId;
    const isStaff = auth.session.role === "admin" || auth.session.role === "attendant";
    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify landmark data for this session" },
        { status: 403 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    let landmarkNote = session.landmarkNote || "";
    let newPhotoUrl = session.landmarkPhotoUrl || "";
    let newPhotoPublicId = session.landmarkPhotoPublicId || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const noteInput = formData.get("note");
      if (typeof noteInput === "string") {
        landmarkNote = noteInput.trim();
      }

      const file = formData.get("photo");
      if (file && typeof file === "object" && file.size > 0) {
        // Enforce file type
        const mimeType = file.type || "";
        if (!mimeType.startsWith("image/")) {
          return NextResponse.json(
            { error: "Invalid file type. Only JPG, PNG, and WebP images are allowed." },
            { status: 400 }
          );
        }

        // Limit size to 8MB
        if (file.size > 8 * 1024 * 1024) {
          return NextResponse.json(
            { error: "Image size exceeds 8MB limit" },
            { status: 400 }
          );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Delete old photo from Cloudinary if exists
        if (session.landmarkPhotoPublicId) {
          await deleteLandmarkPhoto(session.landmarkPhotoPublicId);
        }

        // Upload to Cloudinary
        const uploadResult = await uploadLandmarkPhoto(buffer, session.ticketId);
        newPhotoUrl = uploadResult.url;
        newPhotoPublicId = uploadResult.publicId;
      }
    } else {
      // JSON body
      const body = await request.json();
      if (typeof body.note === "string") {
        landmarkNote = body.note.trim();
      }

      if (body.photoBase64 && typeof body.photoBase64 === "string" && body.photoBase64.startsWith("data:image")) {
        // Delete old photo
        if (session.landmarkPhotoPublicId) {
          await deleteLandmarkPhoto(session.landmarkPhotoPublicId);
        }
        const uploadResult = await uploadLandmarkPhoto(body.photoBase64, session.ticketId);
        newPhotoUrl = uploadResult.url;
        newPhotoPublicId = uploadResult.publicId;
      }
    }

    session.landmarkNote = landmarkNote;
    session.landmarkPhotoUrl = newPhotoUrl;
    session.landmarkPhotoPublicId = newPhotoPublicId;
    await session.save();

    const populatedSession = await ParkingSession.findById(session._id)
      .populate("parkingLotId", "name address city coordinates")
      .populate("parkingSlotId", "zone slotNumber")
      .populate("vehicleId", "registrationNumber make model")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Parking landmark note and photo updated successfully",
      session: populatedSession,
    });
  } catch (error) {
    console.error("Update landmark error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save landmark note and photo" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  const auth = await authenticateApiRequest();
  if (!auth.authenticated) return auth.response;

  try {
    const params = await context.params;
    const { id: sessionId } = params;

    await connectDB();

    const session = await ParkingSession.findById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Parking session not found" },
        { status: 404 }
      );
    }

    const isOwner = session.userId.toString() === auth.session.userId;
    const isStaff = auth.session.role === "admin" || auth.session.role === "attendant";
    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: "Forbidden: You cannot modify landmark data for this session" },
        { status: 403 }
      );
    }

    if (session.landmarkPhotoPublicId) {
      await deleteLandmarkPhoto(session.landmarkPhotoPublicId);
    }

    session.landmarkNote = "";
    session.landmarkPhotoUrl = "";
    session.landmarkPhotoPublicId = "";
    await session.save();

    const populatedSession = await ParkingSession.findById(session._id)
      .populate("parkingLotId", "name address city coordinates")
      .populate("parkingSlotId", "zone slotNumber")
      .populate("vehicleId", "registrationNumber make model")
      .lean();

    return NextResponse.json({
      success: true,
      message: "Landmark photo and note removed",
      session: populatedSession,
    });
  } catch (error) {
    console.error("Delete landmark error:", error);
    return NextResponse.json(
      { error: "Failed to remove landmark data" },
      { status: 500 }
    );
  }
}
