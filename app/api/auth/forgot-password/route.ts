import prisma from "@/lib/db";
import transport from "@/lib/nodemailer";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // For security, don't reveal if user exists or not
      // But usually in forgot password, telling them "if an account exists..." is common
      return NextResponse.json({ 
        success: true, 
        message: "If an account exists with this email, you will receive an OTP shortly." 
      });
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    // 3. Store OTP (Upsert: delete old ones for this email and create new)
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    await prisma.passwordReset.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // 4. Send Email
    const mailOptions = {
// @ts-expect-error - Transporter options might not have auth.user in some types
      from: transport.options.auth.user,
      to: email,
      subject: "Password Reset OTP - Pipeline Conversions",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #2b4055;">Password Reset Request</h2>
          <p>You requested to reset your password for your Pipeline Conversions account.</p>
          <p>Your 6-digit OTP is:</p>
          <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #f7af41; border-radius: 8px;">
            ${otp}
          </div>
          <p>This OTP is valid for <strong>2 minutes</strong>. If you did not request this, please ignore this email.</p>
          <br />
          <p>Best regards,<br />The Pipeline Conversions Team</p>
        </div>
      `,
    };

    await transport.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: "OTP sent successfully to your email." 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
