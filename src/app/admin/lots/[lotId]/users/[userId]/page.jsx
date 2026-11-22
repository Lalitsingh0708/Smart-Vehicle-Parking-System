"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  ShieldCheck,
  Bike,
  Camera,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Maximize2,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLotUserDetailPage() {
  const params = useParams();
  const lotId = params?.lotId;
  const userId = params?.userId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [updatingIncidentId, setUpdatingIncidentId] = useState(null);

  const loadData = () => {
    if (!lotId || !userId) return;
    setLoading(true);
    fetch(`/api/admin/parking-lots/${lotId}/users/${userId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) throw new Error(res.error);
        setData(res);
      })
      .catch((err) => {
        console.error("Error loading user in lot:", err);
        toast.error(err.message || "Failed to load user details");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [lotId, userId]);

  const handleUpdateIncidentStatus = async (incidentId, newStatus) => {
    setUpdatingIncidentId(incidentId);
    try {
      const res = await fetch(`/api/incidents/${incidentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to update complaint");
      toast.success(`Complaint status marked as ${newStatus.replace("_", " ")}`);
      loadData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingIncidentId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="h-6 w-48 bg-white rounded-lg animate-pulse" />
        <div className="h-36 bg-white rounded-2xl border border-[#E2D9CC] animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-[#E2D9CC] animate-pulse" />
      </div>
    );
  }

  if (!data?.user || !data?.lot) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-[#E2D9CC] max-w-lg mx-auto space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="text-base font-black text-[#1C1815]">User or Parking Facility Not Found</h2>
        <p className="text-xs text-[#706254]">
          The requested user record does not exist or has not parked in this facility.
        </p>
        <Link href={`/admin/lots/${lotId}`}>
          <button
            type="button"
            className="px-4 py-2 bg-[#176B5B] text-white rounded-xl text-xs font-bold"
          >
            Back to Facility
          </button>
        </Link>
      </div>
    );
  }

  const { lot, user, sessions, landmarkPhotos, incidents, stats } = data;

  const categoryNames = {
    theft: "Vehicle Theft",
    damage: "Vehicle Damage",
    unauthorized_parking: "Unauthorized Slot Occupancy",
    blocked_access: "Blocked Aisle / Lane Obstruction",
    helmet_theft: "Helmet / Gear Theft",
    other: "Other Facility Issue",
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans pb-12">
      
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#706254]">
        <Link href="/admin/lots" className="hover:text-[#176B5B] transition-colors font-semibold">
          Parking Lots
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#A89A8A]" />
        <Link href={`/admin/lots/${lotId}`} className="hover:text-[#176B5B] transition-colors font-semibold">
          {lot.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#A89A8A]" />
        <span className="font-bold text-[#1C1815]">
          User: {user.name}
        </span>
      </div>

      {/* Top Header Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2D9CC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#176B5B] text-[#D4AF37] border-2 border-[#D4AF37]/50 flex items-center justify-center font-black text-xl shadow-sm shrink-0">
            {user.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#1C1815] tracking-tight">
                {user.name}
              </h1>
              <span className="text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#EAF5F2] text-[#176B5B] border border-[#176B5B]/30 font-bold">
                {user.role === "admin" ? "ADMIN" : user.role === "attendant" ? "ATTENDANT" : "VERIFIED RIDER"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#706254] mt-1.5 font-medium">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#176B5B]" />
                <span>{user.email}</span>
              </span>
              {user.phoneNumber && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#176B5B]" />
                  <span>+91 {user.phoneNumber}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#176B5B]" />
                <span>Facility: {lot.name} ({lot.city})</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl border border-[#E2D9CC] hover:bg-[#FAF7F2] text-[#706254] hover:text-[#1C1815] transition-colors cursor-pointer"
            title="Refresh user data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href={`/admin/lots/${lotId}`}>
            <button
              type="button"
              className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#EFE7D8] text-[#1C1815] border border-[#DFD1BD] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Facility Users</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 bg-white rounded-2xl border border-[#E2D9CC] shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#706254] font-bold block mb-1">
            PARKING SESSIONS
          </span>
          <span className="text-2xl font-black text-[#1C1815] block font-mono">
            {stats.totalSessions}
          </span>
          <span className="text-[11px] text-[#706254] block mt-0.5">
            In {lot.name}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2D9CC] shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#706254] font-bold block mb-1">
            ACTIVE OCCUPANCY
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#176B5B] font-mono">
              {stats.activeSessions}
            </span>
            {stats.activeSessions > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#176B5B] animate-ping" />
            )}
          </div>
          <span className="text-[11px] text-[#706254] block mt-0.5">
            {stats.activeSessions > 0 ? "Currently Occupying Bay" : "Checked Out"}
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#D4AF37]/50 bg-[#FAF8F5] shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#916E28] font-black block mb-1">
            UPLOADED PHOTOS
          </span>
          <span className="text-2xl font-black text-[#176B5B] block font-mono">
            {stats.totalPhotos}
          </span>
          <span className="text-[11px] text-[#706254] block mt-0.5">
            Verified Visual Cues
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E2D9CC] shadow-xs">
          <span className="text-[10px] font-mono uppercase text-[#706254] font-bold block mb-1">
            COMPLAINTS RAISED
          </span>
          <span className={`text-2xl font-black block font-mono ${stats.totalComplaints > 0 ? "text-[#BA2D2D]" : "text-[#1C1815]"}`}>
            {stats.totalComplaints}
          </span>
          <span className="text-[11px] text-[#706254] block mt-0.5">
            Security &amp; Bay Inquiries
          </span>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════
          1. UPLOADED LANDMARK PHOTOS GALLERY
      ═════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EBE3D7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#176B5B] text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#1C1815] tracking-tight">
                Uploaded Landmark Photos &amp; Visual Anchors ({landmarkPhotos.length})
              </h2>
              <p className="text-[11px] text-[#706254] font-medium">
                Photographic evidence and landmark notes submitted by {user.name} for sessions in {lot.name}.
              </p>
            </div>
          </div>
        </div>

        {landmarkPhotos.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF7F2] rounded-xl border border-dashed border-[#DFD1BD] space-y-2">
            <ImageIcon className="w-8 h-8 text-[#A89A8A] mx-auto" />
            <p className="text-xs font-bold text-[#1C1815]">
              No landmark photos uploaded by this user in this facility
            </p>
            <p className="text-[11px] text-[#706254] max-w-md mx-auto">
              When the rider saves a photo of their parked bike (e.g. near pillars, stairs, or signage), it will appear here in high resolution.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {landmarkPhotos.map((photo, index) => (
              <div
                key={photo.sessionId || index}
                className="bg-[#FAF7F2] rounded-xl border border-[#E2D9CC] overflow-hidden shadow-xs hover:border-[#176B5B] transition-colors group flex flex-col justify-between"
              >
                {/* Image Box */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPhoto(photo)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPhoto(photo);
                    }
                  }}
                  className="relative h-48 w-full bg-black/5 overflow-hidden cursor-pointer"
                  title="Click to zoom in"
                >
                  <img
                    src={photo.photoUrl}
                    alt={photo.note || "Landmark photo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold">
                    <Maximize2 className="w-4 h-4" />
                    <span>Zoom In</span>
                  </div>

                  {/* Slot Demarcation Badge */}
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/75 text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs">
                    <MapPin className="w-3 h-3 text-[#D4AF37]" />
                    <span>{photo.zone} &bull; Bay {photo.slotNumber}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      photo.status === "active"
                        ? "bg-[#52FF00] text-[#0A2603] border border-[#52FF00]"
                        : "bg-black/60 text-white"
                    }`}>
                      {photo.status === "active" ? "Active" : "Completed"}
                    </span>
                  </div>
                </div>

                {/* Caption / Note */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#706254] font-bold block mb-0.5">
                      Rider Landmark Cue
                    </span>
                    <p className="text-xs font-bold text-[#1C1815] leading-snug">
                      &ldquo;{photo.note}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#EBE3D7] flex items-center justify-between text-[10.5px] text-[#706254] font-mono">
                    <span>Ticket #{photo.ticketId}</span>
                    <span>
                      {new Date(photo.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════
          2. USER COMPLAINTS & INQUIRIES IN THIS FACILITY
      ═════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EBE3D7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#BA2D2D] text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#1C1815] tracking-tight">
                Review User Complaints &amp; Inquiries ({incidents.length})
              </h2>
              <p className="text-[11px] text-[#706254] font-medium">
                Complaints or incident reports filed by {user.name} concerning {lot.name}.
              </p>
            </div>
          </div>
          <Link
            href="/admin/incidents"
            className="text-xs font-bold text-[#176B5B] hover:text-[#125448] flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Global Complaints</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {incidents.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF7F2] rounded-xl border border-dashed border-[#DFD1BD] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-[#1C1815]">
              No complaints or security incidents filed by this user
            </p>
            <p className="text-[11px] text-[#706254]">
              Rider has an unblemished record with zero disputes or reported violations in {lot.name}.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc._id}
                className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E2D9CC] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#1C1815]">
                      {categoryNames[inc.category] || inc.category}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      inc.status === "open"
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : inc.status === "under_review"
                        ? "bg-blue-100 text-blue-900 border border-blue-300"
                        : inc.status === "resolved"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {inc.status?.replace("_", " ")}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-[#706254]">
                    Reported on{" "}
                    {new Date(inc.createdAt).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-xs text-[#1C1815] bg-white p-3 rounded-lg border border-[#EBE3D7] leading-relaxed">
                  {inc.description}
                </p>

                {/* Facility context tag if available */}
                {inc.parkingLotId && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#706254]">
                    <MapPin className="w-3 h-3 text-[#176B5B]" />
                    <span>Facility: <strong className="text-[#1C1815]">{inc.parkingLotId.name}</strong></span>
                  </div>
                )}

                {/* Evidence preview if uploaded */}
                {inc.evidenceUrl && (
                  <div className="p-3 bg-white rounded-lg border border-[#EBE3D7] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={inc.evidenceUrl}
                        alt="Incident photographic evidence thumbnail"
                        className="w-12 h-12 object-cover rounded-lg border border-[#E2D9CC] bg-black/5 shrink-0"
                      />
                      <div>
                        <span className="text-xs font-bold text-[#1C1815] block">
                          Attached Photographic Evidence
                        </span>
                        <span className="text-[11px] text-[#706254] block">
                          Uploaded by rider during report submission
                        </span>
                      </div>
                    </div>
                    <a
                      href={inc.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE7D8] text-[#176B5B] text-xs font-bold border border-[#E2D9CC] transition-colors shrink-0"
                    >
                      <span>Inspect Full Photo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Quick Status Updater */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EBE3D7] text-xs">
                  <span className="text-[#706254] font-medium">
                    Change Complaint Status:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {["open", "under_review", "resolved", "rejected"].map((st) => (
                      <button
                        key={st}
                        type="button"
                        disabled={inc.status === st || updatingIncidentId === inc._id}
                        onClick={() => handleUpdateIncidentStatus(inc._id, st)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold uppercase transition-colors cursor-pointer disabled:opacity-50 ${
                          inc.status === st
                            ? "bg-[#176B5B] text-white"
                            : "bg-white text-[#706254] border border-[#DFD1BD] hover:bg-[#FAF6EE]"
                        }`}
                      >
                        {st.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════
          3. PARKING SESSIONS HISTORY IN THIS FACILITY
      ═════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-[#E2D9CC] shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EBE3D7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#176B5B] text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#1C1815] tracking-tight">
                Parking Sessions in {lot.name} ({sessions.length})
              </h2>
              <p className="text-[11px] text-[#706254] font-medium">
                Detailed record of all slots allocated to {user.name} in this lot.
              </p>
            </div>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#706254]">
            No parking sessions found for this user in this facility.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] border-b border-[#E2D9CC] text-[#706254] uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="p-3 font-bold">Ticket ID</th>
                  <th className="p-3 font-bold">Slot &amp; Zone</th>
                  <th className="p-3 font-bold">Vehicle</th>
                  <th className="p-3 font-bold">Landmark Cue</th>
                  <th className="p-3 font-bold">Entry Time</th>
                  <th className="p-3 font-bold">Exit Time</th>
                  <th className="p-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE3D7]">
                {sessions.map((sess) => (
                  <tr key={sess._id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="p-3 font-mono font-bold text-[#1C1815]">
                      {sess.ticketId}
                    </td>
                    <td className="p-3 font-mono font-black text-[#176B5B]">
                      {sess.parkingSlotId?.zone || "A"} &bull; {sess.parkingSlotId?.slotNumber || "Bay"}
                    </td>
                    <td className="p-3 font-mono">
                      {sess.vehicleId?.registrationNumber || "Two-Wheeler"}
                    </td>
                    <td className="p-3">
                      {sess.landmarkPhotoUrl ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={sess.landmarkPhotoUrl}
                            alt="Landmark"
                            className="w-7 h-7 rounded object-cover border border-[#DFD1BD]"
                          />
                          <span className="text-[11px] font-medium truncate max-w-xs">
                            {sess.landmarkNote || "Photo saved"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#A89A8A] text-[11px] italic">None</span>
                      )}
                    </td>
                    <td className="p-3 text-[#706254]">
                      {new Date(sess.entryTime).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3 text-[#706254]">
                      {sess.exitTime
                        ? new Date(sess.exitTime).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        sess.status === "active"
                          ? "bg-[#52FF00]/20 text-[#0A2603] border border-[#52FF00]"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {sess.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lightbox / High-Res Photo Modal */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#121212] rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 bg-black/60 text-white border-b border-white/10">
              <div className="flex items-center gap-2 text-xs">
                <Camera className="w-4 h-4 text-[#D4AF37]" />
                <span className="font-bold">
                  {selectedPhoto.zone} &bull; Bay {selectedPhoto.slotNumber} &bull; Ticket #{selectedPhoto.ticketId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="px-2.5 py-1 text-xs text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black">
              <img
                src={selectedPhoto.photoUrl}
                alt="Enlarged landmark photo"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="p-3 bg-black/75 text-white text-xs border-t border-white/10 flex items-center justify-between">
              <span className="font-medium italic">
                &ldquo;{selectedPhoto.note}&rdquo;
              </span>
              <a
                href={selectedPhoto.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#D4AF37] hover:underline flex items-center gap-1 font-bold shrink-0 ml-4"
              >
                <span>View Full Size Image</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
