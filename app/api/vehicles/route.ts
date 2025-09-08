import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Vehicle from "@/lib/models/vehicle"
import User from "@/lib/models/user"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const vehicles = await Vehicle.find().populate("driver", "name email")
    return NextResponse.json(vehicles)
  } catch (error) {
    console.error("Error fetching vehicles:", error)
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { registrationNumber, type, capacity, driver } = await request.json()

    if (!registrationNumber || !type || !capacity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await dbConnect()

    // Check if registration number already exists
    const existingVehicle = await Vehicle.findOne({ registrationNumber })
    if (existingVehicle) {
      return NextResponse.json({ error: "Vehicle with this registration number already exists" }, { status: 400 })
    }

    // Validate driver if provided
    let driverObjectId = null
    if (driver) {
      const driverUser = await User.findOne({ _id: driver, role: "DRIVER" })
      if (!driverUser) {
        return NextResponse.json({ error: "Invalid driver selected" }, { status: 400 })
      }
      driverObjectId = driverUser._id
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      type,
      capacity: Number(capacity),
      driver: driverObjectId,
      status: "Active",
    })

    const populatedVehicle = await Vehicle.findById(vehicle._id).populate("driver", "name email")
    return NextResponse.json(populatedVehicle, { status: 201 })
  } catch (error) {
    console.error("Error creating vehicle:", error)
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 })
  }
}
