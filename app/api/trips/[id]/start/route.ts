import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tripId = params.id

    // In a real implementation, this would update the trip status in the database
    console.log(`[v0] Starting trip ${tripId}`)

    return NextResponse.json({
      success: true,
      tripId,
      status: "ONGOING",
      startTime: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error starting trip:", error)
    return NextResponse.json({ error: "Failed to start trip" }, { status: 500 })
  }
}
