"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Upload,
  X,
  Trash2,
  Check,
  AlertCircle,
  Sparkles,
  MapPin,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function LandmarkPhotoModal({
  isOpen,
  onClose,
  session,
  onUpdated,
}) {
  const [note, setNote] = useState(session?.landmarkNote || "");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(session?.landmarkPhotoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !session) return null;

  const currentPhoto = previewUrl || session.landmarkPhotoUrl;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP)");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image size must be less than 8MB");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("note", note);
      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      const res = await fetch(`/api/parking-sessions/${session._id}/landmark`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update landmark data");
      }

      toast.success("Parking landmark note & photo saved successfully!");
      if (onUpdated) {
        onUpdated(data.session);
      }
      onClose();
    } catch (err) {
      console.error("Save landmark error:", err);
      toast.error(err.message || "Failed to save landmark details");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove the saved landmark note and photo for this session?"
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/parking-sessions/${session._id}/landmark`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove landmark data");
      }

      toast.success("Landmark details removed");
      setSelectedFile(null);
      setPreviewUrl("");
      setNote("");
      if (onUpdated) {
        onUpdated(data.session);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to delete landmark details");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E2D9CC] shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-[#FAF7F2] border-b border-[#EBE3D7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#176B5B] text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1C1815] tracking-tight">
                Parking Landmark &amp; Visual Anchor
              </h3>
              <p className="text-[11px] text-[#706254] font-medium">
                Save a photo and landmark note to easily find your two-wheeler later.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A6C5F] hover:text-[#1C1815] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
          
          {/* Photo Upload & Preview Box */}
          <div>
            <label className="block text-xs font-bold text-[#1C1815] mb-1.5">
              Vehicle Landmark Photo
            </label>

            {currentPhoto ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-[#176B5B]/30 bg-[#FAF7F2] group">
                <img
                  src={currentPhoto}
                  alt="Parked vehicle landmark photo"
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-[#1C1815] rounded-lg text-xs font-bold shadow-md hover:bg-[#FAF7F2] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#176B5B]" />
                    <span>Replace Photo</span>
                  </button>
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono tracking-wider flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-[#52FF00]" />
                  <span>LANDMARK PHOTO</span>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="w-full h-40 border-2 border-dashed border-[#D4AF37]/60 hover:border-[#176B5B] rounded-xl bg-[#FAF7F2] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-white border border-[#E2D9CC] flex items-center justify-center text-[#176B5B] group-hover:scale-105 transition-transform shadow-xs mb-2">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-[#1C1815]">
                  Tap to upload or take a photo of your parked bike
                </span>
                <span className="text-[11px] text-[#7A6C5F] mt-0.5">
                  Snap the nearby pillar, tree, staircase, or signboard (Max 8MB)
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Landmark Text Note Input */}
          <div>
            <label htmlFor="landmark-note" className="block text-xs font-bold text-[#1C1815] mb-1.5">
              Landmark Note / Surrounding Details
            </label>
            <div className="relative">
              <input
                id="landmark-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Pillar 4 ke paas, tree ke neeche, near Block 34 stairs"
                maxLength={140}
                className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7F2] border border-[#E2D9CC] rounded-xl text-[#1C1815] placeholder-[#988A7C] focus:outline-none focus:border-[#176B5B] focus:bg-white transition-colors"
              />
              <MapPin className="w-3.5 h-3.5 text-[#176B5B] absolute right-3 top-3 pointer-events-none" />
            </div>
            <div className="flex justify-between items-center text-[10.5px] text-[#7A6C5F] mt-1">
              <span>Short cue to jog your memory when walking back.</span>
              <span className="font-mono">{note.length}/140</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-t border-[#EBE3D7]">
            {session.landmarkPhotoUrl || session.landmarkNote ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || uploading}
                className="w-full sm:w-auto px-3 py-2 text-xs font-bold text-[#BA2D2D] hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? "Removing..." : "Remove Landmark"}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-[#E2D9CC] text-[#1C1815] text-xs font-bold hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={uploading || deleting}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#176B5B] hover:bg-[#125448] text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Save Landmark Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
