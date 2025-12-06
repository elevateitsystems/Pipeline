import prisma from "@/lib/db";
import { submitTestSchema } from "@/validation/test.validaton";
import { NextRequest, NextResponse } from "next/server";
import { invalidateCache } from "@/lib/cache";

export async function POST(request: NextRequest) : Promise<NextResponse>  {
  try {
    const body = await request.json();

    // Validate with Zod
    const parsed = submitTestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error },
        { status: 400 }
      );
    }

    const { presentationId, userId, answers } = parsed.data;

    // Get the presentation and find all users who need cache invalidation
    const presentation = await prisma.presentation.findUnique({
      where: { id: presentationId },
      select: { userId: true },
    });

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

    const test = await prisma.test.create({
      data: { userId, presentationId },
    });
    let totalScore = 0;
    const categoryScores: Record<string, number> = {};
    // 2. Process each answer
    for (const ans of answers) {
      const option = await prisma.option.findUnique({
        where: { id: ans.optionId },
        select: {
          points: true,
          question: { select: { categoryId: true } },
        },
      });

      if (!option) continue;

      const { points, question } = option;
      const categoryId = question.categoryId;

      totalScore += points;
      categoryScores[categoryId] = (categoryScores[categoryId] || 0) + points;

      await prisma.answer.create({
        data: {
          testId: test.id,
          questionId: ans.questionId,
          optionId: ans.optionId,
          points,
        },
      });
    }

    // 3. Store per-category scores
    const categoryScoreRecords = [];
    for (const [categoryId, score] of Object.entries(categoryScores)) {
      const cs = await prisma.categoryScore.create({
        data: {
          testId: test.id,
          categoryId,
          score,
        },
      });
      categoryScoreRecords.push(cs);
    }

    // 4. Update test total score
    await prisma.test.update({
      where: { id: test.id },
      data: { totalScore },
    });

    // Invalidate audit cache for the test taker, presentation owner, shared users, and invited users
    // This ensures all relevant users see updated scores
    const userIdsToInvalidate = new Set([userId]);
    if (presentation) {
      userIdsToInvalidate.add(presentation.userId);
    }
    sharedUserIds.forEach(id => userIdsToInvalidate.add(id));
    invitedUserIds.forEach(id => userIdsToInvalidate.add(id));
    
    // Invalidate all relevant caches in parallel
    await Promise.all(
      Array.from(userIdsToInvalidate).map(id => invalidateCache(`audit:${id}`))
    );

    // 5. Respond
    return NextResponse.json({
      success: true,
      message: "Test submitted successfully",
      data: {
        testId: test.id,
        totalScore,
        categoryScores: categoryScoreRecords,
      },
    },{
        status : 200
    });
  } catch (error) {
    console.error("[SUBMIT_TEST_ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error },
      { status: 500 }
    );
  }
}
