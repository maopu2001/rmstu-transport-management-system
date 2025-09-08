import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Requisition from "@/lib/models/requisition";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Re-enable authentication
    // const session = await getServerSession(authOptions)
    // if (!session || session.user.role !== "ADMIN") {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }

    const { status, adminNotes } = await request.json();
    const { id: requisitionId } = await params;

    if (!status || !["APPROVED", "DENIED"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const updatedRequisition = await Requisition.findByIdAndUpdate(
      requisitionId,
      {
        status,
        adminNotes,
        reviewedAt: new Date(),
        // TODO: Add reviewedBy when authentication is restored
        // reviewedBy: session.user.id,
      },
      { new: true }
    ).populate("user", "name email");

    if (!updatedRequisition) {
      return NextResponse.json(
        { error: "Requisition not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedRequisition);
  } catch (error) {
    console.error("Error updating requisition:", error);
    return NextResponse.json(
      { error: "Failed to update requisition" },
      { status: 500 }
    );
  }
}
