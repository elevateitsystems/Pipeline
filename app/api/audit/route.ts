import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { AuditCreateSchema } from "@/validation/audit.validation";
import { NextRequest, NextResponse } from "next/server";
import { withCache, invalidateCache } from "@/lib/cache";

// export async function POST(req: NextRequest): Promise<NextResponse> {
//   try {
//     const session = await getSession();
//     if (!session) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }
//     const userId = session.id;
//     const body = await req.json();

//     const parsed = AuditCreateSchema.safeParse(body);
//     if (!parsed.success) {
//       return NextResponse.json(
//         { error: parsed.error.flatten().fieldErrors },
//         { status: 400 }
//       );
//     }

//     const data = parsed.data;

//     const audit = await prisma.presentation.create({
//       data: {
//         title: data.title,
//         userId: userId,
//         categories: {
//           create: data.categories.map((cat) => ({
//             name: cat.name,
//             icon: (cat.icon && cat.icon.trim()) ? cat.icon.trim() : null,
//             questions: {
//               create: cat.questions.map((q) => ({
//                 text: q.text,
//                 options: {
//                   create: q.options.map((opt) => ({
//                     text: opt.text,
//                     points: opt.points,
//                   })),
//                 },
//               })),
//             },
//           })),
//         },
//         ...(data.summary && {
//           summary: {
//             create: {
//               categoryRecommendations: data.summary.categoryRecommendations
//                 ? JSON.stringify(data.summary.categoryRecommendations)
//                 : null,
//               nextSteps: data.summary.nextSteps
//                 ? JSON.stringify(data.summary.nextSteps)
//                 : null,
//               overallDetails: data.summary.overallDetails || null,
//             },
//           },
//         }),
//       },
//       include: {
//         categories: {
//           include: {
//             questions: {
//               include: { options: true },
//             },
//           },
//         },
//         summary: true,
//       },
//     });

//     await invalidateCache(`audit:${userId}`);
//     await invalidateCache('categories');

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Audit created successfully",
//         data: audit,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating audit:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// export async function GET(): Promise<NextResponse> {
//   try {
//     const session = await getSession();
//     if (!session) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
//     }
//     const userId = session.id;

//     return withCache(`audit:${userId}`, async () => {
//       const user = await prisma.user.findUnique({
//         where: { id: userId },
//         include: {
//           company: true,
//         },
//       });

//       if (!user) {
//         return NextResponse.json({ error: "User not found" }, { status: 404 });
//       }

//       // Check if user has an accepted invitation with a presentationId (for invited users who signed up)
//       const acceptedInvitation = await prisma.invitation.findFirst({
//         where: {
//           email: user.email,
//           status: "ACCEPTED",
//           presentationId: { not: null },
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       });

//       // Get all audits shared with this user
//       const sharedAudits = await prisma.sharedAudit.findMany({
//         where: {
//           userId: userId,
//         },
//         select: {
//           presentationId: true,
//         },
//       });

//       const sharedAuditIds = sharedAudits.map(sa => sa.presentationId);

//       let whereClause:
//         | { id: { in: string[] } }
//         | { OR: Array<{ userId: string } | { id: { in: string[] } }> }
//         | { userId: string };

//       if (acceptedInvitation?.presentationId) {
//         const auditIds = [acceptedInvitation.presentationId, ...sharedAuditIds];
//         whereClause = {
//           id: { in: auditIds },
//         };
//       } else if (sharedAuditIds.length > 0) {
//         whereClause = {
//           OR: [
//             { userId: userId },
//             { id: { in: sharedAuditIds } },
//           ],
//         };
//       } else {
//         whereClause = {
//           userId: userId,
//         };
//       }

//       const audits = await prisma.presentation.findMany({
//         where: whereClause,
//         include: {
//           categories: {
//             include: {
//               questions: {
//                 include: { options: true },
//               },
//             },
//           },
//         tests: {
//           orderBy: {
//             createdAt: 'desc',
//           },
//           take: 1,
//         },
//         },
//         orderBy: {
//           createdAt: 'desc',
//         },
//       });

//       const isInvitedUser = !!acceptedInvitation?.presentationId;

//       return NextResponse.json(
//         {
//           success: true,
//           message: "Audit fetch successfully!",
//           data: audits,
//           isInvitedUser: isInvitedUser,
//         },
//         { status: 200 }
//       );
//     });
//   } catch (error) {
//     console.error("Error fetching audits:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }


export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const userId = session.id;
    const body = await req.json();

    const parsed = AuditCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // 1️⃣ Create the main presentation
    const audit = await prisma.presentation.create({
      data: { title: data.title, userId },
    });

    const presentationId = audit.id;

    // 2️⃣ Create categories in bulk
    const categories = await prisma.category.createMany({
      data: data.categories.map(cat => ({
        name: cat.name,
        icon: cat.icon?.trim() || null,
        presentationId,
      })),
    });

    // Fetch created category IDs
    const createdCategories = await prisma.category.findMany({
      where: { presentationId },
    });

    // 3️⃣ Create questions in bulk
    const questionsToCreate: { text: string; categoryId: string }[] = [];
    const optionMap: Record<string, { text: string; points: number; questionTempId: string }[]> = {};

    data.categories.forEach((cat, index) => {
      const catId = createdCategories[index].id;
      cat.questions.forEach((q, qIndex) => {
        const tempId = `${index}-${qIndex}`; // temp mapping for options
        questionsToCreate.push({ text: q.text, categoryId: catId });
        optionMap[tempId] = q.options.map(opt => ({
          text: opt.text,
          points: opt.points,
          questionTempId: tempId,
        }));
      });
    });

    const createdQuestions = await prisma.question.createMany({
      data: questionsToCreate,
    });

    // Fetch created questions IDs
    const questionsInDb = await prisma.question.findMany({
      where: { categoryId: { in: createdCategories.map(c => c.id) } },
    });

    // 4️⃣ Create options in bulk
    const optionsToCreate: { text: string; points: number; questionId: string }[] = [];
    let counter = 0;
    data.categories.forEach((cat, ) => {
      cat.questions.forEach((q, ) => {
        const questionId = questionsInDb[counter++].id;
        q.options.forEach(opt => {
          optionsToCreate.push({
            text: opt.text,
            points: opt.points,
            questionId,
          });
        });
      });
    });

    if (optionsToCreate.length > 0) {
      await prisma.option.createMany({ data: optionsToCreate });
    }

    // 5️⃣ Create summary if exists
    if (data.summary) {
      await prisma.summary.create({
        data: {
          presentationId,
          categoryRecommendations: data.summary.categoryRecommendations
            ? JSON.stringify(data.summary.categoryRecommendations)
            : null,
          nextSteps: data.summary.nextSteps ? JSON.stringify(data.summary.nextSteps) : null,
          overallDetails: data.summary.overallDetails || null,
        },
      });
    }

    // 6️⃣ Fetch full audit with nested data
    const fullAudit = await prisma.presentation.findUnique({
      where: { id: presentationId },
      include: {
        categories: { include: { questions: { include: { options: true } } } },
        summary: true,
      },
    });

    // 7️⃣ Invalidate cache in parallel
    await Promise.all([
      invalidateCache(`audit:${userId}`),
      invalidateCache('categories'),
    ]);

    return NextResponse.json({
      success: true,
      message: "Audit created successfully",
      data: fullAudit,
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating audit:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function GET(req: Request): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.id;

    // Optional pagination
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
// :p${page}
    return withCache(`audit:${userId}`, async () => {

      // ─────────────────────────────────────────────
      // 1. RUN INITIAL QUERIES IN PARALLEL
      // ─────────────────────────────────────────────
      const [user, acceptedInvitation, sharedAudits] = await Promise.all([

        prisma.user.findUnique({
          where: { id: userId },
          select: {
            email: true,
            companyId: true,
          },
        }),

        prisma.invitation.findFirst({
          where: {
            email: undefined, // filled after user load
            status: "ACCEPTED",
            presentationId: { not: null },
          },
          orderBy: { createdAt: "desc" },
          select: { presentationId: true },
        }),

        prisma.sharedAudit.findMany({
          where: { userId },
          select: { presentationId: true },
        }),
      ]);

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Re-check invitation with email
      const invitation = await prisma.invitation.findFirst({
        where: {
          email: user.email,
          status: "ACCEPTED",
          presentationId: { not: null },
        },
        orderBy: { createdAt: "desc" },
        select: { presentationId: true },
      });

      const sharedAuditIds = sharedAudits.map(sa => sa.presentationId);

      // ─────────────────────────────────────────────
      // 2. BUILD WHERE CLAUSE
      // ─────────────────────────────────────────────
      let whereClause: any;

      if (invitation?.presentationId) {
        whereClause = {
          id: { in: [invitation.presentationId, ...sharedAuditIds] },
        };
      } else if (sharedAuditIds.length > 0) {
        whereClause = {
          OR: [
            { userId },
            { id: { in: sharedAuditIds } },
          ],
        };
      } else {
        whereClause = { userId };
      }

      // ─────────────────────────────────────────────
      // 3. MAIN OPTIMIZED QUERY
      // ─────────────────────────────────────────────
      const audits = await prisma.presentation.findMany({
        where: whereClause,

        skip: (page - 1) * limit,
        take: limit,

        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,

          categories: {
            select: {
              id: true,
              name: true,
              icon: true,

              questions: {
                select: {
                  id: true,
                  text: true,

                  options: {
                    select: {
                      id: true,
                      text: true,
                      points: true,
                    },
                  },
                },
              },
            },
          },

          tests: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              id: true,
              totalScore: true,
              createdAt: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

      // ─────────────────────────────────────────────
      // 4. COUNT FOR PAGINATION
      // ─────────────────────────────────────────────
      const total = await prisma.presentation.count({
        where: whereClause,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Audit fetch successfully!",
          data: audits,
          isInvitedUser: !!invitation?.presentationId,

          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
        { status: 200 }
      );
    });

  } catch (error) {
    console.error("Error fetching audits:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


/*
{
  "title": "Employee Performance Review 2025",
  "categories": [
    {
      "name": "Technical Skills",
      "questions": [
        {
          "text": "How well do you understand system architecture?",
          "options": [
            { "text": "Expert", "points": 5 },
            { "text": "Advanced", "points": 4 },
            { "text": "Intermediate", "points": 3 },
            { "text": "Basic", "points": 2 },
            { "text": "Beginner", "points": 1 }
          ]
        },
        {
          "text": "How comfortable are you with debugging production issues?",
          "options": [
            { "text": "Very Comfortable", "points": 5 },
            { "text": "Comfortable", "points": 4 },
            { "text": "Moderate", "points": 3 },
            { "text": "Slightly Comfortable", "points": 2 },
            { "text": "Not Comfortable", "points": 1 }
          ]
        },
        {
          "text": "How effectively do you write clean and maintainable code?",
          "options": [
            { "text": "Always", "points": 5 },
            { "text": "Often", "points": 4 },
            { "text": "Sometimes", "points": 3 },
            { "text": "Rarely", "points": 2 },
            { "text": "Never", "points": 1 }
          ]
        },
        {
          "text": "How strong is your understanding of databases and queries?",
          "options": [
            { "text": "Excellent", "points": 5 },
            { "text": "Good", "points": 4 },
            { "text": "Average", "points": 3 },
            { "text": "Basic", "points": 2 },
            { "text": "Poor", "points": 1 }
          ]
        },
        {
          "text": "How well do you handle version control (Git, etc.)?",
          "options": [
            { "text": "Expert", "points": 5 },
            { "text": "Advanced", "points": 4 },
            { "text": "Intermediate", "points": 3 },
            { "text": "Basic", "points": 2 },
            { "text": "Beginner", "points": 1 }
          ]
        }
      ]
    },
    {
      "name": "Communication & Collaboration",
      "questions": [
        {
          "text": "Do you communicate ideas clearly during meetings?",
          "options": [
            { "text": "Always", "points": 5 },
            { "text": "Often", "points": 4 },
            { "text": "Sometimes", "points": 3 },
            { "text": "Rarely", "points": 2 },
            { "text": "Never", "points": 1 }
          ]
        },
        {
          "text": "How effectively do you collaborate with team members?",
          "options": [
            { "text": "Very Effectively", "points": 5 },
            { "text": "Effectively", "points": 4 },
            { "text": "Moderately", "points": 3 },
            { "text": "Slightly", "points": 2 },
            { "text": "Poorly", "points": 1 }
          ]
        },
        {
          "text": "How do you handle conflicts within the team?",
          "options": [
            { "text": "Resolve Professionally", "points": 5 },
            { "text": "Try to Resolve", "points": 4 },
            { "text": "Avoid Conflict", "points": 3 },
            { "text": "Ignore It", "points": 2 },
            { "text": "Escalate Immediately", "points": 1 }
          ]
        },
        {
          "text": "Do you provide constructive feedback to peers?",
          "options": [
            { "text": "Always", "points": 5 },
            { "text": "Often", "points": 4 },
            { "text": "Sometimes", "points": 3 },
            { "text": "Rarely", "points": 2 },
            { "text": "Never", "points": 1 }
          ]
        },
        {
          "text": "Do you listen actively when others speak?",
          "options": [
            { "text": "Always", "points": 5 },
            { "text": "Often", "points": 4 },
            { "text": "Sometimes", "points": 3 },
            { "text": "Rarely", "points": 2 },
            { "text": "Never", "points": 1 }
          ]
        }
      ]
    }
  ]
}
*/
