import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "qf8mjw77",
  api_key: process.env.CLOUDINARY_API_KEY || "272347897258898",
  api_secret: process.env.CLOUDINARY_API_SECRET || "psp_EOn8WSRULrJ_QnQLHhQUVZQ",
  secure: true,
});

/**
 * Uploads a landmark / parked vehicle photo to Cloudinary
 * @param {Buffer|string} fileSource - Buffer or base64 data URI
 * @param {string} sessionTicketId - Ticket identifier for tagging
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadLandmarkPhoto(fileSource, sessionTicketId = "parking") {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: "where_did_i_park/landmarks",
      public_id: `landmark_${sessionTicketId}_${Date.now()}`,
      resource_type: "image",
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    };

    if (Buffer.isBuffer(fileSource)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload stream error:", error);
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(fileSource);
    } else if (typeof fileSource === "string") {
      // Base64 or remote URL
      cloudinary.uploader.upload(fileSource, uploadOptions, (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      });
    } else {
      reject(new Error("Unsupported file source format for Cloudinary upload"));
    }
  });
}

/**
 * Uploads an incident evidence / damage photo to Cloudinary
 * @param {Buffer|string} fileSource - Buffer or base64 data URI
 * @param {string} referenceId - Reference identifier
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadEvidencePhoto(fileSource, referenceId = "incident") {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: "where_did_i_park/evidence",
      public_id: `evidence_${referenceId}_${Date.now()}`,
      resource_type: "image",
      transformation: [
        { width: 1600, height: 1600, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    };

    if (Buffer.isBuffer(fileSource)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("Cloudinary evidence upload stream error:", error);
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(fileSource);
    } else if (typeof fileSource === "string") {
      cloudinary.uploader.upload(fileSource, uploadOptions, (error, result) => {
        if (error) {
          console.error("Cloudinary evidence upload error:", error);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      });
    } else {
      reject(new Error("Unsupported file source format for Cloudinary upload"));
    }
  });
}

/**
 * Deletes a landmark photo from Cloudinary by publicId
 * @param {string} publicId
 * @returns {Promise<boolean>}
 */
export async function deleteLandmarkPhoto(publicId) {
  if (!publicId) return true;
  try {
    const res = await cloudinary.uploader.destroy(publicId);
    return res.result === "ok";
  } catch (err) {
    console.warn("Cloudinary delete error (non-fatal):", err);
    return false;
  }
}

export default cloudinary;
