export default function Badge({ status, text }) {
  const statusStyles = {
    available: "bg-status-availableBg text-status-available border-status-availableBorder",
    occupied: "bg-status-occupiedBg text-status-occupied border-status-occupiedBorder",
    reserved: "bg-status-reservedBg text-status-reserved border-status-reservedBorder",
    blocked: "bg-status-blockedBg text-status-blocked border-status-blockedBorder",
    open: "bg-blue-50 text-blue-700 border-blue-200",
    under_review: "bg-status-reservedBg text-status-reserved border-status-reservedBorder",
    resolved: "bg-status-availableBg text-status-available border-status-availableBorder",
    rejected: "bg-status-occupiedBg text-status-occupied border-status-occupiedBorder",
    active: "bg-status-availableBg text-status-available border-status-availableBorder",
    completed: "bg-gray-100 text-gray-700 border-gray-200",
    cancelled: "bg-status-occupiedBg text-status-occupied border-status-occupiedBorder",
  };

  const defaultStyle = "bg-gray-100 text-gray-700 border-gray-200";
  const appliedStyle = statusStyles[status?.toLowerCase()] || defaultStyle;

  const displayLabel =
    text ||
    {
      available: "Available",
      occupied: "Occupied",
      reserved: "Reserved",
      blocked: "Blocked",
      open: "Open",
      under_review: "Under Review",
      resolved: "Resolved",
      rejected: "Rejected",
      active: "Active",
      completed: "Completed",
      cancelled: "Cancelled",
    }[status?.toLowerCase()] ||
    status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${appliedStyle}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {displayLabel}
    </span>
  );
}
