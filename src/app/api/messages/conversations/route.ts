import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all messages involving current user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
      },
    });

    // Group by other user ID
    const conversationMap = new Map<
      string,
      {
        user: (typeof messages)[number]["sender"];
        lastMessage: {
          id: string;
          content: string;
          createdAt: Date;
          isSender: boolean;
          isRead: boolean;
        };
        unreadCount: number;
      }
    >();

    for (const msg of messages) {
      const otherUser = msg.senderId === user.id ? msg.receiver : msg.sender;
      if (!conversationMap.has(otherUser.id)) {
        conversationMap.set(otherUser.id, {
          user: otherUser,
          lastMessage: {
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            isSender: msg.senderId === user.id,
            isRead: msg.isRead,
          },
          unreadCount: 0,
        });
      }

      if (msg.receiverId === user.id && !msg.isRead) {
        const conv = conversationMap.get(otherUser.id);
        if (conv) conv.unreadCount += 1;
      }
    }

    const conversations = Array.from(conversationMap.values());

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json({ error: "Failed to retrieve conversations" }, { status: 500 });
  }
}
