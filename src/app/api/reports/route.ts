import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Please sign in to submit a report", requireLogin: true },
        { status: 401 },
      );
    }

    const { targetType, targetId, reason } = await req.json();

    if (!targetType || !targetId || !reason) {
      return NextResponse.json(
        { error: "targetType, targetId, and reason are required" },
        { status: 400 },
      );
    }

    if (!["POST", "PROJECT", "COMMENT", "USER"].includes(targetType)) {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        targetType,
        targetId,
        reason: reason.trim(),
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      report,
      message: "Thank you for your report. Our moderation team will review this content.",
    });
  } catch (error) {
    console.error("Report submission error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
