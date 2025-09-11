import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Trip from "@/lib/models/trip";
import User from "@/lib/models/user";

export async function GET() {
  try {
    await dbConnect();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Driver performance analytics
    const driverPerformance = await Trip.aggregate([
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
          from: "vehicles",
          localField: "scheduleData.vehicle",
          foreignField: "_id",
          as: "vehicleData",
        },
      },
      {
        $unwind: "$vehicleData",
      },
      {
        $lookup: {
          from: "users",
          localField: "vehicleData.driver",
          foreignField: "_id",
          as: "driverData",
        },
      },
      {
        $unwind: "$driverData",
      },
      {
        $addFields: {
          isOnTime: {
            $cond: [{ $eq: ["$driverStatus", "ON_SCHEDULE"] }, 1, 0],
          },
          isDelayed: {
            $cond: [
              {
                $in: [
                  "$driverStatus",
                  ["DELAYED_TRAFFIC", "DELAYED_BREAKDOWN", "DELAYED_OTHER"],
                ],
              },
              1,
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$driverData._id",
          driverName: { $first: "$driverData.name" },
          totalTrips: { $sum: 1 },
          onTimeTrips: { $sum: "$isOnTime" },
          delayedTrips: { $sum: "$isDelayed" },
          completedTrips: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          onTimePercentage: {
            $round: [
              {
                $multiply: [{ $divide: ["$onTimeTrips", "$totalTrips"] }, 100],
              },
              1,
            ],
          },
          completionRate: {
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
          driver: "$driverName",
          totalTrips: 1,
          onTimePercentage: 1,
          completionRate: 1,
          performance: {
            $cond: [
              { $gte: ["$onTimePercentage", 90] },
              "excellent",
              {
                $cond: [
                  { $gte: ["$onTimePercentage", 80] },
                  "good",
                  {
                    $cond: [
                      { $gte: ["$onTimePercentage", 70] },
                      "average",
                      "needs_improvement",
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { onTimePercentage: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Delay analysis
    const delayAnalysis = await Trip.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo },
          driverStatus: {
            $in: ["DELAYED_TRAFFIC", "DELAYED_BREAKDOWN", "DELAYED_OTHER"],
          },
        },
      },
      {
        $group: {
          _id: "$driverStatus",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          reason: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", "DELAYED_TRAFFIC"] }, then: "Traffic" },
                {
                  case: { $eq: ["$_id", "DELAYED_BREAKDOWN"] },
                  then: "Breakdown",
                },
                { case: { $eq: ["$_id", "DELAYED_OTHER"] }, then: "Other" },
              ],
              default: "Unknown",
            },
          },
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return NextResponse.json({
      driverPerformance,
      delayAnalysis,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching driver analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver analytics" },
      { status: 500 }
    );
  }
}
