import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Vehicle from "@/lib/models/vehicle"
import User from "@/lib/models/user"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { registrationNumber, type, capacity, driver, status } = await request.json()
    const vehicleId = params.id

    await dbConnect()

    // Check if vehicle exists
    const existingVehicle = await Vehicle.findById(vehicleId)
    if (!existingVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    // Check if registration number is unique (excluding current vehicle)
    if (registrationNumber !== existingVehicle.registrationNumber) {
      const duplicateVehicle = await Vehicle.findOne({ registrationNumber })
      if (duplicateVehicle) {
        return NextResponse.json({ error: "Vehicle with this registration number already exists" }, { status: 400 })
      }
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

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      {
        registrationNumber,
        type,
        capacity: Number(capacity),
        driver: driverObjectId,
        status: status || "Active",
      },
      { new: true },
    ).populate("driver", "name email")

    return NextResponse.json(updatedVehicle)
  } catch (error) {
    console.error("Error updating vehicle:", error)
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const vehicleId = params.id

    await dbConnect()

    const deletedVehicle = await Vehicle.findByIdAndDelete(vehicleId)
    if (!deletedVehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error) {
    console.error("Error deleting vehicle:", error)
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 })
  }
}
