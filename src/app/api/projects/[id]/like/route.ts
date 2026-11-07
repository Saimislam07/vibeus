import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to like this project", requireLogin: true },
        { status: 401 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, title: true, userId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check existing like (Enforces ONE single Like reaction)
    const existingLike = await prisma.projectLike.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: project.id,
        },
      },
    });

    let liked = false;

    if (existingLike) {
      // Toggle off: Unlike
      await prisma.projectLike.delete({
        where: { id: existingLike.id },
      });
      liked = false;
    } else {
      // Toggle on: Like (DB constraint @@unique([userId, projectId]) prevents any duplicate)
      await prisma.projectLike.create({
        data: {
          userId: user.id,
          projectId: project.id,
        },
      });
      liked = true;

      // Send notification to project creator
      if (project.userId !== user.id) {
        await prisma.notification.create({
          data: {
            recipientId: project.userId,
            senderId: user.id,
            type: "PROJECT_LIKE",
            title: "Project Liked",
            message: `${user.name} liked your project "${project.title}".`,
            link: `/projects/${project.id}`,
          },
        });
      }
    }

    const likesCount = await prisma.projectLike.count({
      where: { projectId: project.id },
    });

    return NextResponse.json({
      success: true,
      liked,
      likesCount,
    });
  } catch (error) {
    console.error("Project like error:", error);
    return NextResponse.json({ error: "Failed to process project like" }, { status: 500 });
  }
}
