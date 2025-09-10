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

    // Find the ongoing or pending trip for this vehicle
    const trip = await Trip.findOne({
      status: { $in: ["PENDING", "ONGOING"] },
    }).populate({
      path: "schedule",
      populate: {
        path: "vehicle",
        match: { _id: vehicleId },
      },
    });

    if (!trip || !trip.schedule?.vehicle) {
      return NextResponse.json(
        { error: "No active trip found for this vehicle" },
        { status: 404 }
      );
    }

    // Cancel the trip
    trip.status = "CANCELLED";
    trip.endTime = new Date();
    await trip.save();

    return NextResponse.json({
      success: true,
      tripId: trip._id,
      vehicleId,
      status: "CANCELLED",
      endTime: trip.endTime.toISOString(),
    });
  } catch (error) {
    console.error("Error cancelling trip:", error);
    return NextResponse.json(
      { error: "Failed to cancel trip" },
      { status: 500 }
    );
  }
}
