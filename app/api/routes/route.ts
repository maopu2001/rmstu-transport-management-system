import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Route from "@/lib/models/route"
import Stop from "@/lib/models/stop"

export async function GET() {
  try {
    await dbConnect()
    const routes = await Route.find().populate("stops.stop", "name location")
    return NextResponse.json(routes)
  } catch (error) {
    console.error("Error fetching routes:", error)
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, stops } = await request.json()

    if (!name || !stops || stops.length === 0) {
      return NextResponse.json({ error: "Name and stops are required" }, { status: 400 })
    }

    await dbConnect()

    // Check if route with same name already exists
    const existingRoute = await Route.findOne({ name })
    if (existingRoute) {
      return NextResponse.json({ error: "Route with this name already exists" }, { status: 400 })
    }

    // Validate all stops exist
    const stopIds = stops.map((s: any) => s.stopId || s)
    const validStops = await Stop.find({ _id: { $in: stopIds } })
    if (validStops.length !== stopIds.length) {
      return NextResponse.json({ error: "One or more stops are invalid" }, { status: 400 })
    }

    // Create stops array with order
    const routeStops = stops.map((stop: any, index: number) => ({
      stop: stop.stopId || stop,
      order: index + 1,
    }))

    const route = await Route.create({
      name,
      stops: routeStops,
    })

    const populatedRoute = await Route.findById(route._id).populate("stops.stop", "name location")
    return NextResponse.json(populatedRoute, { status: 201 })
  } catch (error) {
    console.error("Error creating route:", error)
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 })
  }
}
