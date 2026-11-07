import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [savedProjects, savedPosts] = await Promise.all([
      prisma.bookmark.findMany({
        where: { userId: user.id, projectId: { not: null } },
        orderBy: { createdAt: "desc" },
        include: {
          project: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatarUrl: true,
                  isVerified: true,
                },
              },
              _count: {
                select: { likes: true, comments: true },
              },
            },
          },
        },
      }),
      prisma.bookmark.findMany({
        where: { userId: user.id, postId: { not: null } },
        orderBy: { createdAt: "desc" },
        include: {
          post: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatarUrl: true,
                  isVerified: true,
                },
              },
              project: {
                select: {
                  id: true,
                  title: true,
                  summary: true,
                },
              },
              _count: {
                select: { likes: true, comments: true },
              },
            },
          },
        },
      }),
    ]);

    const formattedProjects = savedProjects
      .filter((b) => b.project)
      .map((b) => ({
        bookmarkId: b.id,
        savedAt: b.createdAt,
        ...b.project,
        screenshots: b.project?.screenshots ? JSON.parse(b.project.screenshots) : [],
        likesCount: b.project?._count.likes || 0,
        commentsCount: b.project?._count.comments || 0,
        hasLiked: true,
        hasBookmarked: true,
      }));

    const formattedPosts = savedPosts
      .filter((b) => b.post)
      .map((b) => ({
        bookmarkId: b.id,
        savedAt: b.createdAt,
        ...b.post,
        likesCount: b.post?._count.likes || 0,
        commentsCount: b.post?._count.comments || 0,
        hasLiked: true,
        hasBookmarked: true,
      }));

    return NextResponse.json({
      projects: formattedProjects,
      posts: formattedPosts,
    });
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json({ error: "Failed to retrieve saved bookmarks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to save items", requireLogin: true },
        { status: 401 },
      );
    }

    const { postId, projectId } = await req.json();

    if (!postId && !projectId) {
      return NextResponse.json({ error: "Provide postId or projectId" }, { status: 400 });
    }

    if (postId) {
      const existing = await prisma.bookmark.findFirst({
        where: { userId: user.id, postId },
      });

      if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        return NextResponse.json({ bookmarked: false, message: "Removed from saved items" });
      } else {
        await prisma.bookmark.create({
          data: { userId: user.id, postId },
        });
        return NextResponse.json({ bookmarked: true, message: "Saved to bookmarks" });
      }
    }

    if (projectId) {
      const existing = await prisma.bookmark.findFirst({
        where: { userId: user.id, projectId },
      });

      if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        return NextResponse.json({ bookmarked: false, message: "Removed from saved projects" });
      } else {
        await prisma.bookmark.create({
          data: { userId: user.id, projectId },
        });
        return NextResponse.json({ bookmarked: true, message: "Saved to projects" });
      }
    }
  } catch (error) {
    console.error("Error saving bookmark:", error);
    return NextResponse.json({ error: "Failed to process bookmark" }, { status: 500 });
  }
}
