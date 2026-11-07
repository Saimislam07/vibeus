import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const reports = await prisma.report.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Populate target preview information
    const populated = await Promise.all(
      reports.map(async (r) => {
        let targetSummary: string = r.targetId;
        if (r.targetType === "POST") {
          const post = await prisma.post.findUnique({
            where: { id: r.targetId },
            select: { content: true, user: { select: { name: true } } },
          });
          if (post) targetSummary = `Post by ${post.user.name}: "${post.content.slice(0, 60)}..."`;
        } else if (r.targetType === "PROJECT") {
          const project = await prisma.project.findUnique({
            where: { id: r.targetId },
            select: { title: true, user: { select: { name: true } } },
          });
          if (project) targetSummary = `Project "${project.title}" by ${project.user.name}`;
        } else if (r.targetType === "COMMENT") {
          const comment = await prisma.comment.findUnique({
            where: { id: r.targetId },
            select: { content: true, user: { select: { name: true } } },
          });
          if (comment)
            targetSummary = `Comment by ${comment.user.name}: "${comment.content.slice(0, 50)}..."`;
        } else if (r.targetType === "USER") {
          const user = await prisma.user.findUnique({
            where: { id: r.targetId },
            select: { name: true, username: true },
          });
          if (user) targetSummary = `User Profile: ${user.name} (@${user.username})`;
        }

        return {
          ...r,
          targetSummary,
        };
      }),
    );

    return NextResponse.json({ reports: populated });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    console.error("Admin reports error:", error);
    return NextResponse.json({ error: "Failed to retrieve reports" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const { reportId, status, actionTaken } = await req.json();

    if (!reportId || !["RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: `REPORT_${status}`,
        target: `Report #${report.id.slice(-6)} (${report.targetType})`,
        details: actionTaken || `Marked report as ${status}`,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    console.error("Error updating report:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
