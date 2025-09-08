import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Trip from "@/lib/models/trip";
import Vehicle from "@/lib/models/vehicle";
import Route from "@/lib/models/route";
import Requisition from "@/lib/models/requisition";

export async function GET() {
  try {
    // TODO: Add authentication back
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    await dbConnect();

    // Get current date for filtering
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );
    const endOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + 6)
    );

    // Get dashboard metrics
    const [
      totalVehicles,
      totalRoutes,
      activeTrips,
      pendingRequisitions,
      weeklyTrips,
      peakHoursData,
    ] = await Promise.all([
      Vehicle.countDocuments({ isActive: true }),
      Route.countDocuments(),
      Trip.countDocuments({ status: "ONGOING" }),
      Requisition.countDocuments({ status: "PENDING" }),
      Trip.find({
        date: { $gte: startOfWeek, $lte: endOfWeek },
      }).populate("schedule"),
      Trip.aggregate([
        {
          $match: {
            date: { $gte: startOfWeek, $lte: endOfWeek },
            status: { $in: ["COMPLETED", "ONGOING"] },
          },
        },
        {
          $group: {
            _id: { $hour: "$createdAt" },
            trips: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Process weekly trips data
    const weeklyTripsData = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
      const tripsForDay = weeklyTrips.filter(
        (trip) => trip.date.toDateString() === day.toDateString()
      ).length;

      return { day: dayName, trips: tripsForDay };
    });

    // Process peak hours data
    const processedPeakHours = Array.from({ length: 14 }, (_, i) => {
      const hour = i + 6; // Start from 6 AM
      const hourData = peakHoursData.find((data) => data._id === hour);
      const hourLabel = hour <= 12 ? `${hour} AM` : `${hour - 12} PM`;

      return {
        hour: hourLabel,
        trips: hourData ? hourData.trips : 0,
      };
    });

    return NextResponse.json({
      totalVehicles,
      totalRoutes,
      activeTrips,
      pendingRequisitions,
      weeklyTripsData,
      peakHoursData: processedPeakHours,
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
