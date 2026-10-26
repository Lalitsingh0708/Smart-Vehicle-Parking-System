import mongoose from "mongoose";

const ParkingSlotSchema = new mongoose.Schema(
  {
    parkingLotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingLot",
      required: true,
      index: true,
    },
    zone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slotNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "blocked"],
      default: "available",
      index: true,
    },
    supportedVehicleTypes: {
      type: [String],
      enum: ["motorcycle", "scooter", "electric_scooter", "moped"],
      default: ["motorcycle", "scooter", "electric_scooter", "moped"],
    },
  },
  {
    timestamps: true,
  }
);

ParkingSlotSchema.index({ parkingLotId: 1, slotNumber: 1 }, { unique: true });

export default mongoose.models.ParkingSlot || mongoose.model("ParkingSlot", ParkingSlotSchema);
