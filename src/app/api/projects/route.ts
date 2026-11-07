import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const tag = searchParams.get("tag") || "";
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "popular"; // popular, latest, views
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;
    const userId = searchParams.get("userId");

    const currentUser = await getCurrentUser();

    // Build filter
    const whereClause: Prisma.ProjectWhereInput = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (category && category !== "All") {
      whereClause.category = category;
    }

    if (status && status !== "All") {
      whereClause.status = status;
    }

    if (tag) {
      whereClause.techStack = { contains: tag };
    }

    if (search.trim()) {
      whereClause.OR = [
        { title: { contains: search.trim() } },
        { summary: { contains: search.trim() } },
        { techStack: { contains: search.trim() } },
      ];
    }

    // Determine order
    let orderBy: Prisma.ProjectOrderByWithRelationInput[] = [
      { likes: { _count: "desc" } },
      { createdAt: "desc" },
    ];
    if (sort === "latest") {
      orderBy = [{ createdAt: "desc" }];
    } else if (sort === "views") {
      orderBy = [{ viewsCount: "desc" }];
    }

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy,
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
      prisma.project.count({ where: whereClause }),
    ]);

    const formattedProjects = projects.map((p) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      description: p.description,
      category: p.category,
      techStack: p.techStack,
      thumbnailUrl: p.thumbnailUrl,
      screenshots: p.screenshots ? JSON.parse(p.screenshots) : [],
      demoVideoUrl: p.demoVideoUrl,
      isVerticalVideo: p.isVerticalVideo,
      liveDemoUrl: p.liveDemoUrl,
      repoUrl: p.repoUrl,
      status: p.status,
      viewsCount: p.viewsCount,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      user: p.user,
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
      hasLiked: currentUser ? (p.likes?.length || 0) > 0 : false,
      hasBookmarked: currentUser ? (p.bookmarks?.length || 0) > 0 : false,
    }));

    return NextResponse.json({
      projects: formattedProjects,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Failed to retrieve projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to submit a project" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      summary,
      description,
      category = "Web Applications",
      techStack,
      thumbnailUrl,
      screenshots = [],
      demoVideoUrl,
      isVerticalVideo = false,
      liveDemoUrl,
      repoUrl,
      status = "COMPLETED",
      createAnnouncementPost = true,
    } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Project title must be at least 3 characters" },
        { status: 400 },
      );
    }

    if (!summary || typeof summary !== "string" || summary.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a short summary (at least 10 characters)" },
        { status: 400 },
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide a detailed description (at least 20 characters)" },
        { status: 400 },
      );
    }

    const project = await prisma.project.create({
      data: {
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim(),
        category,
        techStack: typeof techStack === "string" ? techStack.trim() : "React, TypeScript",
        thumbnailUrl: thumbnailUrl || null,
        screenshots: Array.isArray(screenshots) ? JSON.stringify(screenshots) : "[]",
        demoVideoUrl: demoVideoUrl || null,
        isVerticalVideo: Boolean(isVerticalVideo),
        liveDemoUrl: liveDemoUrl ? liveDemoUrl.trim() : null,
        repoUrl: repoUrl ? repoUrl.trim() : null,
        status,
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
          },
        },
      },
    });

    // Optionally auto-create community announcement post
    if (createAnnouncementPost) {
      await prisma.post.create({
        data: {
          content: `🚀 Just published a new project: "${project.title}"!\n\n${project.summary}\n\nCheck out the full showcase and let me know your thoughts!`,
          postType: "PROJECT_ANNOUNCEMENT",
          projectId: project.id,
          userId: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        screenshots: project.screenshots ? JSON.parse(project.screenshots) : [],
        likesCount: 0,
        commentsCount: 0,
        hasLiked: false,
        hasBookmarked: false,
      },
      message: "Project successfully created and published!",
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
