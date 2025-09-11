import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Trip from "@/lib/models/trip";
import Schedule from "@/lib/models/schedule";
import Route from "@/lib/models/route";

export async function GET() {
  try {
    await dbConnect();

    // Get route performance data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const routePerformance = await Trip.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
          status: { $in: ["COMPLETED", "ONGOING"] },
        },
      },
      {
        $lookup: {
          from: "schedules",
          localField: "schedule",
          foreignField: "_id",
          as: "scheduleData",
        },
      },
      {
        $unwind: "$scheduleData",
      },
      {
        $lookup: {
          from: "routes",
          localField: "scheduleData.route",
          foreignField: "_id",
          as: "routeData",
        },
      },
      {
        $unwind: "$routeData",
      },
      {
        $group: {
          _id: "$routeData._id",
          routeName: { $first: "$routeData.name" },
          totalTrips: { $sum: 1 },
          completedTrips: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
          avgDelay: {
            $avg: {
              $cond: [
                { $and: ["$startTime", "$endTime"] },
                {
                  $divide: [
                    { $subtract: ["$endTime", "$startTime"] },
                    60000, // Convert to minutes
                  ],
                },
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          efficiency: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$completedTrips", "$totalTrips"] },
                  100,
                ],
              },
              1,
            ],
          },
        },
      },
      {
        $project: {
          route: "$routeName",
          trips: "$totalTrips",
          efficiency: 1,
          avgDelay: { $round: ["$avgDelay", 1] },
        },
      },
      {
        $sort: { trips: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    return NextResponse.json(routePerformance);
  } catch (error) {
    console.error("Error fetching route performance:", error);
    return NextResponse.json(
      { error: "Failed to fetch route performance" },
      { status: 500 }
    );
  }
}
