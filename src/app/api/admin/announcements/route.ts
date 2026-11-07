import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json({ error: "Failed to retrieve announcements" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const { title, content, type = "INFO", isActive = true } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        type,
        isActive: Boolean(isActive),
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE_ANNOUNCEMENT",
        target: announcement.title,
        details: `Type: ${type}, Active: ${isActive}`,
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();

    const { id, isActive } = await req.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const updated = await prisma.announcement.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
