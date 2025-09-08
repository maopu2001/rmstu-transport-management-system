import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Trip from "@/lib/models/trip";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicleId = params.id;

    await dbConnect();

    // Find the ongoing trip for this vehicle
    const trip = await Trip.findOne({
      status: "ONGOING",
    }).populate({
      path: "schedule",
      populate: {
        path: "vehicle",
        match: { _id: vehicleId },
      },
    });

    if (!trip || !trip.schedule?.vehicle) {
      return NextResponse.json(
        { error: "No ongoing trip found for this vehicle" },
        { status: 404 }
      );
    }

    // End the trip
    trip.status = "COMPLETED";
    trip.endTime = new Date();
    await trip.save();

    return NextResponse.json({
      success: true,
      tripId: trip._id,
      vehicleId,
      status: "COMPLETED",
      endTime: trip.endTime.toISOString(),
    });
  } catch (error) {
    console.error("Error ending trip:", error);
    return NextResponse.json({ error: "Failed to end trip" }, { status: 500 });
  }
}
