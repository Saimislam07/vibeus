import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const auditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ auditLogs });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to retrieve audit logs" }, { status: 500 });
  }
}
