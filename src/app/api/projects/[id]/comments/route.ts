import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;

    const comments = await prisma.projectComment.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            role: true,
            isVerified: true,
          },
        },
      },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Error fetching project comments:", error);
    return NextResponse.json({ error: "Failed to retrieve project comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to leave feedback on this project", requireLogin: true },
        { status: 401 },
      );
    }

    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment cannot be blank" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, title: true, userId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const comment = await prisma.projectComment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        projectId: project.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            role: true,
            isVerified: true,
          },
        },
      },
    });

    // Notify project author if someone else commented
    if (project.userId !== user.id) {
      await prisma.notification.create({
        data: {
          recipientId: project.userId,
          senderId: user.id,
          type: "PROJECT_COMMENT",
          title: "New Feedback on Project",
          message: `${user.name} commented on "${project.title}": "${content.trim().slice(0, 50)}..."`,
          link: `/projects/${project.id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      comment,
      message: "Comment posted successfully",
    });
  } catch (error) {
    console.error("Error posting project comment:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
