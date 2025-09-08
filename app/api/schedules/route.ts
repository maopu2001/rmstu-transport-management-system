import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Schedule from "@/lib/models/schedule"

export async function GET() {
  try {
    await dbConnect()
    const schedules = await Schedule.find()
      .populate("route", "name")
      .populate("vehicle", "registrationNumber type")
      .sort({ departureTime: 1 })
    return NextResponse.json(schedules)
  } catch (error) {
    console.error("Error fetching schedules:", error)
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { route, vehicle, departureTime, daysOfWeek } = await request.json()

    if (!route || !vehicle || !departureTime || !daysOfWeek) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    await dbConnect()

    const schedule = await Schedule.create({
      route,
      vehicle,
      departureTime,
      daysOfWeek,
    })

    const populatedSchedule = await Schedule.findById(schedule._id)
      .populate("route", "name")
      .populate("vehicle", "registrationNumber type")

    return NextResponse.json(populatedSchedule, { status: 201 })
  } catch (error) {
    console.error("Error creating schedule:", error)
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 })
  }
}
