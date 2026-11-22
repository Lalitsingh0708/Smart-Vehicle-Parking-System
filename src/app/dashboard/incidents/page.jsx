"use client";

import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Plus,
  ShieldCheck,
  Clock,
  CheckCircle,
  FileText,
  Camera,
  Image as ImageIcon,
  Upload,
  X,
  Trash2,
  CheckCircle2,
  Loader2,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";
import LiveCameraModal from "@/components/ui/LiveCameraModal";

export default function SecurityIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);

  // Form states
  const [category, setCategory] = useState("damage");
  const [description, setDescription] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [parkingLots, setParkingLots] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [selectedLotId, setSelectedLotId] = useState("");

  // Photographic Evidence Capture & Upload states
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const loadIncidents = () => {
    fetch("/api/incidents")
      .then((r) => r.json())
      .then((data) => setIncidents(data.incidents || []))
      .catch((err) => console.error("Error loading incidents:", err))
      .finally(() => setLoading(false));

    // Load user session to pre-attach parkingLotId if parked
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user?.activeSession) {
          setActiveSession(data.user.activeSession);
          if (data.user.activeSession.parkingLotId?._id) {
            setSelectedLotId(data.user.activeSession.parkingLotId._id);
          }
        }
      })
      .catch(() => {});

    // Load available parking lots for dropdown selection
    fetch("/api/parking-lots")
      .then((r) => r.json())
      .then((data) => setParkingLots(data.lots || []))
      .catch(() => {});
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleProcessFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large. Maximum allowed size is 10MB.");
      return;
    }

    setSelectedPhotoFile(file);
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    setUploadingPhoto(true);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload evidence photo.");
      }

      setEvidenceUrl(data.url);
      setUploadSuccess(true);
      toast.success("Evidence photo uploaded and secured.");
    } catch (err) {
      console.error("Evidence upload error:", err);
      toast.error(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhotoFile(null);
    setPhotoPreview("");
    setEvidenceUrl("");
    setUploadSuccess(false);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();

    if (uploadingPhoto) {
      toast.error("Please wait while your evidence photo finishes uploading.");
      return;
    }

    setSubmitting(true);

    try {
      const targetLotId = selectedLotId || activeSession?.parkingLotId?._id || activeSession?.parkingLotId || undefined;
      const targetSessionId = activeSession?._id || undefined;
      const targetVehicleId = activeSession?.vehicleId?._id || activeSession?.vehicleId || undefined;

      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description,
          evidenceUrl: evidenceUrl || undefined,
          parkingLotId: targetLotId,
          parkingSessionId: targetSessionId,
          vehicleId: targetVehicleId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report");

      toast.success("Incident report submitted. Administrators have been notified.");
      setShowReportForm(false);
      setDescription("");
      setEvidenceUrl("");
      handleRemovePhoto();
      loadIncidents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryNames = {
    theft: "Suspected Vehicle Theft",
    damage: "Vehicle Damage",
    unauthorized_parking: "Unauthorized Slot Occupancy",
    blocked_access: "Blocked Aisle or Access Bay",
    helmet_theft: "Helmet / Accessory Theft",
    other: "Other Parking Issue",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary tracking-tight">
            Security &amp; Incident Reports
          </h1>
          <p className="text-xs text-ink-secondary mt-0.5">
            Log security concerns, vehicle scratches, or unauthorized bay obstruction for facility review.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setShowReportForm(!showReportForm);
            if (showReportForm) handleRemovePhoto();
          }}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>{showReportForm ? "Cancel" : "Report an Incident"}</span>
        </Button>
      </div>

      {/* Operational Disclaimer Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-card text-xs text-amber-900 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Important Operational Notice:</span>
          <p className="text-amber-800 leading-relaxed">
            Submitting a report logs the incident in our database for administrator inspection and facility attendants. This system does not automatically detect theft or dispatch emergency police response. If you are experiencing an immediate crime in progress, please contact local emergency authorities (112) immediately.
          </p>
        </div>
      </div>

      {/* Report Form */}
      {showReportForm && (
        <div className="bg-white p-6 rounded-card border border-border-subtle shadow-sm space-y-4">
          <div className="border-b border-border-subtle pb-3">
            <h2 className="text-sm font-bold text-ink-primary">
              Submit Incident or Violation Report
            </h2>
            <p className="text-xs text-ink-secondary">
              Provide specific facts regarding the location, damage, or unauthorized vehicle.
            </p>
          </div>

          <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Incident Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary bg-white"
              >
                <option value="damage">Vehicle Damage (Scratches, Dent, Broken Mirror)</option>
                <option value="theft">Suspected Vehicle Theft</option>
                <option value="helmet_theft">Helmet or Accessory Theft</option>
                <option value="unauthorized_parking">Unauthorized Vehicle in Reserved Slot</option>
                <option value="blocked_access">Blocked Bay / Aisle Obstruction</option>
                <option value="other">Other Facility Issue</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Associated Parking Lot (Optional)
              </label>
              <select
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500 text-ink-primary bg-white"
              >
                <option value="">
                  {activeSession?.parkingLotId?.name
                    ? `Current Active: ${activeSession.parkingLotId.name}`
                    : "Campus Wide / General Parking Area"}
                </option>
                {parkingLots.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name} {l.city ? `(${l.city})` : ""}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-ink-muted block mt-0.5">
                Associating a specific parking facility helps booth attendants and administrators inspect the exact area.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-ink-primary mb-1">
                Description of Incident * (min 10 characters)
              </label>
              <textarea
                required
                rows={4}
                minLength={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what occurred, exact parking bay, slot number, or any vehicle details observed..."
                className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Photographic Evidence Attachment Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-ink-primary">
                  Photo Evidence (Upload, Camera, or Gallery)
                </label>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] text-[#176B5B] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>{showUrlInput ? "Use File Upload" : "Or Paste Image URL"}</span>
                </button>
              </div>

              {/* Hidden file inputs for Camera and Gallery */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleProcessFile(e.target.files?.[0])}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleProcessFile(e.target.files?.[0])}
                className="hidden"
              />

              {!showUrlInput ? (
                <div>
                  {photoPreview ? (
                    /* Image Selected & Preview Card */
                    <div className="border border-border-subtle rounded-xl p-3 bg-surface-subtle space-y-3">
                      <div className="relative rounded-lg overflow-hidden border border-border-subtle bg-black/5 max-h-64 flex items-center justify-center">
                        <img
                          src={photoPreview}
                          alt="Captured evidence preview"
                          className="w-full h-auto max-h-64 object-contain rounded-lg"
                        />
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-[#52FF00]" />
                            <span className="text-xs font-semibold">Uploading to secure cloud...</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2 text-xs">
                          {uploadSuccess ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Evidence Secured
                            </span>
                          ) : (
                            <span className="text-ink-secondary">
                              {selectedPhotoFile ? `${(selectedPhotoFile.size / (1024 * 1024)).toFixed(2)} MB` : "Ready"}
                            </span>
                          )}
                          {selectedPhotoFile?.name && (
                            <span className="text-ink-muted truncate max-w-[200px]" title={selectedPhotoFile.name}>
                              {selectedPhotoFile.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
                                setIsLiveCameraOpen(true);
                              } else {
                                galleryInputRef.current?.click();
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-border-subtle text-ink-primary hover:bg-white text-xs font-medium cursor-pointer transition-colors"
                          >
                            Replace
                          </button>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Initial Upload / Camera / Gallery Options */
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-4 sm:p-5 text-center transition-all ${
                        isDragging
                          ? "border-[#176B5B] bg-[#176B5B]/5"
                          : "border-border-subtle bg-surface-subtle/50 hover:border-[#176B5B]/40"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="flex items-center gap-2">
                          {/* Live Camera Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
                                setIsLiveCameraOpen(true);
                              } else {
                                cameraInputRef.current?.click();
                              }
                            }}
                            className="px-3.5 py-2 rounded-lg bg-[#176B5B] hover:bg-[#125448] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Open Camera</span>
                          </button>

                          {/* Gallery / Storage Button */}
                          <button
                            type="button"
                            onClick={() => galleryInputRef.current?.click()}
                            className="px-3.5 py-2 rounded-lg bg-white hover:bg-surface-subtle text-ink-primary font-bold text-xs border border-border-subtle flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
                          >
                            <ImageIcon className="w-4 h-4 text-[#176B5B]" />
                            <span>Choose from Gallery</span>
                          </button>
                        </div>

                        <div className="text-[11px] text-ink-muted">
                          Or drag and drop photo file here (JPG, PNG, WebP up to 10MB)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback Direct URL Input */
                <div className="space-y-1">
                  <input
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://example.com/photos/damage_evidence.jpg"
                    className="w-full px-3 py-2 border border-border-subtle rounded-button focus:ring-1 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-ink-muted block">
                    Paste a direct image link or cloud storage URL if you prefer.
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => {
                  setShowReportForm(false);
                  handleRemovePhoto();
                }}
              >
                Cancel
              </Button>
              <Button size="sm" type="submit" disabled={submitting || uploadingPhoto}>
                {submitting ? "Submitting Report..." : "Submit Incident Report"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Incidents Table */}
      {loading ? (
        <div className="p-8 text-center text-xs text-ink-secondary">
          Loading reports...
        </div>
      ) : incidents.length === 0 ? (
        <div className="bg-white p-8 rounded-card border border-border-subtle text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface-subtle text-ink-secondary flex items-center justify-center mx-auto">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-ink-primary">
            No incident reports filed
          </h2>
          <p className="text-xs text-ink-secondary max-w-sm mx-auto">
            You have not submitted any parking incidents. Any reports you file will be tracked with administrator resolution notes here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {incidents.map((inc) => (
            <div
              key={inc._id}
              className="bg-white p-5 rounded-card border border-border-subtle shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border-subtle pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-ink-primary text-sm">
                    {categoryNames[inc.category] || inc.category}
                  </span>
                  <span className="text-xs text-ink-muted">
                    Report #{inc._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-ink-secondary">
                    {new Date(inc.createdAt).toLocaleString("en-IN")}
                  </span>
                  <Badge status={inc.status} />
                </div>
              </div>

              <p className="text-xs text-ink-primary leading-relaxed whitespace-pre-wrap">
                {inc.description}
              </p>

              {inc.evidenceUrl && (
                <div className="p-3 bg-surface-subtle rounded-xl border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={inc.evidenceUrl}
                      alt="Incident evidence photographic reference"
                      className="w-14 h-14 object-cover rounded-lg border border-border-subtle bg-black/5 shrink-0"
                    />
                    <div>
                      <span className="text-xs font-bold text-ink-primary block">
                        Photographic Evidence Attached
                      </span>
                      <span className="text-[11px] text-ink-muted block">
                        Uploaded for administrator inspection
                      </span>
                    </div>
                  </div>
                  <a
                    href={inc.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border-subtle text-xs font-semibold text-[#176B5B] hover:bg-[#FAF7F2] transition-colors shadow-2xs self-start sm:self-auto"
                  >
                    <span>View Full Photo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Admin Resolution Section */}
              {inc.resolutionNotes ? (
                <div className="mt-2 p-3 bg-brand-50/70 border border-brand-200 rounded-lg text-xs space-y-1">
                  <span className="font-semibold text-brand-900 block flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-600" />
                    <span>Administrator Resolution Notes:</span>
                  </span>
                  <p className="text-brand-800 leading-relaxed">
                    {inc.resolutionNotes}
                  </p>
                </div>
              ) : (
                <div className="text-[11px] text-ink-muted italic pt-1">
                  Pending administrator review. Updates and resolution notes will be posted here.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Live Camera Viewfinder Modal */}
      <LiveCameraModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onCapture={(file) => handleProcessFile(file)}
      />
    </div>
  );
}
