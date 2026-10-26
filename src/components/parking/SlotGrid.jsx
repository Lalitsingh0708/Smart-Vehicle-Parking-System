"use client";

import { CheckCircle2, Lock, Ban, Clock } from "lucide-react";

export default function SlotGrid({
  zones = [],
  selectedSlotId = null,
  onSelectSlot,
  disabled = false,
}) {
  const statusConfig = {
    available: {
      bg: "bg-white hover:bg-emerald-50 border-emerald-300 text-emerald-800 cursor-pointer shadow-xs",
      selectedBg: "bg-brand-500 border-brand-600 text-white shadow-md ring-2 ring-brand-400 ring-offset-1",
      icon: CheckCircle2,
      label: "Available",
    },
    occupied: {
      bg: "bg-red-50/60 border-red-200 text-red-700 cursor-not-allowed opacity-75",
      selectedBg: "",
      icon: Lock,
      label: "Occupied",
    },
    reserved: {
      bg: "bg-amber-50/60 border-amber-200 text-amber-800 cursor-not-allowed opacity-75",
      selectedBg: "",
      icon: Clock,
      label: "Reserved",
    },
    blocked: {
      bg: "bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed opacity-70",
      selectedBg: "",
      icon: Ban,
      label: "Blocked",
    },
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-surface-subtle/80 rounded-card border border-border-subtle text-xs">
        <span className="font-semibold text-ink-primary">Slot Status Key:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
          <span className="text-ink-secondary">Available (Selectable)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-xs bg-red-500 inline-block" />
          <span className="text-ink-secondary">Occupied</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
          <span className="text-ink-secondary">Reserved</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded-xs bg-gray-400 inline-block" />
          <span className="text-ink-secondary">Blocked</span>
        </div>
      </div>

      {zones.length === 0 ? (
        <div className="text-center py-8 text-sm text-ink-secondary bg-white rounded-card border border-border-subtle">
          No parking zones or slots have been configured for this lot yet.
        </div>
      ) : (
        zones.map((zone) => (
          <div key={zone.name} className="bg-white p-4 rounded-card border border-border-subtle">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-ink-primary">{zone.name}</h4>
              <span className="text-xs text-ink-secondary">
                {zone.availableCount} of {zone.totalCount} slots available
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
              {zone.slots.map((slot) => {
                const isSelected = selectedSlotId === (slot.id || slot._id);
                const isAvailable = slot.status === "available";
                const config = statusConfig[slot.status] || statusConfig.available;
                const Icon = config.icon;

                const classes = isSelected
                  ? config.selectedBg
                  : config.bg;

                return (
                  <button
                    key={slot.id || slot._id}
                    type="button"
                    disabled={!isAvailable || disabled}
                    onClick={() => isAvailable && onSelectSlot && onSelectSlot(slot)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${classes}`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-xs font-bold">{slot.slotNumber}</span>
                    <span className="text-[10px] mt-0.5 tracking-tight uppercase">
                      {config.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
