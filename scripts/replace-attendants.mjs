import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is required.");
  process.exit(1);
}

async function replaceAttendants() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  // 1. Delete the old demo attendants
  const deleteResult = await mongoose.connection.collection("users").deleteMany({
    email: { $in: ["attendant.hostel@gmail.com", "attendant.block34@gmail.com"] },
  });
  console.log("Deleted old dummy attendants count:", deleteResult.deletedCount);

  // 2. Fetch the target parking lots
  const hostelLot = await mongoose.connection.collection("parkinglots").findOne({
    name: /hostel/i,
  });
  const block34Lot = await mongoose.connection.collection("parkinglots").findOne({
    name: /34 block/i,
  });

  const passwordHash = await bcrypt.hash("Attendant@1234", 10);

  // 3. Insert or update the two new attendants
  const newAttendants = [
    {
      name: "Lalit Singh Baghel",
      email: "lalitsbaghel0708@gmail.com",
      passwordHash,
      role: "attendant",
      phoneNumber: "9876543212",
      assignedLotId: hostelLot?._id || null,
      isVerified: true,
      isApprovedByAdmin: true,
      attendantApprovalStatus: "approved",
      approvedAt: new Date(),
      approvalNotes: "Assigned to Hostel block parking booth operations.",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Shivani Sharma",
      email: "sshivanisharma0308@gmail.com",
      passwordHash,
      role: "attendant",
      phoneNumber: "9876543211",
      assignedLotId: block34Lot?._id || null,
      isVerified: true,
      isApprovedByAdmin: true,
      attendantApprovalStatus: "approved",
      approvedAt: new Date(),
      approvalNotes: "Morning shift: Central Academic Zone (34 Block).",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const att of newAttendants) {
    await mongoose.connection.collection("users").updateOne(
      { email: att.email },
      { $set: att },
      { upsert: true }
    );
    console.log(`Created/Updated attendant: ${att.email} (${att.name}) -> Lot: ${att.assignedLotId}`);
  }

  // 4. Print current attendants list
  const currentAttendants = await mongoose.connection
    .collection("users")
    .find({ role: "attendant" })
    .toArray();

  console.log("-----------------------------------------");
  console.log("Current attendants in database:");
  currentAttendants.forEach((a) => {
    console.log(`- ${a.name} (${a.email}) | Lot ID: ${a.assignedLotId} | Status: ${a.attendantApprovalStatus}`);
  });
  console.log("-----------------------------------------");

  await mongoose.disconnect();
  process.exit(0);
}

replaceAttendants().catch((err) => {
  console.error("Replacement error:", err);
  process.exit(1);
});
