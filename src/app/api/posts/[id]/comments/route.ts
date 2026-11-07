import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;

    const comments = await prisma.comment.findMany({
      where: { postId },
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
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to retrieve comments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to leave a comment", requireLogin: true },
        { status: 401 },
      );
    }

    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment cannot be blank" }, { status: 400 });
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "Comment must be under 1000 characters" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        postId: post.id,
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

    // Notify author if commenter is someone else
    if (post.userId !== user.id) {
      await prisma.notification.create({
        data: {
          recipientId: post.userId,
          senderId: user.id,
          type: "POST_COMMENT",
          title: "New Comment",
          message: `${user.name} commented on your post: "${content.trim().slice(0, 60)}..."`,
          link: `/posts/${post.id}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      comment,
      message: "Comment posted",
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
