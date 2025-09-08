import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Trip from "@/lib/models/trip"
import Vehicle from "@/lib/models/vehicle"
import User from "@/lib/models/user"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "week"

    await dbConnect()

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "quarter":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default: // week
        startDate = new Date(now.setDate(now.getDate() - now.getDay()))
    }

    // Get reports data
    const [punctualityData, tripHistoryData, userActivityData, recentTrips] = await Promise.all([
      // Vehicle punctuality
      Vehicle.aggregate([
        {
          $lookup: {
            from: "trips",
            localField: "_id",
            foreignField: "vehicle",
            as: "trips",
          },
        },
        {
          $project: {
            registrationNumber: 1,
            onTime: {
              $size: {
                $filter: {
                  input: "$trips",
                  cond: { $eq: ["$$this.punctuality", "ON_TIME"] },
                },
              },
            },
            delayed: {
              $size: {
                $filter: {
                  input: "$trips",
                  cond: { $ne: ["$$this.punctuality", "ON_TIME"] },
                },
              },
            },
          },
        },
      ]),

      // Trip history
      Trip.aggregate([
        {
          $match: {
            date: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            trips: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
            },
            cancelled: {
              $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // User activity
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),

      // Recent trips
      Trip.find({ date: { $gte: startDate } })
        .populate("schedule")
        .populate("vehicle", "registrationNumber")
        .sort({ createdAt: -1 })
        .limit(10),
    ])

    // Process user activity data
    const processedUserActivity = userActivityData.map((item) => ({
      name:
        item._id === "STUDENT"
          ? "Students"
          : item._id === "DRIVER"
            ? "Drivers"
            : item._id === "ADMIN"
              ? "Admins"
              : "Others",
      value: item.count,
      color:
        item._id === "STUDENT"
          ? "#3b82f6"
          : item._id === "DRIVER"
            ? "#10b981"
            : item._id === "ADMIN"
              ? "#f59e0b"
              : "#6b7280",
    }))

    return NextResponse.json({
      punctualityData,
      tripHistoryData,
      userActivityData: processedUserActivity,
      recentTrips,
    })
  } catch (error) {
    console.error("Error fetching reports:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
