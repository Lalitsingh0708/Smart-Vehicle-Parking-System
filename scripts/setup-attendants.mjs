import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI not found");
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB Atlas.");

  await mongoose.connection.collection("parkinglots").updateMany({}, { $set: { allowCheckIn: true } });
  console.log("Enabled check-in for all lots.");

  const lots = await mongoose.connection.collection("parkinglots").find({}).toArray();
  const mainGateLot = lots.find((l) => l.name.toLowerCase().includes("main gate"));
  const block34Lot = lots.find((l) => l.name.toLowerCase().includes("34 block"));
  const hostelLot = lots.find((l) => l.name.toLowerCase().includes("hostel"));

  console.log("Parking Facilities Found:", {
    mainGate: { id: mainGateLot?._id.toString(), name: mainGateLot?.name },
    block34: { id: block34Lot?._id.toString(), name: block34Lot?.name },
    hostel: { id: hostelLot?._id.toString(), name: hostelLot?.name },
  });

  const pwdHash = await bcrypt.hash("Attendant@123", 10);

  // 1. Update existing Lalit Baghel attendant to represent Main Gate
  if (mainGateLot) {
    await mongoose.connection.collection("users").updateOne(
      { email: "lalitbaghel2508@gmail.com" },
      {
        $set: {
          name: "Lalit Baghel (Main Gate)",
          role: "attendant",
          assignedLotId: mainGateLot._id,
          isVerified: true,
          isApprovedByAdmin: true,
          attendantApprovalStatus: "approved",
          approvedAt: new Date(),
        },
      }
    );
    console.log("Updated Main Gate attendant: lalitbaghel2508@gmail.com ->", mainGateLot.name);
  }

  // 2. Create or update 34 Block Attendant
  if (block34Lot) {
    await mongoose.connection.collection("users").updateOne(
      { email: "attendant.block34@gmail.com" },
      {
        $set: {
          name: "Ramesh Kumar (34 Block)",
          passwordHash: pwdHash,
          role: "attendant",
          phoneNumber: "9876543211",
          assignedLotId: block34Lot._id,
          isVerified: true,
          isApprovedByAdmin: true,
          attendantApprovalStatus: "approved",
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log("Upserted 34 Block attendant: attendant.block34@gmail.com ->", block34Lot.name);
  }

  // 3. Create or update Hostel Block Attendant
  if (hostelLot) {
    await mongoose.connection.collection("users").updateOne(
      { email: "attendant.hostel@gmail.com" },
      {
        $set: {
          name: "Suresh Singh (Hostel Block)",
          passwordHash: pwdHash,
          role: "attendant",
          phoneNumber: "9876543212",
          assignedLotId: hostelLot._id,
          isVerified: true,
          isApprovedByAdmin: true,
          attendantApprovalStatus: "approved",
          approvedAt: new Date(),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    console.log("Upserted Hostel Block attendant: attendant.hostel@gmail.com ->", hostelLot.name);
  }

  const allAttendants = await mongoose.connection
    .collection("users")
    .find({ role: "attendant" })
    .toArray();

  console.log("\n--- CONFIGURED DEDICATED ATTENDANTS ---");
  for (const a of allAttendants) {
    const lot = lots.find((l) => l._id.toString() === a.assignedLotId?.toString());
    console.log({
      name: a.name,
      email: a.email,
      assignedFacility: lot ? lot.name : "Unassigned",
      status: a.attendantApprovalStatus,
    });
  }

  await mongoose.disconnect();
  console.log("Setup finished successfully.");
}

run().catch(console.error);
