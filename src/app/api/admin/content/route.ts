import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const { targetType, targetId, reason } = await req.json();

    if (!targetType || !targetId) {
      return NextResponse.json({ error: "targetType and targetId are required" }, { status: 400 });
    }

    let targetTitle = targetId;

    if (targetType === "POST") {
      const post = await prisma.post.findUnique({ where: { id: targetId } });
      if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
      targetTitle = `Post "${post.content.slice(0, 40)}..."`;
      await prisma.post.delete({ where: { id: targetId } });
    } else if (targetType === "PROJECT") {
      const project = await prisma.project.findUnique({ where: { id: targetId } });
      if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
      targetTitle = `Project "${project.title}"`;
      await prisma.project.delete({ where: { id: targetId } });
    } else if (targetType === "COMMENT") {
      const comment = await prisma.comment.findUnique({ where: { id: targetId } });
      if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
      targetTitle = `Comment "${comment.content.slice(0, 30)}..."`;
      await prisma.comment.delete({ where: { id: targetId } });
    } else {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
    }

    // Record in Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: `DELETE_${targetType}`,
        target: targetTitle,
        details: reason || "Removed by administrator due to moderation guidelines",
      },
    });

    return NextResponse.json({
      success: true,
      message: `${targetType} successfully removed by Admin`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    console.error("Admin content removal error:", error);
    return NextResponse.json({ error: "Failed to remove content" }, { status: 500 });
  }
}
