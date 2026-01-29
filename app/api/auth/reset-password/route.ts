import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 1. Verify OTP again for security
    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        email,
        otp,
      },
    });

    if (!resetRequest) {
      return NextResponse.json({ error: "Invalid or expired session" }, { status: 400 });
    }

    if (new Date() > resetRequest.expiresAt) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    // 2. Hash new password
    const hashedPassCode = await bcrypt.hash(newPassword, 10);

    // 3. Update User
    await prisma.user.update({
      where: { email },
      data: {
        passCode: hashedPassCode,
      },
    });

    // 4. Clean up OTP record
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Password reset successful. You can now login with your new password." 
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
