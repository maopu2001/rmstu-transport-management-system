import { type NextRequest, NextResponse } from "next/server";
// import { getServerSession } from "next-auth"
// import { authOptions } from "@/lib/auth"
import dbConnect from "@/lib/db";
import Stop from "@/lib/models/stop";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Re-enable authentication when NextAuth is fixed
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const stopId = params.id;

    await dbConnect();

    const deletedStop = await Stop.findByIdAndDelete(stopId);
    if (!deletedStop) {
      return NextResponse.json({ error: "Stop not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Stop deleted successfully" });
  } catch (error) {
    console.error("Error deleting stop:", error);
    return NextResponse.json(
      { error: "Failed to delete stop" },
      { status: 500 }
    );
  }
}
