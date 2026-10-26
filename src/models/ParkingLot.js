import mongoose from "mongoose";

const ParkingLotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    openingHours: {
      type: String,
      trim: true,
      default: "06:00 - 23:00",
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
      default: 20, // INR per hour
    },
    totalCapacity: {
      type: Number,
      required: true,
      min: 1,
      default: 20,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ParkingLot || mongoose.model("ParkingLot", ParkingLotSchema);
