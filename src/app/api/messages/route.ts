import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const peerId = searchParams.get("userId");

    if (!peerId) {
      return NextResponse.json({ error: "Peer user ID is required" }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, receiverId: peerId },
          { senderId: peerId, receiverId: user.id },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark unread messages sent by peer to current user as read
    await prisma.message.updateMany({
      where: {
        senderId: peerId,
        receiverId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    });

    // Also get peer user info
    const peerUser = await prisma.user.findUnique({
      where: { id: peerId },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
        isVerified: true,
        skills: true,
        experienceLevel: true,
      },
    });

    return NextResponse.json({
      messages,
      peer: peerUser,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to retrieve messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId, content } = await req.json();

    if (!receiverId || typeof receiverId !== "string") {
      return NextResponse.json({ error: "Recipient is required" }, { status: 400 });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { id: true, isBanned: true, isSuspended: true },
    });

    if (!receiver || receiver.isBanned) {
      return NextResponse.json({ error: "Unable to message this user" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: user.id,
        receiverId,
        content: content.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
