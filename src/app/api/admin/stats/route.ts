import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await requireAdmin();

    const [
      totalUsers,
      verifiedUsers,
      suspendedUsers,
      bannedUsers,
      totalProjects,
      totalPosts,
      totalVideos,
      totalComments,
      pendingReports,
      recentUsers,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({ where: { isSuspended: true } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.project.count(),
      prisma.post.count(),
      prisma.project.count({ where: { demoVideoUrl: { not: null } } }),
      prisma.comment.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          avatarUrl: true,
          role: true,
          isVerified: true,
          isSuspended: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: { name: true, username: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        totalUsers,
        activeUsers: totalUsers - (suspendedUsers + bannedUsers),
        verifiedUsers,
        suspendedUsers,
        bannedUsers,
        totalProjects,
        totalPosts,
        totalVideos,
        totalComments,
        pendingReports,
      },
      recentUsers,
      recentAuditLogs,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to retrieve admin stats" }, { status: 500 });
  }
}
