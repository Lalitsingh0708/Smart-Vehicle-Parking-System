import mongoose from "mongoose";

const SecurityIncidentSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    parkingSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingSession",
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    parkingLotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingLot",
      index: true,
    },
    category: {
      type: String,
      enum: [
        "theft",
        "damage",
        "unauthorized_parking",
        "blocked_access",
        "helmet_theft",
        "other",
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    evidenceUrl: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["open", "under_review", "resolved", "rejected"],
      default: "open",
      index: true,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.SecurityIncident ||
  mongoose.model("SecurityIncident", SecurityIncidentSchema);
