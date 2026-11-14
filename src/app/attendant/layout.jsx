import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ParkingLot from "@/models/ParkingLot";
import Navbar from "@/components/layout/Navbar";
import AttendantUnderReview from "@/components/attendant/AttendantUnderReview";

export const metadata = {
  title: "Attendant Booth | Where Did I Park?",
  description: "Parking attendant entrance & exit station for vehicle check-in and checkout.",
};

export default async function AttendantLayout({ children }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "attendant" && session.role !== "admin") {
    redirect("/dashboard");
  }

  // If role is attendant, verify live approval status from MongoDB
  let isApproved = true;
  let attendantUser = null;
  let lotName = null;

  if (session.role === "attendant") {
    await connectDB();
    attendantUser = await User.findById(session.userId).lean();

    if (!attendantUser || !attendantUser.isVerified) {
      redirect("/login?error=Email%20verification%20required.%20Please%20verify%20with%20OTP.");
    }

    isApproved =
      attendantUser.isApprovedByAdmin === true &&
      attendantUser.attendantApprovalStatus === "approved";

    if (attendantUser.assignedLotId) {
      const lot = await ParkingLot.findById(attendantUser.assignedLotId).select("name").lean();
      if (lot) lotName = lot.name;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
      {/* Universal Luxury Navbar */}
      <Navbar />

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {!isApproved ? (
          <AttendantUnderReview
            user={{
              name: attendantUser?.name || session.name,
              email: attendantUser?.email || session.email,
              phoneNumber: attendantUser?.phoneNumber || "",
              createdAt: attendantUser?.createdAt,
            }}
            initialLotName={lotName}
          />
        ) : (
          children
        )}
      </main>
    </div>
  );
}
