import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dns from "node:dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://9761700a_db_user:Staynest123@ac-oqxxymx-shard-00-00.eu30h85.mongodb.net:27017,ac-oqxxymx-shard-00-01.eu30h85.mongodb.net:27017,ac-oqxxymx-shard-00-02.eu30h85.mongodb.net:27017/where_did_i_park?ssl=true&replicaSet=atlas-3njyvc-shard-0&authSource=admin&retryWrites=true&w=majority";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    passwordHash: String,
    role: { type: String, enum: ["user", "attendant", "admin"], default: "user" },
    phoneNumber: String,
    assignedLotId: mongoose.Schema.Types.ObjectId,
    isVerified: { type: Boolean, default: false },
    isApprovedByAdmin: { type: Boolean, default: false },
    attendantApprovalStatus: { type: String, default: "none" },
    approvedAt: Date,
    approvedBy: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

const VehicleSchema = new mongoose.Schema(
  {
    ownerId: mongoose.Schema.Types.ObjectId,
    registrationNumber: { type: String, unique: true },
    vehicleType: String,
    make: String,
    model: String,
    color: String,
  },
  { timestamps: true }
);

const ParkingLotSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    city: String,
    coordinates: { latitude: Number, longitude: Number },
    description: String,
    openingHours: String,
    hourlyRate: Number,
    totalCapacity: Number,
    allowCheckIn: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ParkingSlotSchema = new mongoose.Schema(
  {
    parkingLotId: mongoose.Schema.Types.ObjectId,
    zone: String,
    slotNumber: String,
    status: {
      type: String,
      enum: ["available", "occupied", "reserved", "blocked"],
      default: "available",
    },
    supportedVehicleTypes: [String],
  },
  { timestamps: true }
);

const ParkingSessionSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    vehicleId: mongoose.Schema.Types.ObjectId,
    parkingLotId: mongoose.Schema.Types.ObjectId,
    parkingSlotId: mongoose.Schema.Types.ObjectId,
    ticketId: { type: String, unique: true },
    entryTime: { type: Date, default: Date.now },
    exitTime: Date,
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
    fee: Number,
    paymentStatus: String,
  },
  { timestamps: true }
);

const SecurityIncidentSchema = new mongoose.Schema(
  {
    reportedBy: mongoose.Schema.Types.ObjectId,
    parkingSessionId: mongoose.Schema.Types.ObjectId,
    vehicleId: mongoose.Schema.Types.ObjectId,
    parkingLotId: mongoose.Schema.Types.ObjectId,
    category: String,
    description: String,
    evidenceUrl: String,
    status: { type: String, default: "open" },
    resolutionNotes: String,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);
const ParkingLot = mongoose.models.ParkingLot || mongoose.model("ParkingLot", ParkingLotSchema);
const ParkingSlot = mongoose.models.ParkingSlot || mongoose.model("ParkingSlot", ParkingSlotSchema);
const ParkingSession =
  mongoose.models.ParkingSession || mongoose.model("ParkingSession", ParkingSessionSchema);
const SecurityIncident =
  mongoose.models.SecurityIncident || mongoose.model("SecurityIncident", SecurityIncidentSchema);

async function seed() {
  console.log("Connecting to MongoDB:", MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to database. Purging existing records...");

    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      ParkingLot.deleteMany({}),
      ParkingSlot.deleteMany({}),
      ParkingSession.deleteMany({}),
      SecurityIncident.deleteMany({}),
    ]);

    // 1. Create Master Admin Account (Only Real Administrative Account)
    console.log("Creating sole master administrator account...");
    const adminPasswordHash = await bcrypt.hash("Admin@1234", 10);

    await User.create({
      name: "Lalit Baghel (Admin)",
      email: "lalitbaghel0708@gmail.com",
      passwordHash: adminPasswordHash,
      role: "admin",
      phoneNumber: "9811223344",
      isVerified: true,
      isApprovedByAdmin: true,
      attendantApprovalStatus: "none",
    });

    // 2. Create Parking Facilities (Lovely Professional University Campus)
    console.log("Creating Lovely Professional University (LPU) campus parking facilities...");
    const lotsData = [
      {
        name: "Main gate parking",
        address: "Near Main Gate 1, Jalandhar-Delhi G.T. Road, LPU Campus",
        city: "Phagwara (LPU Campus)",
        coordinates: { latitude: 31.2558, longitude: 75.7042 },
        description:
          "Primary entrance parking facility for students and visitors near Main Gate 1 and Uni-Mall.",
        openingHours: "06:00 - 23:00",
        hourlyRate: 10,
        totalCapacity: 20,
        allowCheckIn: true,
        active: true,
      },
      {
        name: "34 block parking",
        address: "Adjacent to Block 34 & Block 38, Central Academic Zone, LPU Campus",
        city: "Phagwara (LPU Campus)",
        coordinates: { latitude: 31.2536, longitude: 75.7018 },
        description:
          "Dedicated two-wheeler bay for students and faculty of Engineering and Computer Applications blocks.",
        openingHours: "07:00 - 22:30",
        hourlyRate: 10,
        totalCapacity: 20,
        allowCheckIn: true,
        active: true,
      },
      {
        name: "Hostel block parking",
        address: "Opposite Boys Hostel 4 & Indoor Sports Stadium, Sector 4, LPU Campus",
        city: "Phagwara (LPU Campus)",
        coordinates: { latitude: 31.2582, longitude: 75.7075 },
        description:
          "Resident parking facility adjacent to residential hostel complexes with 24/7 security booth access.",
        openingHours: "24 Hours (Round the Clock)",
        hourlyRate: 10,
        totalCapacity: 20,
        allowCheckIn: true,
        active: true,
      },
    ];

    const lots = await ParkingLot.insertMany(lotsData);

    // 3. Create Slots for each lot
    console.log("Generating numbered parking slots across zones...");
    const allSlots = [];
    const zones = ["Zone A", "Zone B"];

    for (const lot of lots) {
      for (const zone of zones) {
        const prefix = zone.slice(-1);
        for (let i = 1; i <= 10; i++) {
          const slotNumber = `${prefix}-${String(i).padStart(2, "0")}`;
          allSlots.push({
            parkingLotId: lot._id,
            zone,
            slotNumber,
            status: "available",
            supportedVehicleTypes: ["motorcycle", "scooter", "electric_scooter", "moped"],
          });
        }
      }
    }

    await ParkingSlot.insertMany(allSlots);

    console.log("Database seeded successfully with clean production configuration!");
    console.log("-----------------------------------------------------------------");
    console.log("1. Sole Master Admin: lalitbaghel0708@gmail.com / Admin@1234 -> /admin");
    console.log("2. Real Riders & Attendants: Register via /register with REAL emails to receive live OTPs.");
    console.log("3. Parking Facilities: 3 LPU Campus Lots (60 total available bays).");
    console.log("-----------------------------------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
