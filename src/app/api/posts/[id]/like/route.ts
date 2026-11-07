import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: postId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to like this post", requireLogin: true },
        { status: 401 },
      );
    }

    // Verify post existence
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, userId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if like currently exists (enforces strictly ONE reaction type: Like)
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id,
        },
      },
    });

    let liked = false;

    if (existingLike) {
      // Toggle off: Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      liked = false;
    } else {
      // Toggle on: Like (DB unique constraint @@unique([userId, postId]) guarantees max 1 like per user)
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: post.id,
        },
      });
      liked = true;

      // Create notification for post author if liker is not the author
      if (post.userId !== user.id) {
        await prisma.notification.create({
          data: {
            recipientId: post.userId,
            senderId: user.id,
            type: "POST_LIKE",
            title: "New Post Like",
            message: `${user.name} liked your post.`,
            link: `/posts/${post.id}`,
          },
        });
      }
    }

    // Live count from database
    const likesCount = await prisma.like.count({
      where: { postId: post.id },
    });

    return NextResponse.json({
      success: true,
      liked,
      likesCount,
    });
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json({ error: "Failed to process like action" }, { status: 500 });
  }
}
