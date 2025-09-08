import { type NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db";
import Stop from "@/lib/models/stop";

export async function GET() {
  try {
    await dbConnect();
    const stops = await Stop.find().sort({ name: 1 });
    return NextResponse.json(stops);
  } catch (error) {
    console.error("Error fetching stops:", error);
    return NextResponse.json(
      { error: "Failed to fetch stops" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Re-enable authentication when NextAuth is fixed
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { name, coordinates, description } = await request.json();

    if (!name || !coordinates || coordinates.length !== 2) {
      return NextResponse.json(
        { error: "Name and valid coordinates are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if stop with same name already exists
    const existingStop = await Stop.findOne({ name });
    if (existingStop) {
      return NextResponse.json(
        { error: "Stop with this name already exists" },
        { status: 400 }
      );
    }

    const stop = await Stop.create({
      name,
      location: {
        type: "Point",
        coordinates: [coordinates[1], coordinates[0]], // MongoDB expects [lng, lat]
      },
      description,
    });

    return NextResponse.json(stop, { status: 201 });
  } catch (error) {
    console.error("Error creating stop:", error);
    return NextResponse.json(
      { error: "Failed to create stop" },
      { status: 500 }
    );
  }
}
