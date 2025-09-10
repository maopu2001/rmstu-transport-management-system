import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Vehicle from "@/lib/models/vehicle";
import User from "@/lib/models/user";
import { vehicleSchema } from "@/lib/validations/vehicle";
import type { Session } from "next-auth";

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const vehicles = await Vehicle.find().populate("driver", "name email");
    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body using zod schema
    const validationResult = vehicleSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { registrationNumber, busName, type, capacity, driver } =
      validationResult.data;

    await dbConnect();

    // Check if registration number already exists
    const existingVehicle = await Vehicle.findOne({ registrationNumber });
    if (existingVehicle) {
      return NextResponse.json(
        { error: "Vehicle with this registration number already exists" },
        { status: 400 }
      );
    }

    // Validate driver if provided
    let driverObjectId = null;
    if (driver) {
      const driverUser = await User.findOne({ _id: driver, role: "DRIVER" });
      if (!driverUser) {
        return NextResponse.json(
          { error: "Invalid driver selected" },
          { status: 400 }
        );
      }

      // Check if driver is already assigned to another vehicle
      const existingAssignment = await Vehicle.findOne({
        driver: driverUser._id,
        isActive: true,
      });
      if (existingAssignment) {
        return NextResponse.json(
          {
            error: `This driver is already assigned to vehicle ${existingAssignment.registrationNumber}`,
          },
          { status: 400 }
        );
      }

      driverObjectId = driverUser._id;
    }

    const vehicle = await Vehicle.create({
      registrationNumber,
      busName,
      type,
      capacity,
      driver: driverObjectId,
      status: "Active",
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id).populate(
      "driver",
      "name email"
    );
    return NextResponse.json(populatedVehicle, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "Failed to create vehicle" },
      { status: 500 }
    );
  }
}
