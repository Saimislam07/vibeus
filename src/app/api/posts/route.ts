import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;
    const feedType = searchParams.get("feedType") || "recommended"; // recommended, latest, following
    const userIdFilter = searchParams.get("userId");
    const projectOnly = searchParams.get("projectOnly") === "true";

    const currentUser = await getCurrentUser();

    // Query builder
    const whereClause: Prisma.PostWhereInput = {};

    if (userIdFilter) {
      whereClause.userId = userIdFilter;
    }

    if (projectOnly) {
      whereClause.projectId = { not: null };
    }

    if (feedType === "following" && currentUser) {
      // Find all accepted connections
      const connections = await prisma.connection.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }],
        },
      });

      const connectedUserIds = connections.map((c) =>
        c.senderId === currentUser.id ? c.receiverId : c.senderId,
      );
      connectedUserIds.push(currentUser.id); // Include user's own posts

      whereClause.userId = { in: connectedUserIds };
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy:
          feedType === "recommended"
            ? [{ likes: { _count: "desc" } }, { createdAt: "desc" }]
            : { createdAt: "desc" },
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
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    const formattedPosts = posts.map((post) => ({
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
    }));

    return NextResponse.json({
      posts: formattedPosts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to retrieve posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to create a post" },
        { status: 401 },
      );
    }

    const { content, mediaUrl, mediaType, postType = "GENERAL", projectId } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Post content cannot be empty" }, { status: 400 });
    }

    if (content.length > 3000) {
      return NextResponse.json(
        { error: "Post content exceeds the 3000 characters limit" },
        { status: 400 },
      );
    }

    // Verify projectId if provided
    if (projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project) {
        return NextResponse.json({ error: "Referenced project does not exist" }, { status: 404 });
      }
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        postType,
        projectId: projectId || null,
        userId: user.id,
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
            experienceLevel: true,
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
      },
    });

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        likesCount: 0,
        commentsCount: 0,
        hasLiked: false,
        hasBookmarked: false,
      },
      message: "Post published successfully!",
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
