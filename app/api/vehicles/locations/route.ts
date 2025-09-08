import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Vehicle from "@/lib/models/vehicle";
import Trip from "@/lib/models/trip";
import { Types } from "mongoose";

export async function GET() {
  try {
    await dbConnect();

    // Get all ongoing trips with their current locations
    const activeTrips = await Trip.find({ status: "ONGOING" })
      .populate({
        path: "schedule",
        populate: [
          { path: "vehicle", model: "Vehicle" },
          { path: "route", model: "Route" },
        ],
      })
      .lean();

    // Map to the expected format
    const locations = activeTrips
      .map((trip) => ({
        vehicleId: (trip.schedule as any)?.vehicle?._id?.toString(),
        registrationNumber: (trip.schedule as any)?.vehicle?.registrationNumber,
        busName: (trip.schedule as any)?.vehicle?.busName,
        type: (trip.schedule as any)?.vehicle?.type,
        location: trip.liveLocation
          ? {
              lat: trip.liveLocation.coordinates[1],
              lng: trip.liveLocation.coordinates[0],
            }
          : { lat: 22.6125, lng: 92.1647 },
        status: trip.status,
        routeName: (trip.schedule as any)?.route?.name || "Unknown Route",
        lastUpdated: trip.updatedAt,
      }))
      .filter((location) => location.vehicleId); // Filter out any invalid entries

    return NextResponse.json(locations);
  } catch (error) {
    console.error("Error fetching vehicle locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicle locations" },
      { status: 500 }
    );
  }
}
