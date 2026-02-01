import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { CreateIconeSchema } from "@/validation/create-icone.validations";



export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = CreateIconeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, userId, iconUrl } = parsed.data;

    // Ensure user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const icone = await prisma.icone.create({
      data: {
        name,
        userId,
        iconUrl
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Icone created successfully",
        data: icone,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create Icone Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
