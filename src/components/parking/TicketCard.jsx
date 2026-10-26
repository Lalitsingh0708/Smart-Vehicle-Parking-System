"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { MapPin, Calendar, Clock, Bike, ShieldCheck } from "lucide-react";
import Badge from "@/components/ui/Badge";

export default function TicketCard({ session }) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    if (!session?.entryTime) return;

    const calculateElapsed = () => {
      const start = new Date(session.entryTime).getTime();
      const end = session.exitTime ? new Date(session.exitTime).getTime() : Date.now();
      const diff = Math.max(0, Math.floor((end - start) / (1000 * 60)));
      setElapsedMinutes(diff);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 60000);
    return () => clearInterval(interval);
  }, [session]);

  if (!session) return null;

  const lot = session.parkingLotId || {};
  const slot = session.parkingSlotId || {};
  const vehicle = session.vehicleId || {};

  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;
  const billedHours = Math.max(1, Math.ceil(elapsedMinutes / 60));
  const estimatedFee = (lot.hourlyRate || 20) * billedHours;

  const qrData = JSON.stringify({
    ticketId: session.ticketId,
    slot: slot.slotNumber,
    vehicle: vehicle.registrationNumber,
    entryTime: session.entryTime,
    system: "Where Did I Park?",
  });

  return (
    <div className="bg-white rounded-card border border-border-subtle shadow-sm overflow-hidden max-w-md mx-auto">
      {/* Ticket Header */}
      <div className="bg-brand-500 text-white p-5 text-center relative">
        <div className="inline-flex items-center justify-center space-x-1.5 text-xs font-semibold bg-brand-600/80 px-2.5 py-0.5 rounded-md mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Official Parking Ticket</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">
          {lot.name || "Designated Parking Lot"}
        </h3>
        <p className="text-xs text-brand-100 mt-1 flex items-center justify-center space-x-1">
          <MapPin className="w-3 h-3" />
          <span>{lot.address || "Main Two-Wheeler Bay"}, {lot.city || "India"}</span>
        </p>
      </div>

      {/* Ticket Details & QR */}
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-border-subtle">
          <div>
            <span className="text-xs text-ink-secondary block">Ticket Identifier</span>
            <span className="font-mono text-sm font-bold text-ink-primary">
              {session.ticketId}
            </span>
          </div>
          <Badge status={session.status} />
        </div>

        {/* Slot highlight */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-surface-subtle/80 rounded-card border border-border-subtle text-center">
          <div>
            <span className="text-[11px] text-ink-secondary block uppercase tracking-wider">
              Assigned Zone
            </span>
            <span className="text-base font-bold text-ink-primary">
              {slot.zone || "Zone A"}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-ink-secondary block uppercase tracking-wider">
              Slot Number
            </span>
            <span className="text-xl font-black text-brand-500">
              {slot.slotNumber || "Slot #"}
            </span>
          </div>
        </div>

        {/* Vehicle and timing details */}
        <div className="space-y-2.5 text-sm">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="flex items-center space-x-1.5">
              <Bike className="w-4 h-4 text-ink-muted" />
              <span>Registered Vehicle</span>
            </span>
            <span className="font-semibold text-ink-primary">
              {vehicle.registrationNumber || "N/A"} ({vehicle.make || ""} {vehicle.model || ""})
            </span>
          </div>

          <div className="flex items-center justify-between text-ink-secondary">
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-ink-muted" />
              <span>Entry Timestamp</span>
            </span>
            <span className="font-medium text-ink-primary">
              {session.entryTime
                ? new Date(session.entryTime).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "short",
                  })
                : "Just now"}
            </span>
          </div>

          <div className="flex items-center justify-between text-ink-secondary">
            <span className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-ink-muted" />
              <span>Parking Duration</span>
            </span>
            <span className="font-semibold text-ink-primary">
              {hours > 0 ? `${hours}h ` : ""}{minutes}m
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border-subtle text-ink-secondary">
            <span>Rate &amp; Accrued Fee</span>
            <span className="font-bold text-brand-600 text-base">
              ₹{session.status === "completed" ? session.fee : estimatedFee}
              <span className="text-xs font-normal text-ink-secondary">
                {" "}(₹{lot.hourlyRate || 20}/hr)
              </span>
            </span>
          </div>
        </div>

        {/* Scannable QR Code */}
        <div className="flex flex-col items-center justify-center p-4 bg-white border border-border-subtle rounded-card space-y-2">
          <QRCodeSVG
            value={qrData}
            size={160}
            level="M"
            includeMargin={true}
            className="rounded"
          />
          <span className="text-[11px] text-ink-muted text-center max-w-[220px]">
            Attendant ticket verification barcode. Present upon facility exit.
          </span>
        </div>
      </div>
    </div>
  );
}
