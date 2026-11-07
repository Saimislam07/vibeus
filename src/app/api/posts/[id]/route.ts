import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const currentUser = await getCurrentUser();

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            role: true,
            isVerified: true,
            experienceLevel: true,
            bio: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            summary: true,
            category: true,
            techStack: true,
            thumbnailUrl: true,
            liveDemoUrl: true,
            repoUrl: true,
            status: true,
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

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({
      post: {
        id: post.id,
        content: post.content,
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
        postType: post.postType,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user,
        project: post.project,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        hasLiked: currentUser ? (post.likes?.length || 0) > 0 : false,
        hasBookmarked: currentUser ? (post.bookmarks?.length || 0) > 0 : false,
      },
    });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to retrieve post" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You are not authorized to edit this post" },
        { status: 403 },
      );
    }

    const { content, mediaUrl } = await req.json();
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        content: content.trim(),
        mediaUrl: mediaUrl !== undefined ? mediaUrl : post.mediaUrl,
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error("Error editing post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "You are not authorized to delete this post" },
        { status: 403 },
      );
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Post successfully deleted" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
