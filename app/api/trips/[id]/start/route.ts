import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Trip from "@/lib/models/trip";
import Schedule from "@/lib/models/schedule";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = params.id;

    await dbConnect();

    // Find today's scheduled trip for this vehicle
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find the schedule for this vehicle that runs today
    const dayOfWeek = today.getDay();
    const schedule = await Schedule.findOne({
      vehicle: vehicleId,
      daysOfWeek: dayOfWeek,
      isActive: true,
    }).populate("route");

    if (!schedule) {
      return NextResponse.json(
        { error: "No scheduled trip found for today" },
        { status: 404 }
      );
    }

    // Check if there's already an ongoing trip
    let trip = await Trip.findOne({
      schedule: schedule._id,
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ["PENDING", "ONGOING"] },
    });

    if (!trip) {
      // Create a new trip
      trip = new Trip({
        schedule: schedule._id,
        date: new Date(),
        status: "ONGOING",
        startTime: new Date(),
      });
    } else {
      // Update existing trip to ONGOING
      trip.status = "ONGOING";
      trip.startTime = new Date();
    }

    await trip.save();

    return NextResponse.json({
      success: true,
      tripId: trip._id,
      vehicleId,
      status: "ONGOING",
      startTime: trip.startTime.toISOString(),
      route: schedule.route.name,
    });
  } catch (error) {
    console.error("Error starting trip:", error);
    return NextResponse.json(
      { error: "Failed to start trip" },
      { status: 500 }
    );
  }
}
