import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const currentUser = await getCurrentUser();

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatarUrl: true,
        coverUrl: true,
        bio: true,
        district: true,
        country: true,
        skills: true,
        experienceLevel: true,
        learningGoals: true,
        githubUrl: true,
        portfolioUrl: true,
        linkedinUrl: true,
        twitterUrl: true,
        role: true,
        isVerified: true,
        isProfilePublic: true,
        showEmail: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine connection status if current user is logged in
    let connectionStatus: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "CONNECTED" | "SELF" =
      "NONE";
    let connectionId: string | null = null;

    if (currentUser) {
      if (currentUser.id === user.id) {
        connectionStatus = "SELF";
      } else {
        const connection = await prisma.connection.findFirst({
          where: {
            OR: [
              { senderId: currentUser.id, receiverId: user.id },
              { senderId: user.id, receiverId: currentUser.id },
            ],
          },
        });

        if (connection) {
          connectionId = connection.id;
          if (connection.status === "ACCEPTED") {
            connectionStatus = "CONNECTED";
          } else if (connection.senderId === currentUser.id) {
            connectionStatus = "PENDING_SENT";
          } else {
            connectionStatus = "PENDING_RECEIVED";
          }
        }
      }
    }

    // Connections count
    const connectionsCount = await prisma.connection.count({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
    });

    // Sanitized profile (respect privacy settings)
    const sanitizedProfile = {
      ...user,
      email: user.showEmail || (currentUser && currentUser.id === user.id) ? user.email : null,
      connectionsCount,
      connectionStatus,
      connectionId,
    };

    return NextResponse.json({ profile: sanitizedProfile });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Failed to retrieve profile" }, { status: 500 });
  }
}
