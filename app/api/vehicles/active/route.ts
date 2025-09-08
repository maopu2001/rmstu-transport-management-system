import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Vehicle from "@/lib/models/vehicle";
import Trip from "@/lib/models/trip";
import { Types } from "mongoose";

export async function GET() {
  try {
    await dbConnect();

    // Get all active vehicles with their current trips
    const vehicles = await Vehicle.find({ isActive: true })
      .populate("driver", "name")
      .lean();

    // Get current active trips for these vehicles
    const activeTrips = await Trip.find({
      status: "ONGOING",
    })
      .populate({
        path: "schedule",
        populate: [
          { path: "vehicle", model: "Vehicle" },
          { path: "route", model: "Route" },
        ],
      })
      .lean();

    // Map vehicles to the expected format
    const busLocations = vehicles.map((vehicle) => {
      const vehicleId = (vehicle._id as Types.ObjectId).toString();
      const currentTrip = activeTrips.find(
        (trip) => (trip.schedule as any)?.vehicle?._id?.toString() === vehicleId
      );

      return {
        vehicleId,
        registrationNumber: vehicle.registrationNumber,
        busName: vehicle.busName,
        type: vehicle.type,
        location: currentTrip?.liveLocation
          ? {
              lat: currentTrip.liveLocation.coordinates[1],
              lng: currentTrip.liveLocation.coordinates[0],
            }
          : { lat: 22.6125, lng: 92.1647 }, // Default location if no active trip
        status: currentTrip?.status || "OFFLINE",
        routeName:
          (currentTrip?.schedule as any)?.route?.name || "No Active Route",
        lastUpdated: currentTrip?.updatedAt || vehicle.updatedAt,
      };
    });

    return NextResponse.json(busLocations);
  } catch (error) {
    console.error("Error fetching active vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch active vehicles" },
      { status: 500 }
    );
  }
}
