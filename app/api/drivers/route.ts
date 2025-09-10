import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcryptjs from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/lib/models/user";
import type { Session } from "next-auth";

export async function GET() {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get all users with DRIVER role
    const drivers = await User.find({ role: "DRIVER" })
      .select("-password -resetToken -resetTokenExpiry")
      .sort({ createdAt: -1 });

    return NextResponse.json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 12);

    // Create new driver
    const driver = new User({
      name,
      email,
      password: hashedPassword,
      role: "DRIVER",
    });

    await driver.save();

    // Return driver without password
    const driverResponse = {
      _id: driver._id,
      name: driver.name,
      email: driver.email,
      role: driver.role,
      createdAt: driver.createdAt,
      updatedAt: driver.updatedAt,
    };

    return NextResponse.json(driverResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating driver:", error);
    return NextResponse.json(
      { error: "Failed to create driver" },
      { status: 500 }
    );
  }
}
