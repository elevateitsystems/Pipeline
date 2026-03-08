import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { invalidateCache } from "@/lib/cache";

const updateScoreSchema = z.object({
  presentationId: z.string(),
  totalScore: z.number(),
  categoryScores: z.array(z.object({
    categoryId: z.string(),
    score: z.number(),
  })),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = session.id;

    const body = await request.json();
    const parsed = updateScoreSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request data", error: parsed.error },
        { status: 400 }
      );
    }

    const { presentationId, totalScore, categoryScores } = parsed.data;

    // Get the presentation and find all users who need cache invalidation
    const presentation = await prisma.presentation.findUnique({
      where: { id: presentationId },
      select: { userId: true },
    });

    if (!presentation) {
      return NextResponse.json(
        { success: false, message: "Presentation not found" },
        { status: 404 }
      );
    }

    // Get all users who have shared access to this presentation
    const sharedAudits = await prisma.sharedAudit.findMany({
      where: { presentationId },
      select: { userId: true },
    });
    const sharedUserIds = sharedAudits.map(sa => sa.userId);

    // Get all users with accepted invitations for this presentation
    const acceptedInvitations = await prisma.invitation.findMany({
      where: {
        presentationId,
        status: 'ACCEPTED',
      },
      select: {
        email: true,
      },
    });
    
    // Get user IDs for users with accepted invitations
    const invitedUserEmails = acceptedInvitations.map(inv => inv.email);
    const invitedUsers = invitedUserEmails.length > 0
      ? await prisma.user.findMany({
          where: { email: { in: invitedUserEmails } },
          select: { id: true },
        })
      : [];
    const invitedUserIds = invitedUsers.map(u => u.id);

    // Find the latest test for this user and presentation
    const existingTest = await prisma.test.findFirst({
      where: {
        userId,
        presentationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let test;
    if (existingTest) {
      // Update existing test - also update createdAt to make it appear as the latest test
      test = await prisma.test.update({
        where: { id: existingTest.id },
        data: { 
          totalScore,
          createdAt: new Date(), // Update createdAt so this test appears as the latest
        },
      });

      // Delete existing category scores
      await prisma.categoryScore.deleteMany({
        where: { testId: test.id },
      });
    } else {
      // Create new test
      test = await prisma.test.create({
        data: {
          userId,
          presentationId,
          totalScore,
        },
      });
    }

    // Create/update category scores
    const categoryScoreRecords = [];
    for (const cs of categoryScores) {
      const categoryScore = await prisma.categoryScore.create({
        data: {
          testId: test.id,
          categoryId: cs.categoryId,
          score: cs.score,
        },
      });
      categoryScoreRecords.push(categoryScore);
    }

    // Invalidate audit cache for the test taker, presentation owner, shared users, and invited users
    // This ensures all relevant users see updated scores
    const userIdsToInvalidate = new Set([userId]);
    userIdsToInvalidate.add(presentation.userId);
    sharedUserIds.forEach(id => userIdsToInvalidate.add(id));
    invitedUserIds.forEach(id => userIdsToInvalidate.add(id));
    
    // Log for debugging
    console.log(`[UPDATE_TEST_SCORE] Invalidating caches for users:`, Array.from(userIdsToInvalidate));
    
    // Invalidate all relevant caches in parallel
    await Promise.all(
      Array.from(userIdsToInvalidate).map(id => invalidateCache(`audit:${id}`))
    );

    return NextResponse.json({
      success: true,
      message: "Test score updated successfully",
      data: {
        testId: test.id,
        totalScore: test.totalScore,
        categoryScores: categoryScoreRecords,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("[UPDATE_TEST_SCORE_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error },
      { status: 500 }
    );
  }
}

