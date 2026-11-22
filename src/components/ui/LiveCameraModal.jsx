"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, X, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

export default function LiveCameraModal({ isOpen, onClose, onCapture }) {
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("environment"); // "environment" (rear) or "user" (front)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Check available camera devices
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Start or restart camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      return;
    }

    startCamera();

    return () => {
      stopCameraStream();
    };
  }, [isOpen, facingMode]);

  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async () => {
    setCameraError("");
    stopCameraStream();

    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported by your browser or environment.");
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.warn("Camera init error with ideal constraints, retrying with basic video:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setStream(fallbackStream);
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
        }
      } catch (fallbackErr) {
        console.error("Camera access failed:", fallbackErr);
        if (fallbackErr.name === "NotAllowedError" || fallbackErr.name === "PermissionDeniedError") {
          setCameraError("Camera permission was denied. Please allow camera access in your browser settings.");
        } else if (fallbackErr.name === "NotFoundError" || fallbackErr.name === "DevicesNotFoundError") {
          setCameraError("No camera hardware detected on this device.");
        } else {
          setCameraError("Unable to access camera: " + (fallbackErr.message || "Unknown error"));
        }
      }
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);

      // Convert canvas to image file blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const fileName = `incident_camera_${Date.now()}.jpg`;
            const file = new File([blob], fileName, { type: "image/jpeg" });

            stopCameraStream();
            setIsCapturing(false);
            onCapture(file);
            onClose();
          } else {
            setIsCapturing(false);
            setCameraError("Failed to process snapshot from video stream.");
          }
        },
        "image/jpeg",
        0.92
      );
    } else {
      setIsCapturing(false);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#18212F] text-white rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#121A26]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#176B5B] flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block text-white">Live Camera Viewfinder</span>
              <span className="text-[10px] text-gray-400 block">Align vehicle damage or incident within the frame</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative w-full aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-3 max-w-sm">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-rose-300 font-medium leading-relaxed">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Framing Guidelines */}
              <div className="absolute inset-6 border border-white/30 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-[#52FF00]" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-[#52FF00]" />
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-[#52FF00]" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-[#52FF00]" />
                </div>
              </div>

              {/* Camera Switch Toggle Button */}
              {hasMultipleCameras && (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
                  title="Switch Front / Rear Camera"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </>
          )}

          {/* Hidden Canvas for Snapshot Capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-[#121A26] border-t border-white/10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCapturePhoto}
            disabled={!stream || !!cameraError || isCapturing}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              !stream || !!cameraError || isCapturing
                ? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
                : "bg-[#176B5B] hover:bg-[#125448] text-white active:scale-95"
            }`}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#176B5B]" />
            </div>
            <span>{isCapturing ? "Processing..." : "Capture Photo"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
