import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { lat, lng, status } = await request.json()
    const tripId = params.id

    // In a real implementation, this would update the database
    // and broadcast to WebSocket clients
    console.log(`[v0] Updating location for trip ${tripId}:`, { lat, lng, status })

    // Mock response
    return NextResponse.json({
      success: true,
      tripId,
      location: { lat, lng },
      status,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error updating location:", error)
    return NextResponse.json({ error: "Failed to update location" }, { status: 500 })
  }
}
