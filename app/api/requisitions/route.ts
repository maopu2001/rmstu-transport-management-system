import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db"
import Requisition from "@/lib/models/requisition"
import { requisitionSchema } from "@/lib/validations/requisition"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    const requisitions = await Requisition.find().populate("user", "name email").sort({ createdAt: -1 })
    return NextResponse.json(requisitions)
  } catch (error) {
    console.error("Error fetching requisitions:", error)
    return NextResponse.json({ error: "Failed to fetch requisitions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request data
    const validatedData = requisitionSchema.parse(body)

    await dbConnect()

    // Create requisition in database
    const requisition = await Requisition.create({
      ...validatedData,
      status: "PENDING",
    })

    return NextResponse.json(
      {
        success: true,
        message: "Requisition submitted successfully",
        id: requisition._id,
        data: requisition,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error processing requisition:", error)
    return NextResponse.json({ error: "Failed to process requisition" }, { status: 400 })
  }
}
