import { authOptions } from "@/lib/auth";
import requisition from "@/lib/models/requisition";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;

  const ownRequisition = await requisition
    .find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(5);

  return NextResponse.json({
    message: "Notification fetched successfully",
    data: ownRequisition,
  });
}
