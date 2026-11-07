import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Fetch live unread counts
    const [unreadNotifications, pendingConnections] = await Promise.all([
      prisma.notification.count({
        where: { recipientId: user.id, isRead: false },
      }),
      prisma.connection.count({
        where: { receiverId: user.id, status: "PENDING" },
      }),
    ]);

    return NextResponse.json({
      user,
      unreadNotifications,
      pendingConnections,
    });
  } catch (error) {
    console.error("Error in /api/auth/me:", error);
    return NextResponse.json({ user: null });
  }
}
