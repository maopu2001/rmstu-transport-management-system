import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import bcryptjs from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/lib/models/user";
import type { Session } from "next-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password } = await request.json();
    const { id } = params;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user exists
    const driver = await User.findById(id);
    if (!driver || driver.role !== "DRIVER") {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // Check if email is already taken by another user
    if (email !== driver.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 400 }
        );
      }
    }

    // Update fields
    const updateData: any = { name, email };

    // Only update password if provided
    if (password && password.trim()) {
      updateData.password = await bcryptjs.hash(password, 12);
    }

    const updatedDriver = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password -resetToken -resetTokenExpiry");

    return NextResponse.json(updatedDriver);
  } catch (error) {
    console.error("Error updating driver:", error);
    return NextResponse.json(
      { error: "Failed to update driver" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await dbConnect();

    // Check if user exists and is a driver
    const driver = await User.findById(id);
    if (!driver || driver.role !== "DRIVER") {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // TODO: Check if driver is assigned to any vehicles before deletion
    // You might want to reassign vehicles or prevent deletion if driver is active

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: "Driver deleted successfully" });
  } catch (error) {
    console.error("Error deleting driver:", error);
    return NextResponse.json(
      { error: "Failed to delete driver" },
      { status: 500 }
    );
  }
}
