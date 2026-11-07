import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    // Query projects that have a demo video url
    const projects = await prisma.project.findMany({
      where: {
        demoVideoUrl: { not: null },
      },
      orderBy: [{ viewsCount: "desc" }, { createdAt: "desc" }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            role: true,
            isVerified: true,
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

    const formattedReels = projects.map((p) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      description: p.description,
      category: p.category,
      techStack: p.techStack,
      thumbnailUrl: p.thumbnailUrl,
      demoVideoUrl: p.demoVideoUrl,
      isVerticalVideo: p.isVerticalVideo,
      liveDemoUrl: p.liveDemoUrl,
      repoUrl: p.repoUrl,
      status: p.status,
      viewsCount: p.viewsCount,
      user: p.user,
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
      hasLiked: currentUser ? (p.likes?.length || 0) > 0 : false,
      hasBookmarked: currentUser ? (p.bookmarks?.length || 0) > 0 : false,
    }));

    return NextResponse.json({ reels: formattedReels });
  } catch (error) {
    console.error("Error fetching reels:", error);
    return NextResponse.json({ error: "Failed to retrieve video reels" }, { status: 500 });
  }
}
