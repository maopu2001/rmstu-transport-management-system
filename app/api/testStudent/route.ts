import dbConnect from "@/lib/db";
import { Student } from "@/lib/models";
import { type NextRequest, NextResponse } from "next/server";

type StudentData = {
  name: string;
  email: string;
  regId?: string;
};

export async function GET() {
  try {
    await dbConnect();
    const students = await Student.find().select("-_id name email regId");
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const processedData = data.map((item: StudentData) => {
      return { ...item, regId: item.email.split("@")[0] };
    });

    await dbConnect();
    let result = {};

    try {
      result = await Student.insertMany(processedData, { ordered: false });
    } catch (err: any) {
      if (err.code === 11000) console.log("Duplicate entries skipped");
      else throw err;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error adding test emails for Students:", error);
    return NextResponse.json(
      { error: "Failed to add test emails for Students" },
      { status: 400 }
    );
  }
}
