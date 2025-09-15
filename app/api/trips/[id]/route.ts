import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Trip, Schedule, Route, Vehicle, Stop } from "@/lib/models";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tripId = (await params).id;
    const updates = await request.json();

    await dbConnect();

    // Find the trip
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Update the trip with provided fields
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        trip[key] = updates[key];
      }
    });

    await trip.save();

    return NextResponse.json({
      success: true,
      tripId: trip._id,
      status: trip.status,
      driverStatus: trip.driverStatus,
      startTime: trip.startTime?.toISOString(),
      endTime: trip.endTime?.toISOString(),
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    return NextResponse.json(
      { error: "Failed to update trip" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tripId = (await params).id;

    await dbConnect();

    const trip = await Trip.findById(tripId).populate({
      path: "schedule",
      populate: [
        {
          path: "route",
          populate: {
            path: "stops.stop",
            model: "Stop",
          },
        },
        {
          path: "vehicle",
          model: "Vehicle",
        },
      ],
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: trip._id,
      schedule: {
        _id: trip.schedule._id,
        route: {
          name: trip.schedule.route.name,
          stops: trip.schedule.route.stops,
        },
        departureTime: trip.schedule.departureTime,
      },
      vehicle: {
        _id: trip.schedule.vehicle._id,
        registrationNumber: trip.schedule.vehicle.registrationNumber,
        busName: trip.schedule.vehicle.busName,
      },
      date: trip.date.toISOString(),
      status: trip.status,
      driverStatus: trip.driverStatus || "ON_SCHEDULE",
      startTime: trip.startTime?.toISOString(),
      endTime: trip.endTime?.toISOString(),
      liveLocation: trip.liveLocation,
    });
  } catch (error) {
    console.error("Error fetching trip:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip" },
      { status: 500 }
    );
  }
}
