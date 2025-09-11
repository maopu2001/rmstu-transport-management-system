import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Trip from "@/lib/models/trip";
import Vehicle from "@/lib/models/vehicle";
import Route from "@/lib/models/route";
import Requisition from "@/lib/models/requisition";

export async function GET() {
  try {
    // TODO: Add authentication back
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    await dbConnect();

    // Get current date for filtering
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get dashboard metrics
    const [
      totalVehicles,
      totalRoutes,
      activeTrips,
      pendingRequisitions,
      weeklyTrips,
      peakHoursData,
      vehicleUtilization,
      routePerformance,
      monthlyTrends,
    ] = await Promise.all([
      Vehicle.countDocuments({ isActive: true }),
      Route.countDocuments({ isActive: true }),
      Trip.countDocuments({ status: "ONGOING" }),
      Requisition.countDocuments({ status: "PENDING" }),
      Trip.find({
        date: { $gte: startOfWeek, $lte: endOfWeek },
      }).populate("schedule"),

      // Peak hours aggregation
      Trip.aggregate([
        {
          $match: {
            date: { $gte: startOfWeek, $lte: endOfWeek },
            status: { $in: ["COMPLETED", "ONGOING"] },
          },
        },
        {
          $addFields: {
            startHour: {
              $hour: {
                $ifNull: ["$startTime", "$createdAt"],
              },
            },
          },
        },
        {
          $group: {
            _id: "$startHour",
            trips: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Vehicle utilization with accurate data
      Vehicle.aggregate([
        {
          $facet: {
            vehicleStats: [
              {
                $group: {
                  _id: null,
                  totalVehicles: { $sum: 1 },
                  activeVehicles: {
                    $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                  },
                  maintenanceVehicles: {
                    $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
                  },
                },
              },
            ],
            currentlyInUse: [
              {
                $lookup: {
                  from: "schedules",
                  localField: "_id",
                  foreignField: "vehicle",
                  as: "schedules",
                },
              },
              {
                $lookup: {
                  from: "trips",
                  let: { scheduleIds: "$schedules._id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [
                            { $in: ["$schedule", "$$scheduleIds"] },
                            { $eq: ["$status", "ONGOING"] },
                          ],
                        },
                      },
                    },
                  ],
                  as: "activeTrips",
                },
              },
              {
                $match: {
                  "activeTrips.0": { $exists: true },
                },
              },
              {
                $count: "inUseCount",
              },
            ],
          },
        },
      ]),

      // Enhanced route performance with delay analytics
      Trip.aggregate([
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
          $addFields: {
            actualDuration: {
              $cond: [
                { $and: ["$startTime", "$endTime"] },
                { $subtract: ["$endTime", "$startTime"] },
                null,
              ],
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
            _id: "$routeData._id",
            routeName: { $first: "$routeData.name" },
            totalTrips: { $sum: 1 },
            completedTrips: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
            },
            delayedTrips: { $sum: "$isDelayed" },
            avgDuration: {
              $avg: {
                $cond: [
                  { $ne: ["$actualDuration", null] },
                  { $divide: ["$actualDuration", 60000] }, // Convert to minutes
                  null,
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
                    {
                      $divide: [
                        { $subtract: ["$totalTrips", "$delayedTrips"] },
                        "$totalTrips",
                      ],
                    },
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
            avgDuration: { $round: ["$avgDuration", 1] },
            onTimeRate: {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: ["$totalTrips", "$delayedTrips"] },
                        "$totalTrips",
                      ],
                    },
                    100,
                  ],
                },
                1,
              ],
            },
          },
        },
        {
          $sort: { trips: -1 },
        },
        {
          $limit: 5,
        },
      ]),

      // Monthly trends based on actual data
      Trip.aggregate([
        {
          $match: {
            date: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
            },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
        {
          $project: {
            month: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                  { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                  { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
                  { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
                  { case: { $eq: ["$_id.month", 5] }, then: "May" },
                  { case: { $eq: ["$_id.month", 6] }, then: "Jun" },
                  { case: { $eq: ["$_id.month", 7] }, then: "Jul" },
                  { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                  { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
                  { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                  { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                  { case: { $eq: ["$_id.month", 12] }, then: "Dec" },
                ],
                default: "Unknown",
              },
            },
            completed: 1,
            cancelled: 1,
          },
        },
      ]),
    ]);

    // Process weekly trips data
    const weeklyTripsData = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dayName = day.toLocaleDateString("en-US", { weekday: "short" });
      const tripsForDay = weeklyTrips.filter((trip) => {
        const tripDate = new Date(trip.date);
        return tripDate.toDateString() === day.toDateString();
      }).length;

      return { day: dayName, trips: tripsForDay };
    });

    // Process peak hours data (6 AM to 8 PM)
    const processedPeakHours = Array.from({ length: 15 }, (_, i) => {
      const hour = i + 6; // Start from 6 AM
      const hourData = peakHoursData.find((data) => data._id === hour);
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? "AM" : "PM";
      const hourLabel =
        hour === 0 || hour === 12
          ? `${displayHour} ${ampm}`
          : `${displayHour} ${ampm}`;

      return {
        hour: hourLabel,
        trips: hourData ? hourData.trips : 0,
      };
    });

    // Process vehicle utilization
    const vehicleStats = vehicleUtilization[0]?.vehicleStats?.[0] || {
      totalVehicles: totalVehicles,
      activeVehicles: totalVehicles,
      maintenanceVehicles: 0,
    };

    const inUseCount =
      vehicleUtilization[0]?.currentlyInUse?.[0]?.inUseCount || 0;
    const availableVehicles = vehicleStats.activeVehicles - inUseCount;

    const vehicleUtilizationData = [
      {
        vehicle: "In Use",
        utilization: inUseCount,
        percentage: Math.round((inUseCount / vehicleStats.totalVehicles) * 100),
        status: "operational",
      },
      {
        vehicle: "Available",
        utilization: availableVehicles,
        percentage: Math.round(
          (availableVehicles / vehicleStats.totalVehicles) * 100
        ),
        status: "available",
      },
      {
        vehicle: "Maintenance",
        utilization: vehicleStats.maintenanceVehicles,
        percentage: Math.round(
          (vehicleStats.maintenanceVehicles / vehicleStats.totalVehicles) * 100
        ),
        status: "maintenance",
      },
    ];

    return NextResponse.json({
      totalVehicles,
      totalRoutes,
      activeTrips,
      pendingRequisitions,
      weeklyTripsData,
      peakHoursData: processedPeakHours,
      routePerformance: routePerformance.slice(0, 5), // Top 5 routes
      vehicleUtilization: vehicleUtilizationData,
      monthlyTrends,
      lastUpdated: new Date().toISOString(),
      systemHealth: {
        fleetAvailability: Math.round(
          (availableVehicles / totalVehicles) * 100
        ),
        routeCoverage: Math.round((activeTrips / totalRoutes) * 100),
        operationalStatus:
          pendingRequisitions <= 5
            ? "healthy"
            : pendingRequisitions <= 10
            ? "warning"
            : "critical",
        vehicleUtilization: Math.round((inUseCount / totalVehicles) * 100),
        avgTripsPerRoute:
          routePerformance.length > 0
            ? Math.round(
                routePerformance.reduce((sum, route) => sum + route.trips, 0) /
                  routePerformance.length
              )
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
