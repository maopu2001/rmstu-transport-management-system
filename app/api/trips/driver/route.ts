import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Trip from "@/lib/models/trip";
import Schedule from "@/lib/models/schedule";

export async function GET(request: NextRequest) {
  try {
    // TODO: Re-enable authentication
    // const session = await getServerSession(authOptions)
    // if (!session?.user || session.user.role !== "DRIVER") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const queryDate = new Date(date);
    const dayOfWeek = queryDate.getDay();
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);

    // For now, we'll get all trips for the date since we don't have driver auth
    // In production, this should filter by the authenticated driver's vehicle

    // Find schedules that run on this day
    const schedulesForToday = await Schedule.find({
      daysOfWeek: dayOfWeek,
      isActive: true,
    })
      .populate({
        path: "route",
        populate: {
          path: "stops.stop",
          model: "Stop",
        },
      })
      .populate("vehicle");

    if (schedulesForToday.length === 0) {
      return NextResponse.json([]);
    }

    // Find or create trips for these schedules
    const trips = await Promise.all(
      schedulesForToday.map(async (schedule) => {
        let trip = await Trip.findOne({
          schedule: schedule._id,
          date: { $gte: startOfDay, $lte: endOfDay },
        });

        if (!trip) {
          // Create a new trip for today
          trip = new Trip({
            schedule: schedule._id,
            date: queryDate,
            status: "PENDING",
          });
          await trip.save();
        }

        return {
          _id: trip._id,
          schedule: {
            _id: schedule._id,
            route: {
              name: schedule.route.name,
              stops: schedule.route.stops,
            },
            departureTime: schedule.departureTime,
          },
          vehicle: {
            registrationNumber: schedule.vehicle.registrationNumber,
            busName: schedule.vehicle.busName,
          },
          date: trip.date.toISOString(),
          status: trip.status,
          driverStatus: trip.driverStatus || "ON_SCHEDULE",
          startTime: trip.startTime?.toISOString(),
          endTime: trip.endTime?.toISOString(),
        };
      })
    );

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Error fetching driver trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}
