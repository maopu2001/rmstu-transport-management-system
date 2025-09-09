import { type NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Requisition from "@/lib/models/requisition";
import User from "@/lib/models/user";
import { requisitionSchema } from "@/lib/validations/requisition";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    await dbConnect();
    const requisitions = await Requisition.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    return NextResponse.json(requisitions);
  } catch (error) {
    console.error("Error fetching requisitions:", error);
    return NextResponse.json(
      { error: "Failed to fetch requisitions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // For now, we'll create a temporary approach since authentication is commented out
    // In production, this should get the user from the session
    const body = await request.json();

    // Validate the request data
    const validatedData = requisitionSchema.parse(body);

    await dbConnect();

    const session = await getServerSession(authOptions);
    // if (!session?.user) {
    //   return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    // }

    // console.log("Session:", session);

    // For now, we'll either use a user ID from the request body or create a temporary user
    let userId = session.user.id;

    // if (!userId) {
    //   // Create or find a default user for demo purposes
    //   let defaultUser = await User.findOne({ email: "student@rmstu.edu.bd" });

    //   if (!defaultUser) {
    //     // Create a default student user for demo
    //     const hashedPassword = await bcrypt.hash("password123", 10);

    //     defaultUser = await User.create({
    //       name: "Demo Student",
    //       email: "student@rmstu.edu.bd",
    //       password: hashedPassword,
    //       role: "STUDENT",
    //     });
    //   }

    //   userId = defaultUser._id;
    // }

    // Create requisition in database
    const requisition = await Requisition.create({
      ...validatedData,
      user: userId,
      status: "PENDING",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Requisition submitted successfully",
        id: requisition._id,
        data: requisition,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing requisition:", error);

    // Handle specific validation errors
    if (error instanceof Error) {
      if (error.message.includes("validation failed")) {
        return NextResponse.json(
          { error: "Validation failed: " + error.message },
          { status: 400 }
        );
      }
      if (error.name === "ZodError") {
        return NextResponse.json(
          { error: "Invalid input data", details: error },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to process requisition" },
      { status: 500 }
    );
  }
}
