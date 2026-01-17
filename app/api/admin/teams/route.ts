import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Get all accepted invitations to identify invited users
    const acceptedInvitations = await prisma.invitation.findMany({
      where: {
        status: "ACCEPTED",
      },
      select: {
        email: true,
      },
    });

    const invitedUserEmails = new Set(acceptedInvitations.map((inv) => inv.email));

    // Get all companies with their users and audits
    const companies = await prisma.company.findMany({
      include: {
        users: {
          include: {
            presentations: {
              include: {
                tests: {
                  orderBy: {
                    createdAt: "desc",
                  },
                  take: 1,
                  select: {
                    totalScore: true,
                    createdAt: true,
                  },
                },
                _count: {
                  select: {
                    tests: true,
                  },
                },
                invitations: {
                  where: {
                    status: "ACCEPTED",
                  },
                  select: {
                    email: true,
                  },
                },
                sharedWith: {
                  select: {
                    userId: true,
                    user: {
                      select: {
                        id: true,
                        name: true,
                        email: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
          orderBy: {
            name: "asc", // Sort members by name for better display
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Get all users by email for invitation lookups
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    const usersByEmail = new Map(allUsers.map(u => [u.email, u]));

    // Transform the data to include member counts and audit assignments
    const teamsData = companies.map((company) => {
      // Get all users in this company (excluding invited users for main members)
      const mainUsers = company.users.filter(
        (user) => !invitedUserEmails.has(user.email)
      );

      // Get all audits for this company's users (including all users)
      const audits = company.users.flatMap((user) =>
        user.presentations.map((presentation) => {
          // Get assigned members from invitations (accepted invitations with presentationId)
          // Only include members from the same company
          const assignedFromInvitations = presentation.invitations
            .filter(inv => inv.email && usersByEmail.has(inv.email))
            .map(inv => usersByEmail.get(inv.email)!)
            .filter(assignedUser => 
              assignedUser.id !== user.id && // Exclude the creator
              company.users.some(cu => cu.id === assignedUser.id) // Same company
            );

          // Get assigned members from shared audits
          // Only include members from the same company
          const assignedFromShares = presentation.sharedWith
            .map(share => share.user)
            .filter(assignedUser => 
              assignedUser.id !== user.id && // Exclude the creator
              company.users.some(cu => cu.id === assignedUser.id) // Same company
            );

          // Combine and deduplicate assigned members
          const assignedMemberIds = new Set([
            ...assignedFromInvitations.map(u => u.id),
            ...assignedFromShares.map(u => u.id),
          ]);
          
          const assignedMembers = Array.from(assignedMemberIds).map(id => {
            const member = assignedFromInvitations.find(u => u.id === id) || 
                          assignedFromShares.find(u => u.id === id);
            return member!;
          });

          return {
            id: presentation.id,
            title: presentation.title,
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            testCount: (presentation as any)._count?.tests || 0,
            latestScore: presentation.tests?.[0]?.totalScore,
            createdAt: presentation.createdAt,
            assignedMembers: assignedMembers.map(m => ({
              id: m.id,
              name: m.name,
              email: m.email,
            })),
          };
        })
      );

      // Include all members with their details
      // Only show audit count for members who created audits (not assigned ones)
      const allMembers = company.users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyRole: user.companyRole || null,
        auditCount: user.presentations.length, // Only audits they created
        isInvited: invitedUserEmails.has(user.email),
      }));

      return {
        id: company.id,
        name: company.name,
        logoUrl: company.logoUrl,
        memberCount: mainUsers.length,
        totalMembers: company.users.length, // Includes invited users
        members: allMembers, // Show all members
        audits: audits,
        createdAt: company.createdAt,
      };
    });

    return NextResponse.json(
      {
        message: "Teams fetched successfully",
        teams: teamsData,
        total: teamsData.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

