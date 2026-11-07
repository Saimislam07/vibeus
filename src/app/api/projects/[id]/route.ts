import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    // Increment view count atomically
    const project = await prisma.project.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            role: true,
            isVerified: true,
            bio: true,
            githubUrl: true,
            portfolioUrl: true,
            linkedinUrl: true,
            twitterUrl: true,
            district: true,
            country: true,
            skills: true,
            experienceLevel: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: currentUser
          ? {
              where: { userId: currentUser.id },
              select: { id: true },
            }
          : false,
        bookmarks: currentUser
          ? {
              where: { userId: currentUser.id },
              select: { id: true },
            }
          : false,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        id: project.id,
        title: project.title,
        summary: project.summary,
        description: project.description,
        category: project.category,
        techStack: project.techStack,
        thumbnailUrl: project.thumbnailUrl,
        screenshots: project.screenshots ? JSON.parse(project.screenshots) : [],
        demoVideoUrl: project.demoVideoUrl,
        isVerticalVideo: project.isVerticalVideo,
        liveDemoUrl: project.liveDemoUrl,
        repoUrl: project.repoUrl,
        status: project.status,
        viewsCount: project.viewsCount,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        user: project.user,
        likesCount: project._count.likes,
        commentsCount: project._count.comments,
        hasLiked: currentUser ? (project.likes?.length || 0) > 0 : false,
        hasBookmarked: currentUser ? (project.bookmarks?.length || 0) > 0 : false,
      },
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to retrieve project" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You are not authorized to edit this project" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      title,
      summary,
      description,
      category,
      techStack,
      thumbnailUrl,
      screenshots,
      demoVideoUrl,
      isVerticalVideo,
      liveDemoUrl,
      repoUrl,
      status,
    } = body;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: title ? title.trim() : project.title,
        summary: summary ? summary.trim() : project.summary,
        description: description ? description.trim() : project.description,
        category: category || project.category,
        techStack: techStack !== undefined ? techStack : project.techStack,
        thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : project.thumbnailUrl,
        screenshots: screenshots !== undefined ? JSON.stringify(screenshots) : project.screenshots,
        demoVideoUrl: demoVideoUrl !== undefined ? demoVideoUrl : project.demoVideoUrl,
        isVerticalVideo:
          isVerticalVideo !== undefined ? Boolean(isVerticalVideo) : project.isVerticalVideo,
        liveDemoUrl: liveDemoUrl !== undefined ? liveDemoUrl : project.liveDemoUrl,
        repoUrl: repoUrl !== undefined ? repoUrl : project.repoUrl,
        status: status || project.status,
      },
    });

    return NextResponse.json({
      success: true,
      project: {
        ...updated,
        screenshots: updated.screenshots ? JSON.parse(updated.screenshots) : [],
      },
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You are not authorized to delete this project" },
        { status: 403 },
      );
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
