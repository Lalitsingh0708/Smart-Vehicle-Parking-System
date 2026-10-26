import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/where_did_i_park";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["user", "attendant", "admin"], default: "user" },
  phoneNumber: String,
  assignedLotId: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const VehicleSchema = new mongoose.Schema({
  ownerId: mongoose.Schema.Types.ObjectId,
  registrationNumber: String,
  vehicleType: String,
  make: String,
  model: String,
  color: String,
}, { timestamps: true });

const ParkingLotSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String,
  coordinates: {
    latitude: Number,
    longitude: Number,
  },
  description: String,
  openingHours: String,
  hourlyRate: Number,
  totalCapacity: Number,
  active: { type: Boolean, default: true },
}, { timestamps: true });

const ParkingSlotSchema = new mongoose.Schema({
  parkingLotId: mongoose.Schema.Types.ObjectId,
  zone: String,
  slotNumber: String,
  status: { type: String, enum: ["available", "occupied", "reserved", "blocked"], default: "available" },
  supportedVehicleTypes: [String],
}, { timestamps: true });

const ParkingSessionSchema = new mongoose.Schema({
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
}, { timestamps: true });

const SecurityIncidentSchema = new mongoose.Schema({
  reportedBy: mongoose.Schema.Types.ObjectId,
  parkingSessionId: mongoose.Schema.Types.ObjectId,
  vehicleId: mongoose.Schema.Types.ObjectId,
  parkingLotId: mongoose.Schema.Types.ObjectId,
  category: String,
  description: String,
  evidenceUrl: String,
  status: { type: String, default: "open" },
  resolutionNotes: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", VehicleSchema);
const ParkingLot = mongoose.models.ParkingLot || mongoose.model("ParkingLot", ParkingLotSchema);
const ParkingSlot = mongoose.models.ParkingSlot || mongoose.model("ParkingSlot", ParkingSlotSchema);
const ParkingSession = mongoose.models.ParkingSession || mongoose.model("ParkingSession", ParkingSessionSchema);
const SecurityIncident = mongoose.models.SecurityIncident || mongoose.model("SecurityIncident", SecurityIncidentSchema);

async function seed() {
  console.log("Connecting to MongoDB:", MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to database. Purging existing demo records...");

    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      ParkingLot.deleteMany({}),
      ParkingSlot.deleteMany({}),
      ParkingSession.deleteMany({}),
      SecurityIncident.deleteMany({}),
    ]);

    // 1. Create Users
    console.log("Creating seed users...");
    const adminPasswordHash = await bcrypt.hash("Admin@1234", 10);
    const riderPasswordHash = await bcrypt.hash("Rider@1234", 10);

    const admin = await User.create({
      name: "Facility Administrator",
      email: "admin@example.com",
      passwordHash: adminPasswordHash,
      role: "admin",
      phoneNumber: "9811223344",
    });

    const rider = await User.create({
      name: "Arjun Verma",
      email: "rider@example.com",
      passwordHash: riderPasswordHash,
      role: "user",
      phoneNumber: "9876543210",
    });

    // 2. Create Rider Vehicles
    console.log("Creating rider vehicles...");
    const vehicle1 = await Vehicle.create({
      ownerId: rider._id,
      registrationNumber: "DL01AB1234",
      vehicleType: "motorcycle",
      make: "Royal Enfield",
      model: "Classic 350",
      color: "Stealth Black",
    });

    const vehicle2 = await Vehicle.create({
      ownerId: rider._id,
      registrationNumber: "KA03HA5566",
      vehicleType: "scooter",
      make: "Honda",
      model: "Activa 6G",
      color: "Pearl White",
    });

    // 3. Create Sample Parking Lots in India
    console.log("Creating sample parking facilities across India...");
    const lotsData = [
      {
        name: "Connaught Place Two-Wheeler Bay 1",
        address: "Radial Road 2, Near Rajiv Chowk Metro Gate 4",
        city: "New Delhi",
        coordinates: { latitude: 28.6315, longitude: 77.2167 },
        description: "Central Delhi multi-bay motorcycle and scooter facility with dedicated guard surveillance.",
        openingHours: "06:00 - 23:30",
        hourlyRate: 20,
        totalCapacity: 20,
        active: true,
      },
      {
        name: "Koramangala 5th Block Two-Wheeler Hub",
        address: "17th Main Road, Near Jyoti Nivas College",
        city: "Bengaluru",
        coordinates: { latitude: 12.9352, longitude: 77.6245 },
        description: "Paved outdoor two-wheeler parking with EV charging points and clear zone markers.",
        openingHours: "07:00 - 23:00",
        hourlyRate: 25,
        totalCapacity: 20,
        active: true,
      },
      {
        name: "Bandra West Station Two-Wheeler Bay",
        address: "Station Road, Opposite Platform 1 West",
        city: "Mumbai",
        coordinates: { latitude: 19.0544, longitude: 72.8402 },
        description: "High-density commuter parking bay with automated check-in and QR ticket scanning.",
        openingHours: "05:30 - 00:30",
        hourlyRate: 30,
        totalCapacity: 20,
        active: true,
      },
      {
        name: "Shivaji Nagar Metro Parking",
        address: "Near JM Road, Shivajinagar",
        city: "Pune",
        coordinates: { latitude: 18.5314, longitude: 73.8446 },
        description: "Municipal two-wheeler parking facility with direct metro access.",
        openingHours: "06:00 - 23:00",
        hourlyRate: 15,
        totalCapacity: 20,
        active: true,
      },
    ];

    const lots = await ParkingLot.insertMany(lotsData);

    // Create Parking Attendant account assigned to Connaught Place Bay 1
    const attendantPasswordHash = await bcrypt.hash("Attendant@1234", 10);
    await User.create({
      name: "Ramesh Kumar (Booth Attendant)",
      email: "attendant@example.com",
      passwordHash: attendantPasswordHash,
      role: "attendant",
      phoneNumber: "9822334455",
      assignedLotId: lots[0]._id,
    });

    // 4. Create Slots for each lot
    console.log("Generating numbered parking slots across zones...");
    const allSlots = [];
    const zones = ["Zone A", "Zone B"];

    for (const lot of lots) {
      for (const zone of zones) {
        const prefix = zone.slice(-1);
        for (let i = 1; i <= 10; i++) {
          const slotNumber = `${prefix}-${String(i).padStart(2, "0")}`;
          // Set some realistic initial statuses
          let status = "available";
          if (i === 1 && zone === "Zone A") status = "occupied";
          if (i === 4 && zone === "Zone B") status = "reserved";
          if (i === 10 && zone === "Zone B") status = "blocked";

          allSlots.push({
            parkingLotId: lot._id,
            zone,
            slotNumber,
            status,
            supportedVehicleTypes: ["motorcycle", "scooter", "electric_scooter", "moped"],
          });
        }
      }
    }

    const insertedSlots = await ParkingSlot.insertMany(allSlots);

    // 5. Create an Active Session for the demo rider
    console.log("Creating demo active and completed parking sessions...");
    const occupiedSlot = insertedSlots.find(
      (s) => s.parkingLotId.equals(lots[0]._id) && s.status === "occupied"
    );

    const activeSession = await ParkingSession.create({
      userId: rider._id,
      vehicleId: vehicle1._id,
      parkingLotId: lots[0]._id,
      parkingSlotId: occupiedSlot._id,
      ticketId: `WDIP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-ACT1`,
      entryTime: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
      status: "active",
      fee: 0,
      paymentStatus: "pending",
    });

    // Completed session
    const pastSlot = insertedSlots.find(
      (s) => s.parkingLotId.equals(lots[1]._id) && s.slotNumber === "A-02"
    );

    await ParkingSession.create({
      userId: rider._id,
      vehicleId: vehicle2._id,
      parkingLotId: lots[1]._id,
      parkingSlotId: pastSlot._id,
      ticketId: `WDIP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-CMP1`,
      entryTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      exitTime: new Date(Date.now() - 3 * 60 * 60 * 1000),  // 3 hours ago (2 hrs duration)
      status: "completed",
      fee: 50, // 2 hrs * 25
      paymentStatus: "paid",
    });

    // 6. Create Sample Incident Report
    console.log("Creating sample security incident report...");
    await SecurityIncident.create({
      reportedBy: rider._id,
      parkingSessionId: activeSession._id,
      parkingLotId: lots[0]._id,
      vehicleId: vehicle1._id,
      category: "unauthorized_parking",
      description: "Another scooter was parked too close to slot A-01, partially obstructing vehicle mount.",
      status: "under_review",
      resolutionNotes: "Facility attendant instructed to inspect Aisle A and verify slot demarcations.",
    });

    console.log("Database seeded successfully!");
    console.log("-----------------------------------------");
    console.log("1. Rider Account:     rider@example.com     / Rider@1234      -> /dashboard");
    console.log("2. Attendant Account: attendant@example.com / Attendant@1234  -> /attendant");
    console.log("3. Admin Account:     admin@example.com     / Admin@1234      -> /admin");
    console.log("-----------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();
