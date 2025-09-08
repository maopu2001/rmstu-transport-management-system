import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import User from "@/lib/models/user";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });

    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, we've sent you a password reset link.",
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to user
    await User.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry,
    });

    // In a real application, you would send an email here
    // For demo purposes, we'll log the reset link
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    try {
      await sendPasswordResetEmail(email, resetUrl);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Continue execution - don't fail the API call if email fails
    }

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, we've sent you a password reset link.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
