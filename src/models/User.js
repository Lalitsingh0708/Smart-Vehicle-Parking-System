import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "attendant", "admin"],
      default: "user",
      index: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: "",
    },
    assignedLotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingLot",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
