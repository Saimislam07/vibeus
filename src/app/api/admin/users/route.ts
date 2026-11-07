import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";
    const role = searchParams.get("role");
    const status = searchParams.get("status"); // all, active, suspended, banned
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    const whereClause: Prisma.UserWhereInput = {};

    if (search.trim()) {
      whereClause.OR = [
        { name: { contains: search.trim() } },
        { username: { contains: search.trim() } },
        { email: { contains: search.trim() } },
      ];
    }

    if (role && role !== "ALL") {
      whereClause.role = role;
    }

    if (status === "SUSPENDED") {
      whereClause.isSuspended = true;
    } else if (status === "BANNED") {
      whereClause.isBanned = true;
    } else if (status === "ACTIVE") {
      whereClause.isSuspended = false;
      whereClause.isBanned = false;
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limit,
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
          isBanned: true,
          suspensionReason: true,
          createdAt: true,
          _count: {
            select: {
              projects: true,
              posts: true,
              reports: true,
            },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Failed to retrieve users" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await req.json();
    const { userId, action, reason, newRole } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Protect super admin from self-suspension or demoting primary admin
    if (
      targetUser.email === "admin@devpulse.io" &&
      (action === "SUSPEND" || action === "BAN" || action === "ROLE_CHANGE")
    ) {
      return NextResponse.json(
        { error: "Cannot modify primary Super Admin root account" },
        { status: 400 },
      );
    }

    let updateData: Prisma.UserUpdateInput = {};
    let auditAction = "";
    let auditDetails = reason || "";

    switch (action) {
      case "SUSPEND":
        updateData = {
          isSuspended: true,
          suspensionReason: reason || "Suspended by Administrator",
        };
        auditAction = "SUSPEND_USER";
        break;
      case "RESTORE":
        updateData = { isSuspended: false, isBanned: false, suspensionReason: null };
        auditAction = "RESTORE_USER";
        break;
      case "BAN":
        updateData = {
          isBanned: true,
          isSuspended: false,
          suspensionReason: reason || "Banned for terms violation",
        };
        auditAction = "BAN_USER";
        break;
      case "VERIFY":
        updateData = { isVerified: true };
        auditAction = "VERIFY_USER";
        break;
      case "ROLE_CHANGE":
        if (!["USER", "MODERATOR", "ADMIN"].includes(newRole)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        updateData = { role: newRole };
        auditAction = "ROLE_CHANGE";
        auditDetails = `Changed role from ${targetUser.role} to ${newRole}`;
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: auditAction,
        target: `${targetUser.name} (@${targetUser.username})`,
        details: auditDetails,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `User ${targetUser.username} successfully updated (${action})`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_NOT_ADMIN") {
      return NextResponse.json({ error: "Super Admin access required" }, { status: 403 });
    }
    console.error("Admin update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
