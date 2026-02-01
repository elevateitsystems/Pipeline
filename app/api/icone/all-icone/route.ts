import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get("userId");
    const search = searchParams.get("search"); 
    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    // Optional user existence check
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

    const icones = await prisma.icone.findMany({
      where: {
        userId,
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive", // 🔥 case-insensitive search
          },
        }),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        count: icones.length,
        data: icones,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get Icones Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
