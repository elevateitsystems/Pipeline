import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const resetRequest = await prisma.passwordReset.findFirst({
      where: {
        email,
        otp,
      },
    });

    if (!resetRequest) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date() > resetRequest.expiresAt) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "OTP verified. You can now reset your password." 
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
