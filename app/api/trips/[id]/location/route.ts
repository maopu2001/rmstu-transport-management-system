import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Trip from "@/lib/models/trip";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication back
    // const session = await getServerSession(authOptions);
    // if (
    //   !session?.user ||
    //   (session.user.role !== "DRIVER" && session.user.role !== "ADMIN")
    // ) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { location, status } = await request.json();
    const vehicleId = (await params).id;

    if (
      !location ||
      !location.coordinates ||
      location.coordinates.length !== 2
    ) {
      return NextResponse.json(
        { error: "Invalid location data" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the active trip for this vehicle
    const activeTrip = await Trip.findOne({
      status: "ONGOING",
    }).populate({
      path: "schedule",
      populate: {
        path: "vehicle",
        match: { _id: vehicleId },
      },
    });

    if (!activeTrip || !activeTrip.schedule?.vehicle) {
      return NextResponse.json(
        { error: "No active trip found for this vehicle" },
        { status: 404 }
      );
    }

    // Update the trip with new location
    activeTrip.liveLocation = location;
    if (status) {
      activeTrip.driverStatus = status;
    }
    await activeTrip.save();

    return NextResponse.json({
      success: true,
      tripId: activeTrip._id,
      location: {
        lat: location.coordinates[1],
        lng: location.coordinates[0],
      },
      status: activeTrip.driverStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating trip location:", error);
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}
