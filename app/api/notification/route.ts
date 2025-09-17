import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import requisition from "@/lib/models/requisition";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;

  await dbConnect();
  const ownRequisition = await requisition
    .find({ user: userId })
    .sort({ updatedAt: -1 })
    .limit(5);

  return NextResponse.json({
    message: "Notification fetched successfully",
    data: ownRequisition,
  });
}
