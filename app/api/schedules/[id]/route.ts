import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Schedule from "@/lib/models/schedule"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { route, vehicle, departureTime, daysOfWeek } = await request.json()
    const scheduleId = params.id

    await dbConnect()

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { route, vehicle, departureTime, daysOfWeek },
      { new: true },
    )
      .populate("route", "name")
      .populate("vehicle", "registrationNumber type")

    if (!updatedSchedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSchedule)
  } catch (error) {
    console.error("Error updating schedule:", error)
    return NextResponse.json({ error: "Failed to update schedule" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const scheduleId = params.id

    await dbConnect()

    const deletedSchedule = await Schedule.findByIdAndDelete(scheduleId)
    if (!deletedSchedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Schedule deleted successfully" })
  } catch (error) {
    console.error("Error deleting schedule:", error)
    return NextResponse.json({ error: "Failed to delete schedule" }, { status: 500 })
  }
}
