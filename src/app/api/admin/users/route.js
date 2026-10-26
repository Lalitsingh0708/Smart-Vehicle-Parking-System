import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import ParkingSession from "@/models/ParkingSession";
import { authenticateApiRequest } from "@/lib/api-auth";

export async function GET() {
  const auth = await authenticateApiRequest("admin");
  if (!auth.authenticated) return auth.response;

  try {
    await connectDB();

    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();

    const userIds = users.map((u) => u._id);

    const [vehicleCounts, sessionCounts] = await Promise.all([
      Vehicle.aggregate([
        { $match: { ownerId: { $in: userIds } } },
        { $group: { _id: "$ownerId", count: { $sum: 1 } } },
      ]),
      ParkingSession.aggregate([
        { $match: { userId: { $in: userIds } } },
        {
          $group: {
            _id: { userId: "$userId", status: "$status" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const vMap = {};
    vehicleCounts.forEach((v) => {
      vMap[v._id.toString()] = v.count;
    });

    const sMap = {};
    sessionCounts.forEach((s) => {
      const uId = s._id.userId.toString();
      if (!sMap[uId]) sMap[uId] = { active: 0, completed: 0, total: 0 };
      sMap[uId].total += s.count;
      if (s._id.status === "active") sMap[uId].active += s.count;
      if (s._id.status === "completed") sMap[uId].completed += s.count;
    });

    const enrichedUsers = users.map((u) => {
      const uid = u._id.toString();
      return {
        ...u,
        vehicleCount: vMap[uid] || 0,
        sessions: sMap[uid] || { active: 0, completed: 0, total: 0 },
      };
    });

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error("Fetch admin users error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve user accounts" },
      { status: 500 }
    );
  }
}
